import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { inviteEvents, inviteGuests, zoomAttendance, scheduleEvents, speakers } from "@shared/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import OpenAI from "openai";
import crypto from "crypto";

function isPartnerAppEnabled(): boolean {
  return process.env.PARTNER_APP_ENABLED === "true" || process.env.NODE_ENV === "development";
}

function partnerAppGuard(req: any, res: any): boolean {
  if (!isPartnerAppEnabled()) {
    res.status(404).json({ error: "Not found" });
    return false;
  }
  return true;
}

async function getPartnerFromRequest(req: any): Promise<any | null> {
  const telegramId = req.headers["x-telegram-id"] as string;
  if (!telegramId) return null;

  if (telegramId === "demo" && process.env.NODE_ENV === "development") {
    const allPartners = await storage.getAllPartners();
    if (allPartners.length > 0) return allPartners[0];
    return {
      id: 0,
      telegramChatId: "demo",
      name: "Demo Partner",
      cuNumber: "CU00000",
      phone: null,
      email: null,
      status: "active",
      createdAt: new Date(),
    };
  }

  return storage.getPartnerByTelegramChatId(telegramId);
}

export function registerPartnerAppRoutes(app: Express) {
  app.get("/api/partner-app/profile", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const events = await storage.getInviteEventsByPartnerId(partner.id);
      let totalInvited = 0;
      let totalAttended = 0;

      for (const event of events) {
        totalInvited += event.guestCount;
        const attendance = await storage.getZoomAttendanceByEventId(event.id);
        totalAttended += attendance.length;
      }

      const conversionRate = totalInvited > 0 ? Math.round((totalAttended / totalInvited) * 100) : 0;

      res.json({
        partner: {
          id: partner.id,
          name: partner.name,
          cuNumber: partner.cuNumber,
          status: partner.status,
        },
        stats: {
          totalInvited,
          totalAttended,
          conversionRate,
          totalEvents: events.length,
        },
      });
    } catch (error: any) {
      console.error("Partner app profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/webinars", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const events = await storage.getScheduleEvents(true);
      res.json(events);
    } catch (error: any) {
      console.error("Partner app webinars error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/events", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const events = await storage.getInviteEventsByPartnerId(partner.id);
      const enriched = [];

      for (const event of events) {
        const guests = await storage.getGuestsByEventId(event.id);
        const attendance = await storage.getZoomAttendanceByEventId(event.id);

        enriched.push({
          ...event,
          registeredCount: guests.length,
          attendedCount: attendance.length,
          conversionRate: guests.length > 0 ? Math.round((attendance.length / guests.length) * 100) : 0,
        });
      }

      res.json(enriched);
    } catch (error: any) {
      console.error("Partner app events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/events/:id/report", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const event = await storage.getInviteEventById(Number(req.params.id));
      if (!event || event.partnerId !== partner.id) {
        return res.status(404).json({ error: "Event not found" });
      }

      const guests = await storage.getGuestsByEventId(event.id);
      const attendance = await storage.getZoomAttendanceByEventId(event.id);

      const attendanceMap = new Map<string, typeof attendance[0]>();
      for (const a of attendance) {
        attendanceMap.set(a.participantEmail.toLowerCase(), a);
      }

      const guestsWithStatus = guests.map((g) => {
        const att = attendanceMap.get(g.email.toLowerCase());
        return {
          id: g.id,
          name: g.name,
          email: g.email,
          phone: g.phone,
          registeredAt: g.registeredAt,
          clickedZoom: g.clickedZoom,
          attended: !!att,
          durationMinutes: att?.durationMinutes || 0,
          questionsAsked: att?.questionsAsked || 0,
        };
      });

      res.json({
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          inviteCode: event.inviteCode,
        },
        guests: guestsWithStatus,
        funnel: {
          invited: guests.length,
          registered: guests.length,
          clickedZoom: guests.filter((g) => g.clickedZoom).length,
          attended: attendance.length,
        },
      });
    } catch (error: any) {
      console.error("Partner app event report error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partner-app/create-invite", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const { scheduleEventId } = req.body;
      if (!scheduleEventId) {
        return res.status(400).json({ error: "scheduleEventId is required" });
      }

      const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
      if (!scheduleEvent) {
        return res.status(404).json({ error: "Webinar not found" });
      }

      const inviteEvent = await storage.createInviteEvent({
        partnerName: partner.name,
        partnerCu: partner.cuNumber,
        partnerId: partner.id,
        scheduleEventId: scheduleEvent.id,
        zoomLink: scheduleEvent.link,
        title: scheduleEvent.title,
        eventDate: scheduleEvent.date,
        eventTime: scheduleEvent.time,
        isActive: true,
      });

      res.json({
        inviteCode: inviteEvent.inviteCode,
        inviteUrl: `/invite/${inviteEvent.inviteCode}`,
        event: {
          title: scheduleEvent.title,
          date: scheduleEvent.date,
          time: scheduleEvent.time,
          speaker: scheduleEvent.speaker,
        },
      });
    } catch (error: any) {
      console.error("Partner app create invite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partner-app/ai-followup", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const { message, guestContext } = req.body;
      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      let contextInfo = "";
      if (guestContext) {
        contextInfo = `\nGuest info: Name: ${guestContext.name || "unknown"}, Status: ${guestContext.attended ? "attended" : "did not attend"}, Duration: ${guestContext.durationMinutes || 0} min, Questions asked: ${guestContext.questionsAsked || 0}.`;
      }

      const systemPrompt = `You are an AI recruiting assistant for JetUP partners. You help partners follow up with webinar guests and prospects.
You are professional, supportive, and focused on helping the partner convert leads into team members or clients.
Respond in the same language as the partner's message (German, Russian, or English).
Keep messages concise and action-oriented.
${contextInfo}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply = completion.choices[0]?.message?.content || "I couldn't generate a response.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Partner app AI followup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
