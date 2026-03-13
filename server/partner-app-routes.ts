import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { inviteEvents, inviteGuests, zoomAttendance, scheduleEvents, speakers, personalInvites } from "@shared/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import OpenAI from "openai";
import crypto from "crypto";
import { z } from "zod";

const PROSPECT_TYPES = ["Investor", "MLM Leader", "Entrepreneur", "Beginner", "Neutral"] as const;

const createPersonalInviteSchema = z.object({
  scheduleEventId: z.number({ required_error: "scheduleEventId is required" }),
  prospectName: z.string().min(1, "prospectName is required").max(200),
  prospectType: z.enum(PROSPECT_TYPES).default("Neutral"),
  prospectNote: z.string().max(1000).optional(),
});

const registerPersonalInviteSchema = z.object({
  name: z.string().min(1, "name is required").max(200),
  email: z.string().email("valid email is required"),
  telegram: z.string().max(100).optional(),
});

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

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
      const partner = await getPartnerFromRequest(req);
      const events = await storage.getScheduleEvents(true);

      if (partner) {
        const partnerEvents = await storage.getInviteEventsByPartnerId(partner.id);
        const enriched = await Promise.all(events.map(async (se: any) => {
          const related = partnerEvents.filter((ie: any) => ie.scheduleEventId === se.id);
          let invitesSent = 0;
          let registeredCount = 0;
          for (const ie of related) {
            invitesSent++;
            const guests = await storage.getGuestsByEventId(ie.id);
            registeredCount += guests.length;
          }
          return { ...se, invitesSent, registeredCount };
        }));
        return res.json(enriched);
      }

      res.json(events.map((e: any) => ({ ...e, invitesSent: 0, registeredCount: 0 })));
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

      const grouped = new Map<string, {
        title: string; eventDate: string; eventTime: string; scheduleEventId: number | null;
        inviteEvents: typeof events;
        totalGuests: number; totalAttended: number; totalClicked: number; invitesSent: number;
      }>();

      for (const event of events) {
        const key = event.scheduleEventId?.toString() || event.title;
        if (!grouped.has(key)) {
          grouped.set(key, {
            title: event.title, eventDate: event.eventDate, eventTime: event.eventTime,
            scheduleEventId: event.scheduleEventId,
            inviteEvents: [], totalGuests: 0, totalAttended: 0, totalClicked: 0, invitesSent: 0,
          });
        }
        const group = grouped.get(key)!;
        group.inviteEvents.push(event);
        group.invitesSent++;

        const guests = await storage.getGuestsByEventId(event.id);
        const attendance = await storage.getZoomAttendanceByEventId(event.id);
        group.totalGuests += guests.length;
        group.totalAttended += attendance.length;
        group.totalClicked += guests.filter((g: any) => g.clickedZoom).length;
      }

      const enriched = Array.from(grouped.values()).map((g) => ({
        id: g.inviteEvents[0].id,
        title: g.title,
        eventDate: g.eventDate,
        eventTime: g.eventTime,
        scheduleEventId: g.scheduleEventId,
        invitesSent: g.invitesSent,
        registeredCount: g.totalGuests,
        attendedCount: g.totalAttended,
        clickedCount: g.totalClicked,
        guestCount: g.totalGuests,
        conversionRate: g.totalGuests > 0 ? Math.round((g.totalAttended / g.totalGuests) * 100) : 0,
        inviteEventIds: g.inviteEvents.map((e: any) => e.id),
      }));

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
          questionTexts: att?.questionTexts || [],
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

      const openai = getOpenAIClient();

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

  app.post("/api/partner-app/create-personal-invite", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const parsed = createPersonalInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { scheduleEventId, prospectName, prospectType, prospectNote } = parsed.data;

      const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
      if (!scheduleEvent) {
        return res.status(404).json({ error: "Webinar not found" });
      }

      const invite = await storage.createPersonalInvite({
        partnerId: partner.id,
        scheduleEventId: scheduleEvent.id,
        prospectName,
        prospectType,
        prospectNote: prospectNote || null,
        chatHistory: "[]",
        isActive: true,
      });

      res.json({
        inviteCode: invite.inviteCode,
        inviteUrl: `/personal-invite/${invite.inviteCode}`,
        event: {
          title: scheduleEvent.title,
          date: scheduleEvent.date,
          time: scheduleEvent.time,
          speaker: scheduleEvent.speaker,
        },
      });
    } catch (error: any) {
      console.error("Partner app create personal invite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/personal-invite/:code", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      const scheduleEvent = await storage.getScheduleEvent(invite.scheduleEventId);
      const partner = await storage.getPartnerById(invite.partnerId);

      res.json({
        inviteCode: invite.inviteCode,
        prospectName: invite.prospectName,
        partnerName: partner?.name || "Partner",
        isRegistered: !!invite.registeredAt,
        event: scheduleEvent ? {
          title: scheduleEvent.title,
          date: scheduleEvent.date,
          time: scheduleEvent.time,
          speaker: scheduleEvent.speaker,
          speakerPhoto: scheduleEvent.speakerPhoto || null,
          banner: scheduleEvent.banner || null,
          highlights: scheduleEvent.highlights || [],
          typeBadge: scheduleEvent.typeBadge || "",
        } : null,
        chatHistory: JSON.parse(invite.chatHistory || "[]"),
      });
    } catch (error: any) {
      console.error("Personal invite fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/personal-invite/:code/chat", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }

      const scheduleEvent = await storage.getScheduleEvent(invite.scheduleEventId);
      const partner = await storage.getPartnerById(invite.partnerId);
      const partnerName = partner?.name || "Partner";

      const chatHistory: Array<{ role: string; content: string }> = JSON.parse(invite.chatHistory || "[]");
      chatHistory.push({ role: "user", content: message });

      const highlightsText = scheduleEvent?.highlights?.length
        ? scheduleEvent.highlights.map((h: string) => `• ${h}`).join("\n")
        : "";

      const systemPrompt = `You are a friendly AI assistant representing ${partnerName}, who personally invited ${invite.prospectName} to a webinar.

WEBINAR DETAILS:
- Title: ${scheduleEvent?.title || "Webinar"}
- Date: ${scheduleEvent?.date || "TBD"}
- Time: ${scheduleEvent?.time || "TBD"}
- Speaker: ${scheduleEvent?.speaker || "Expert"}
${highlightsText ? `- Key topics:\n${highlightsText}` : ""}

PROSPECT INFO:
- Name: ${invite.prospectName}
- Type: ${invite.prospectType}
${invite.prospectNote ? `- Note from ${partnerName}: ${invite.prospectNote}` : ""}

REGISTRATION STATUS: ${invite.registeredAt ? "Already registered" : "Not yet registered"}

YOUR BEHAVIOR:
- You speak warmly and personally, as if you are ${partnerName}'s digital assistant
- Keep messages SHORT (2-4 sentences max)
- If they want to register, tell them to click the "Register" button below
- If they ask for more info, share webinar highlights and speaker details
- If they're unsure, gently encourage — mention it's free and valuable
- After they register, congratulate them and mention they can set a reminder
- Never make up information not provided above
- Respond in English`;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const reply = completion.choices[0]?.message?.content || "I'd be happy to help! Would you like to register for the webinar?";

      chatHistory.push({ role: "assistant", content: reply });
      await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

      let quickReplies: string[] = [];
      if (!invite.registeredAt) {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("register") || lowerMsg.includes("sign up") || lowerMsg.includes("yes")) {
          quickReplies = [];
        } else {
          quickReplies = ["Yes, register me", "Tell me more", "Not sure yet"];
        }
      } else if (!invite.reminderPreference) {
        quickReplies = ["Remind me 1 hour before", "Remind me 15 min before", "No reminder needed"];
      }

      res.json({ reply, quickReplies, isRegistered: !!invite.registeredAt });
    } catch (error: any) {
      console.error("Personal invite chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/personal-invite/:code/init-chat", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      const existingHistory: Array<{ role: string; content: string }> = JSON.parse(invite.chatHistory || "[]");
      if (existingHistory.length > 0) {
        const quickReplies = !invite.registeredAt
          ? ["Yes, register me", "Tell me more", "Not sure yet"]
          : !invite.reminderPreference
            ? ["Remind me 1 hour before", "Remind me 15 min before", "No reminder needed"]
            : [];
        return res.json({ reply: existingHistory[0].content, chatHistory: existingHistory, quickReplies, isRegistered: !!invite.registeredAt });
      }

      const scheduleEvent = await storage.getScheduleEvent(invite.scheduleEventId);
      const partner = await storage.getPartnerById(invite.partnerId);
      const partnerName = partner?.name || "Partner";

      const openai = getOpenAIClient();

      const noteContext = invite.prospectNote ? ` (${partnerName} mentioned: "${invite.prospectNote}")` : "";

      const initPrompt = `Generate a short, warm opening message (3-4 sentences) for ${invite.prospectName} from ${partnerName}.
You're personally inviting them to: "${scheduleEvent?.title || "Webinar"}" on ${scheduleEvent?.date || "TBD"} at ${scheduleEvent?.time || "TBD"} with ${scheduleEvent?.speaker || "an expert"}.
Prospect type: ${invite.prospectType}${noteContext}
End with asking if they'd like to register or learn more. Be conversational and friendly.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: initPrompt }],
        temperature: 0.8,
        max_tokens: 200,
      });

      const firstMessage = completion.choices[0]?.message?.content ||
        `Hi ${invite.prospectName}! ${partnerName} wanted me to personally invite you to "${scheduleEvent?.title}" on ${scheduleEvent?.date} at ${scheduleEvent?.time}. Would you like to register or hear more about it?`;

      const chatHistory = [{ role: "assistant", content: firstMessage }];
      await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

      res.json({
        reply: firstMessage,
        chatHistory,
        quickReplies: ["Yes, register me", "Tell me more", "Not sure yet"],
        isRegistered: false,
      });
    } catch (error: any) {
      console.error("Personal invite init-chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/personal-invite/:code/register", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      if (invite.registeredAt) {
        return res.status(400).json({ error: "Already registered" });
      }

      const parsed = registerPersonalInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { name, email, telegram } = parsed.data;

      const updated = await storage.updatePersonalInviteRegistration(invite.id, {
        guestName: name,
        guestEmail: email,
        guestTelegram: telegram,
      });

      const chatHistory: Array<{ role: string; content: string }> = JSON.parse(updated.chatHistory || "[]");
      chatHistory.push({ role: "assistant", content: `Great news, ${name}! You're now registered for the webinar! 🎉 Would you like me to set a reminder for you?` });
      await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

      res.json({
        success: true,
        message: "Registration successful",
        chatHistory,
        quickReplies: ["Remind me 1 hour before", "Remind me 15 min before", "No reminder needed"],
      });
    } catch (error: any) {
      console.error("Personal invite register error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/personal-invite/:code/reminder", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      const REMINDER_OPTIONS = ["1_hour", "15_min", "none"] as const;
      const { preference } = req.body;
      if (!preference || !REMINDER_OPTIONS.includes(preference)) {
        return res.status(400).json({ error: "preference must be one of: 1_hour, 15_min, none" });
      }

      await storage.updatePersonalInviteReminder(invite.id, preference);

      const chatHistory: Array<{ role: string; content: string }> = JSON.parse(invite.chatHistory || "[]");
      const reminderLabel = preference === "1_hour" ? "1 hour before" : preference === "15_min" ? "15 minutes before" : null;
      const reminderMsg = reminderLabel
        ? `Perfect! I'll remind you ${reminderLabel}. See you at the webinar! 🙌`
        : "No problem! See you at the webinar! 🙌";
      chatHistory.push({ role: "assistant", content: reminderMsg });
      await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

      res.json({ success: true, chatHistory });
    } catch (error: any) {
      console.error("Personal invite reminder error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
