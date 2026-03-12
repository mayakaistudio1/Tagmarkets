import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApplicationSchema, insertPromoApplicationSchema, insertDennisPromoSchema, insertInviteEventSchema, insertInviteGuestSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { registerLiveAvatarRoutes } from "./integrations/liveavatar";
import { registerMariaChatRoutes } from "./integrations/maria-chat";
import { registerDennisChatRoutes } from "./integrations/dennis-chat";
import { db } from "./db";
import { chatSessions, chatMessages } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { objectStorageClient } from "./replit_integrations/object_storage";
import { syncAllChatSessions, appendPromoApplicationToSheet, syncAllPromoApplications } from "./googleSheets";
import { MARIA_SYSTEM_PROMPT_DE, MARIA_SYSTEM_PROMPT_EN, MARIA_SYSTEM_PROMPT_RU } from "./integrations/maria-chat";
import { LIVEAVATAR_SYSTEM_PROMPT } from "./integrations/liveavatar";
import OpenAI from "openai";
import { sendTelegramNotification, formatPromoApplicationMessage } from "./integrations/telegram-notify";
import { startVerificationPoller, checkAndProcessVerifications } from "./integrations/promo-verification-poller";
import { registerPartnerBotRoutes, notifyPartnerNewRegistration } from "./integrations/partner-bot";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

function getUploadBucketName(): string {
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").map(p => p.trim()).filter(Boolean);
  if (publicPaths.length === 0) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not set");
  const parts = publicPaths[0].split("/").filter(Boolean);
  return parts[0];
}

function getUploadPrefix(): string {
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").map(p => p.trim()).filter(Boolean);
  if (publicPaths.length === 0) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not set");
  const parts = publicPaths[0].split("/").filter(Boolean);
  return parts.slice(1).join("/");
}

function requireAdmin(req: any, res: any): boolean {
  const password = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const LOGIN_RATE_LIMIT = 5;
const LOGIN_RATE_WINDOW = 15 * 60 * 1000;

function checkLoginRate(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.lastAttempt > LOGIN_RATE_WINDOW) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  if (entry.count >= LOGIN_RATE_LIMIT) return false;
  entry.count++;
  entry.lastAttempt = now;
  return true;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  registerLiveAvatarRoutes(app);
  registerMariaChatRoutes(app);
  registerDennisChatRoutes(app);
  registerPartnerBotRoutes(app);

  const objectStorage = new (await import("./replit_integrations/object_storage")).ObjectStorageService();
  app.get("/uploads/:filename", async (req, res, next) => {
    try {
      const filename = req.params.filename;
      const file = await objectStorage.searchPublicObject(`uploads/${filename}`);
      if (!file) {
        return next();
      }
      await objectStorage.downloadObject(file, res, 86400);
    } catch (error) {
      console.error("Error serving upload:", error);
      if (!res.headersSent) {
        next(error);
      }
    }
  });

  app.get("/assets/:filename", async (req, res, next) => {
    try {
      const filename = req.params.filename;
      const file = await objectStorage.searchPublicObject(filename);
      if (!file) {
        return next();
      }
      await objectStorage.downloadObject(file, res, 86400);
    } catch (error) {
      console.error("Error serving asset:", error);
      if (!res.headersSent) {
        next(error);
      }
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partner/promo-apply", async (req, res) => {
    try {
      const validatedData = insertPromoApplicationSchema.parse(req.body);

      if (!validatedData.cuNumber.toUpperCase().startsWith("CU")) {
        return res.status(400).json({ error: "CU-Nummer muss mit 'CU' beginnen" });
      }

      const existing = await storage.findDuplicatePromoApplication(validatedData.email, validatedData.cuNumber);
      const isDuplicate = !!existing;

      const application = await storage.createPromoApplication({
        ...validatedData,
        ...(isDuplicate ? { status: "duplicate" } : {}),
      });

      let promoTitle: string | undefined;
      if (validatedData.promoId) {
        const promo = await storage.getDennisPromo(validatedData.promoId);
        promoTitle = promo?.title;
      }
      const tgMessage = formatPromoApplicationMessage({
        name: validatedData.name,
        email: validatedData.email,
        cuNumber: validatedData.cuNumber,
        promoTitle,
        isDuplicate,
      });
      sendTelegramNotification(tgMessage).catch((err) =>
        console.error("TG notify error:", err)
      );

      appendPromoApplicationToSheet({
        name: validatedData.name,
        email: validatedData.email,
        cuNumber: validatedData.cuNumber,
        promoTitle,
        status: isDuplicate ? "duplicate" : "pending",
        createdAt: application.createdAt,
      }).catch((err) => console.error("Sheets append error:", err));

      res.status(201).json(application);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating promo application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/promo-applications", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const applications = await storage.getPromoApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching promo applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/promo-applications/:id/status", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!["pending", "approved", "rejected", "verified"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      let updated;
      if (status === "verified") {
        updated = await storage.markPromoApplicationVerified(id);

        const allApps = await storage.getPromoApplications();
        const application = allApps.find(a => a.id === id);
        if (application) {
          const { sendPromoVerificationEmail } = await import("./integrations/resend-email");
          const emailSent = await sendPromoVerificationEmail(application.email, application.name);
          if (emailSent) {
            await storage.markPromoApplicationEmailSent(id);
          }

          const { sendTelegramNotification } = await import("./integrations/telegram-notify");
          sendTelegramNotification(
            `✅ <b>Promo Verified (Main Admin)</b>\n\n` +
            `👤 ${application.name}\n` +
            `📧 ${application.email}\n` +
            `🔢 ${application.cuNumber}\n` +
            `📨 Email: ${emailSent ? "Sent" : "Failed"}\n` +
            `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`
          ).catch(err => console.error("TG notify error:", err));

          try {
            const { syncAllPromoApplications } = await import("./googleSheets");
            await syncAllPromoApplications();
          } catch (err) {
            console.error("Google Sheet sync error:", err);
          }
        }
      } else {
        updated = await storage.updatePromoApplicationStatus(id, status);
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating promo application status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  function requirePromoAdmin(req: any, res: any): boolean {
    const password = req.headers['x-promo-password'] || req.body?.password;
    if (!password || password !== (process.env.PROMO_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD)) {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    }
    return true;
  }

  app.post("/api/promo-admin/login", async (req, res) => {
    const ip = req.ip || "unknown";
    if (!checkLoginRate(ip)) {
      return res.status(429).json({ error: "Too many login attempts" });
    }
    const { password } = req.body;
    const validPassword = process.env.PROMO_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    if (password === validPassword) {
      return res.json({ success: true });
    }
    return res.status(401).json({ error: "Invalid password" });
  });

  app.get("/api/promo-admin/applications", async (req, res) => {
    if (!requirePromoAdmin(req, res)) return;
    try {
      const applications = await storage.getPromoApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching promo applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/promo-admin/applications/:id/verify", async (req, res) => {
    if (!requirePromoAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const app = await storage.getPromoApplications();
      const application = app.find(a => a.id === id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (application.status === "verified") {
        return res.status(400).json({ error: "Already verified" });
      }

      const updated = await storage.markPromoApplicationVerified(id);

      const { sendPromoVerificationEmail } = await import("./integrations/resend-email");
      const emailSent = await sendPromoVerificationEmail(application.email, application.name);

      if (emailSent) {
        await storage.markPromoApplicationEmailSent(id);
      }

      const { sendTelegramNotification } = await import("./integrations/telegram-notify");
      sendTelegramNotification(
        `✅ <b>Promo Verified (Admin Panel)</b>\n\n` +
        `👤 ${application.name}\n` +
        `📧 ${application.email}\n` +
        `🔢 ${application.cuNumber}\n` +
        `📨 Email: ${emailSent ? "Sent" : "Failed"}\n` +
        `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`
      ).catch(err => console.error("TG notify error:", err));

      try {
        const { syncAllPromoApplications } = await import("./googleSheets");
        await syncAllPromoApplications();
      } catch (err) {
        console.error("Google Sheet sync error:", err);
      }

      res.json({ ...updated, emailSent });
    } catch (error) {
      console.error("Error verifying promo application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/promo-admin/applications/:id/reject", async (req, res) => {
    if (!requirePromoAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updatePromoApplicationStatus(id, "rejected");
      res.json(updated);
    } catch (error) {
      console.error("Error rejecting promo application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dennis-promos", async (req, res) => {
    try {
      const language = req.query.language as string | undefined;
      const promos = await storage.getDennisPromos(true, language);
      res.json(promos);
    } catch (error) {
      console.error("Error fetching dennis promos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/dennis-promos", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const promos = await storage.getDennisPromos(false);
      res.json(promos);
    } catch (error) {
      console.error("Error fetching dennis promos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/dennis-promos", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const promo = await storage.createDennisPromo(req.body);
      res.status(201).json(promo);
    } catch (error) {
      console.error("Error creating dennis promo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/dennis-promos/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const { id: _, createdAt, ...data } = req.body;
      const promo = await storage.updateDennisPromo(id, data);
      if (!promo) return res.status(404).json({ error: "Not found" });
      res.json(promo);
    } catch (error) {
      console.error("Error updating dennis promo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/dennis-promos/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDennisPromo(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dennis promo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      if (!checkLoginRate(ip)) {
        return res.status(429).json({ error: "Zu viele Versuche. Bitte warten Sie 15 Minuten." });
      }
      const { password } = req.body;
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Invalid password" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/upload", upload.single("file"), async (req: any, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${crypto.randomBytes(8).toString("hex")}${ext}`;
      const bucketName = getUploadBucketName();
      const prefix = getUploadPrefix();
      const objectName = prefix ? `${prefix}/uploads/${filename}` : `uploads/${filename}`;
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: { contentType: req.file.mimetype },
      });
      const filePath = `/uploads/${filename}`;
      res.json({ url: filePath });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.get("/api/speakers", async (req, res) => {
    try {
      const speakersList = await storage.getSpeakers(true);
      res.json(speakersList);
    } catch (error) {
      console.error("Error fetching speakers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/speakers", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const speakersList = await storage.getSpeakers(false);
      res.json(speakersList);
    } catch (error) {
      console.error("Error fetching speakers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/speakers", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const speaker = await storage.createSpeaker(req.body);
      res.status(201).json(speaker);
    } catch (error) {
      console.error("Error creating speaker:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/speakers/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const speaker = await storage.updateSpeaker(id, req.body);
      if (!speaker) return res.status(404).json({ error: "Speaker not found" });
      res.json(speaker);
    } catch (error) {
      console.error("Error updating speaker:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/speakers/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSpeaker(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting speaker:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-sessions/export", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const sessions = await db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
      const allMessages = await db.select().from(chatMessages).orderBy(chatMessages.timestamp);

      const sessionMap = new Map<string, typeof sessions[0]>();
      for (const s of sessions) {
        sessionMap.set(s.sessionId, s);
      }

      let csv = "session_id,type,language,created_at,role,content,message_timestamp\n";
      for (const msg of allMessages) {
        const session = sessionMap.get(msg.sessionId);
        const escapedContent = `"${(msg.content || "").replace(/"/g, '""')}"`;
        csv += `${msg.sessionId},${session?.type || ""},${session?.language || ""},${session?.createdAt?.toISOString() || ""},${msg.role},${escapedContent},${msg.timestamp?.toISOString() || ""}\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=chat-sessions-export.csv");
      res.send(csv);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-sessions/:sessionId/messages", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const messages = await storage.getChatSessionMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-sessions/:sessionId/export", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const sessionId = req.params.sessionId;
      const messages = await storage.getChatSessionMessages(sessionId);

      let csv = "session_id,role,content,timestamp\n";
      for (const msg of messages) {
        const escapedContent = `"${(msg.content || "").replace(/"/g, '""')}"`;
        csv += `${sessionId},${msg.role},${escapedContent},${msg.timestamp?.toISOString() || ""}\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=chat-${sessionId.substring(0, 8)}.csv`);
      res.send(csv);
    } catch (error) {
      console.error("Export session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-sessions", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const filters = {
        type: req.query.type as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
      };
      const sessions = await storage.getChatSessions(filters);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/promotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const promo = await storage.getPromotion(id);
      if (!promo) return res.status(404).json({ error: "Not found" });
      res.json(promo);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/schedule-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getScheduleEvent(id);
      if (!event) return res.status(404).json({ error: "Not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/promotions", async (req, res) => {
    try {
      const language = req.query.language as string | undefined;
      const promos = await storage.getPromotions(true, language);
      res.json(promos);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/promotions", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const promos = await storage.getPromotions(false);
      res.json(promos);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/promotions", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { autoTranslate, ...promoData } = req.body;
      const promo = await storage.createPromotion(promoData);
      res.status(201).json(promo);
    } catch (error) {
      console.error("Error creating promotion:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/promotions/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const promo = await storage.updatePromotion(id, req.body);
      if (!promo) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.json(promo);
    } catch (error) {
      console.error("Error updating promotion:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/promotions/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deletePromotion(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting promotion:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/schedule-events", async (req, res) => {
    try {
      const events = await storage.getScheduleEvents(true);
      const today = new Date().toISOString().split("T")[0];
      const filtered = events.filter((e: any) => {
        if (!e.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return false;
        return e.date >= today;
      });
      res.json(filtered);
    } catch (error) {
      console.error("Error fetching schedule events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/schedule-events", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const events = await storage.getScheduleEvents(false);
      res.json(events);
    } catch (error) {
      console.error("Error fetching schedule events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/schedule-events", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { autoTranslate, ...eventData } = req.body;
      const event = await storage.createScheduleEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating schedule event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/schedule-events/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateScheduleEvent(id, req.body);
      if (!event) {
        return res.status(404).json({ error: "Schedule event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error updating schedule event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/schedule-events/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deleteScheduleEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting schedule event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/analyze-maria", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { language, chatType, reportLanguage } = req.body || {};
      const langFilter = language && language !== "all" ? language : undefined;
      const typeFilter = chatType === "video" ? "video" : "text";
      const reportLang = reportLanguage === "ru" ? "Russian" : "German";

      const allSessions = await storage.getChatSessions({});
      const filtered = allSessions.filter((s: any) => {
        if (s.type !== typeFilter) return false;
        if (langFilter && s.language !== langFilter) return false;
        return true;
      });
      const limitedSessions = filtered.slice(0, 50);

      if (limitedSessions.length === 0) {
        const noDataMsg = reportLanguage === "ru"
          ? "Не найдено сессий для выбранных фильтров."
          : "Keine Sitzungen für die gewählten Filter gefunden.";
        return res.json({
          summary: noDataMsg,
          sections: [],
          sessionsAnalyzed: 0,
        });
      }

      const dialogues: string[] = [];
      for (const session of limitedSessions) {
        const msgs = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, session.sessionId))
          .orderBy(chatMessages.timestamp);
        if (msgs.length === 0) continue;
        const lines = msgs.map((m) => `${m.role === "user" ? "User" : "Maria"}: ${m.content}`);
        dialogues.push(
          `--- Session ${session.sessionId.substring(0, 8)} (${session.language}, ${session.type}) ---\n${lines.join("\n")}`
        );
      }

      if (dialogues.length === 0) {
        const noMsgText = reportLanguage === "ru"
          ? "Не найдено сообщений в сессиях."
          : "Keine Nachrichten in den Sitzungen gefunden.";
        return res.json({
          summary: noMsgText,
          sections: [],
          sessionsAnalyzed: 0,
        });
      }

      let mariaPrompt: string;
      let modeLabel: string;
      if (typeFilter === "video") {
        mariaPrompt = LIVEAVATAR_SYSTEM_PROMPT;
        modeLabel = "Live Avatar (Video Call)";
      } else {
        mariaPrompt =
          langFilter === "en"
            ? MARIA_SYSTEM_PROMPT_EN
            : langFilter === "ru"
            ? MARIA_SYSTEM_PROMPT_RU
            : MARIA_SYSTEM_PROMPT_DE;
        modeLabel = "Text Chat";
      }

      const analysisSystemPrompt = `You are an expert AI assistant analyst. You will analyze chat dialogues between users and an AI assistant named Maria in ${modeLabel} mode.

Below is Maria's current system prompt for ${modeLabel} (her instructions):
=== MARIA SYSTEM PROMPT START ===
${mariaPrompt}
=== MARIA SYSTEM PROMPT END ===

Analyze ALL the dialogues below and produce a detailed report IN ${reportLang} language with exactly these 5 sections:

1. **Top user questions** — The most frequent topics/questions users ask (list each with approximate count)
2. **Problematic answers** — Cases where Maria answered poorly: too long, inaccurate, off-topic, violated her prompt rules (cite specific examples with session IDs)
3. **Drop-off points** — Topics or moments where users leave the conversation or Maria cannot help (patterns)
4. **Conversion analysis** — How many dialogues lead to a registration/application/next step vs. users leaving without action
5. **Prompt improvement recommendations** — Specific, actionable suggestions for improving Maria's system prompt (with exact wording changes where possible)

Return ONLY valid JSON in this format:
{
  "summary": "Brief 2-3 sentence executive summary",
  "sections": [
    { "title": "Section title", "items": ["item 1", "item 2", ...] }
  ]
}`;

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: analysisSystemPrompt },
          { role: "user", content: `Here are ${dialogues.length} dialogues to analyze:\n\n${dialogues.join("\n\n")}` },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

      res.json({
        summary: parsed.summary || "Analysis complete",
        sections: parsed.sections || [],
        sessionsAnalyzed: dialogues.length,
      });
    } catch (error: any) {
      console.error("Maria analysis error:", error);
      res.status(500).json({ error: error.message || "Analysis failed" });
    }
  });

  app.post("/api/admin/sync-sheets", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const result = await syncAllChatSessions();
      res.json({
        success: true,
        sessionCount: result.sessionCount,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`,
      });
    } catch (error: any) {
      console.error("Google Sheets sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync with Google Sheets" });
    }
  });

  app.post("/api/admin/sync-promo-sheets", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const result = await syncAllPromoApplications();
      res.json({
        success: true,
        count: result.count,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`,
      });
    } catch (error: any) {
      console.error("Promo Sheets sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync promo applications" });
    }
  });

  app.post("/api/admin/check-promo-verifications", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const count = await checkAndProcessVerifications();
      res.json({ success: true, processedCount: count });
    } catch (error: any) {
      console.error("Manual verification check error:", error);
      res.status(500).json({ error: error.message || "Failed to check verifications" });
    }
  });

  startVerificationPoller();

  app.get("/api/invite/:code", async (req, res) => {
    try {
      const event = await storage.getInviteEventByCode(req.params.code);
      if (!event || !event.isActive) {
        return res.status(404).json({ error: "Event not found" });
      }
      const { zoomLink, ...publicEvent } = event;

      let scheduleEventData = null;
      if (event.scheduleEventId) {
        const se = await storage.getScheduleEvent(event.scheduleEventId);
        if (se) {
          scheduleEventData = {
            speaker: se.speaker,
            speakerPhoto: se.speakerPhoto,
            banner: se.banner,
            highlights: se.highlights,
            type: se.type,
            typeBadge: se.typeBadge,
            timezone: se.timezone,
            day: se.day,
            language: se.language,
          };
        }
      }

      res.json({ ...publicEvent, scheduleEvent: scheduleEventData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invite/:code/register", async (req, res) => {
    try {
      const event = await storage.getInviteEventByCode(req.params.code);
      if (!event || !event.isActive) {
        return res.status(404).json({ error: "Event not found" });
      }
      const parsed = insertInviteGuestSchema.safeParse({
        ...req.body,
        inviteEventId: event.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }
      const guest = await storage.addInviteGuest(parsed.data);
      notifyPartnerNewRegistration(event, guest).catch(err =>
        console.error("Partner notification error:", err)
      );
      res.json({ success: true, guestId: guest.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invite/:code/click", async (req, res) => {
    try {
      const event = await storage.getInviteEventByCode(req.params.code);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      const { guestId } = req.body;
      if (guestId) {
        await storage.markGuestClickedZoom(guestId);
      }

      let zoomLink = event.zoomLink || "";
      if (zoomLink && !zoomLink.startsWith("http")) {
        const urlMatch = zoomLink.match(/https?:\/\/[^\s]+zoom\.us\/j\/\d+[^\s]*/i);
        if (urlMatch) {
          zoomLink = urlMatch[0];
        }
      }

      res.json({ zoomLink });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/invite-events", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const parsed = insertInviteEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }
      const event = await storage.createInviteEvent(parsed.data);
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/invite-events", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const events = await storage.getAllInviteEvents();
      const zoomCounts = await storage.getZoomAttendanceCounts();
      const enriched = events.map(e => ({
        ...e,
        zoomSyncedCount: zoomCounts[e.id] || 0,
      }));
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/invite-events/:id/report", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const event = await storage.getInviteEventById(Number(req.params.id));
      if (!event) return res.status(404).json({ error: "Event not found" });
      const guests = await storage.getGuestsByEventId(event.id);
      const clicked = guests.filter(g => g.clickedZoom);
      const notClicked = guests.filter(g => !g.clickedZoom);
      res.json({
        event,
        guests,
        stats: {
          totalRegistered: guests.length,
          totalClicked: clicked.length,
          totalNotClicked: notClicked.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/invite-events/:id/send-report", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const event = await storage.getInviteEventById(Number(req.params.id));
      if (!event) return res.status(404).json({ error: "Event not found" });
      const guests = await storage.getGuestsByEventId(event.id);
      const clicked = guests.filter(g => g.clickedZoom);
      const notClicked = guests.filter(g => !g.clickedZoom);

      let msg = `📊 <b>Event-Bericht: ${event.title}</b>\n`;
      msg += `📅 ${event.eventDate} ${event.eventTime}\n`;
      msg += `👤 Partner: ${event.partnerName} (${event.partnerCu})\n\n`;
      msg += `📝 Registriert: ${guests.length} Gäste\n`;
      msg += `✅ Zoom beigetreten: ${clicked.length}\n`;
      msg += `❌ Nicht beigetreten: ${notClicked.length}\n`;

      if (clicked.length > 0) {
        msg += `\n<b>✅ Beigetreten:</b>\n`;
        clicked.forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
      }
      if (notClicked.length > 0) {
        msg += `\n<b>❌ Nicht beigetreten:</b>\n`;
        notClicked.forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
      }

      await sendTelegramNotification(msg);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/partners", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const partnersList = await storage.getAllPartners();
      res.json(partnersList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
