import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApplicationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { registerLiveAvatarRoutes } from "./integrations/liveavatar";
import { registerMariaChatRoutes } from "./integrations/maria-chat";
import { db } from "./db";
import { chatSessions, chatMessages } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { objectStorageClient } from "./replit_integrations/object_storage";

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

  app.get("/api/promotions", async (req, res) => {
    try {
      const promos = await storage.getPromotions(true);
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
      res.json(events);
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

  return httpServer;
}
