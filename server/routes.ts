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
      const promo = await storage.createPromotion(req.body);
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
      const event = await storage.createScheduleEvent(req.body);
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
