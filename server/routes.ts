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
import OpenAI from "openai";
import crypto from "crypto";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const uploadDir = path.join(process.cwd(), "client", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = crypto.randomBytes(8).toString("hex");
      cb(null, `${name}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

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

async function translateText(texts: Record<string, string>, sourceLang: string, targetLang: string): Promise<Record<string, string>> {
  const langNames: Record<string, string> = { de: "German", en: "English", ru: "Russian" };
  const entries = Object.entries(texts).filter(([_, v]) => v && v.trim());
  if (entries.length === 0) return texts;

  const prompt = entries.map(([key, val]) => `${key}: ${val}`).join("\n---\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following content from ${langNames[sourceLang]} to ${langNames[targetLang]}. Keep the same keys and format. Return ONLY the translated content in the same format (key: value), separated by ---. Do not add any explanation.`
        },
        { role: "user", content: prompt }
      ],
      max_completion_tokens: 2000,
    });

    const result = response.choices[0]?.message?.content || "";
    const translated: Record<string, string> = {};
    const parts = result.split("---").map(s => s.trim());

    for (const part of parts) {
      const colonIdx = part.indexOf(":");
      if (colonIdx > 0) {
        const key = part.substring(0, colonIdx).trim();
        const val = part.substring(colonIdx + 1).trim();
        translated[key] = val;
      }
    }

    const finalResult: Record<string, string> = {};
    for (const [key, origVal] of entries) {
      finalResult[key] = translated[key] || origVal;
    }
    return finalResult;
  } catch (error) {
    console.error("Translation error:", error);
    return texts;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  registerLiveAvatarRoutes(app);
  registerMariaChatRoutes(app);
  
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
      const filePath = `/uploads/${req.file.filename}`;
      res.json({ url: filePath });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/translate", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { texts, sourceLang, targetLang } = req.body;
      if (!texts || !sourceLang || !targetLang) {
        return res.status(400).json({ error: "Missing texts, sourceLang, or targetLang" });
      }
      const translated = await translateText(texts, sourceLang, targetLang);
      res.json(translated);
    } catch (error) {
      console.error("Translation error:", error);
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
      const lang = (req.query.lang as string) || "de";
      const promos = await storage.getPromotions(true);
      const filtered = promos.filter((p: any) => p.language === lang);
      res.json(filtered.length > 0 ? filtered : promos.filter((p: any) => p.language === "de"));
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
      if (!promoData.translationGroup) {
        promoData.translationGroup = crypto.randomUUID();
      }
      const promo = await storage.createPromotion(promoData);

      if (autoTranslate) {
        const sourceLang = promoData.language || "de";
        const targetLangs = ["de", "en", "ru"].filter(l => l !== sourceLang);

        for (const targetLang of targetLangs) {
          try {
            const textsToTranslate: Record<string, string> = {
              badge: promoData.badge,
              title: promoData.title,
              subtitle: promoData.subtitle,
              ctaText: promoData.ctaText,
              deadline: promoData.deadline || "",
            };
            (promoData.highlights || []).forEach((h: string, i: number) => {
              textsToTranslate[`highlight_${i}`] = h;
            });

            const translated = await translateText(textsToTranslate, sourceLang, targetLang);
            const translatedHighlights = (promoData.highlights || []).map((_: string, i: number) =>
              translated[`highlight_${i}`] || promoData.highlights[i]
            );

            await storage.createPromotion({
              ...promoData,
              badge: translated.badge || promoData.badge,
              title: translated.title || promoData.title,
              subtitle: translated.subtitle || promoData.subtitle,
              ctaText: translated.ctaText || promoData.ctaText,
              deadline: translated.deadline || promoData.deadline,
              highlights: translatedHighlights,
              language: targetLang,
              translationGroup: promoData.translationGroup,
            });
          } catch (err) {
            console.error(`Translation to ${targetLang} failed:`, err);
          }
        }
      }

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
      const lang = (req.query.lang as string) || "de";
      const events = await storage.getScheduleEvents(true);
      const filtered = events.filter((e: any) => e.language === lang);
      res.json(filtered.length > 0 ? filtered : events.filter((e: any) => e.language === "de"));
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
      if (!eventData.translationGroup) {
        eventData.translationGroup = crypto.randomUUID();
      }
      const event = await storage.createScheduleEvent(eventData);

      if (autoTranslate) {
        const sourceLang = eventData.language || "de";
        const targetLangs = ["de", "en", "ru"].filter(l => l !== sourceLang);

        for (const targetLang of targetLangs) {
          try {
            const textsToTranslate: Record<string, string> = {
              day: eventData.day,
              title: eventData.title,
              typeBadge: eventData.typeBadge,
            };
            (eventData.highlights || []).forEach((h: string, i: number) => {
              textsToTranslate[`highlight_${i}`] = h;
            });

            const translated = await translateText(textsToTranslate, sourceLang, targetLang);
            const translatedHighlights = (eventData.highlights || []).map((_: string, i: number) =>
              translated[`highlight_${i}`] || eventData.highlights[i]
            );

            await storage.createScheduleEvent({
              ...eventData,
              day: translated.day || eventData.day,
              title: translated.title || eventData.title,
              typeBadge: translated.typeBadge || eventData.typeBadge,
              highlights: translatedHighlights,
              language: targetLang,
              translationGroup: eventData.translationGroup,
            });
          } catch (err) {
            console.error(`Translation to ${targetLang} failed:`, err);
          }
        }
      }

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
