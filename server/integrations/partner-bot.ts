import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { storage } from "../storage";
import { sendTelegramNotification, sendTelegramMessageToChat } from "./telegram-notify";
import { isZoomConfigured, syncZoomDataForEvent, testZoomConnection, saveZoomCredentialsToDb } from "./zoom-api";

const TELEGRAM_API = "https://api.telegram.org";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message: {
      message_id: number;
      chat: { id: number };
    };
    data: string;
  };
}

const registrationState: Map<string, { step: string; data: any }> = new Map();

const aiConversations: Map<string, { messages: Array<{ role: "user" | "assistant" | "system"; content: string }>; eventId?: number }> = new Map();

async function sendMessage(chatId: number | string, text: string, options?: any): Promise<any> {
  const token = process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  if (!token) return null;

  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...options,
  };

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Bot send error:", JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error("Bot send failed:", error);
    return null;
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  const token = process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  if (!token) return;

  await fetch(`${TELEGRAM_API}/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

async function editMessage(chatId: number, messageId: number, text: string, options?: any): Promise<void> {
  const token = process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  if (!token) return;

  await fetch(`${TELEGRAM_API}/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      ...options,
    }),
  });
}

async function handleStart(chatId: number, from: any): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (partner) {
    await sendMessage(chatId,
      `👋 Willkommen zurück, <b>${partner.name}</b>!\n\n` +
      `Verfügbare Befehle:\n` +
      `/invite — Einladungslink erstellen\n` +
      `/events — Meine Events anzeigen\n` +
      `/report — Event-Bericht abrufen\n` +
      `/followup — KI-Assistent für Follow-up\n` +
      `/help — Hilfe anzeigen`
    );
    return;
  }

  registrationState.set(String(chatId), { step: "name", data: { telegramChatId: String(chatId), telegramUsername: from.username || null } });
  await sendMessage(chatId,
    `🚀 <b>Willkommen beim JetUP Partner Bot!</b>\n\n` +
    `Ich helfe dir, Einladungslinks zu erstellen, Gäste zu tracken und Follow-up-Nachrichten zu verfassen.\n\n` +
    `Lass uns zuerst dein Profil anlegen.\n\n` +
    `📝 <b>Wie ist dein vollständiger Name?</b>`
  );
}

async function handleRegistration(chatId: number, text: string): Promise<boolean> {
  const state = registrationState.get(String(chatId));
  if (!state) return false;

  if (state.step === "name") {
    state.data.name = text.trim();
    state.step = "cu";
    registrationState.set(String(chatId), state);
    await sendMessage(chatId, `👍 Danke, <b>${state.data.name}</b>!\n\n🔢 <b>Bitte gib deine CU-Nummer ein:</b>`);
    return true;
  }

  if (state.step === "cu") {
    state.data.cuNumber = text.trim();
    state.step = "phone";
    registrationState.set(String(chatId), state);
    await sendMessage(chatId, `📱 <b>Deine Telefonnummer?</b> (optional — sende /skip zum Überspringen)`);
    return true;
  }

  if (state.step === "phone") {
    if (text.trim() !== "/skip") {
      state.data.phone = text.trim();
    }
    state.step = "email";
    registrationState.set(String(chatId), state);
    await sendMessage(chatId, `📧 <b>Deine E-Mail-Adresse?</b> (optional — sende /skip zum Überspringen)`);
    return true;
  }

  if (state.step === "email") {
    if (text.trim() !== "/skip") {
      state.data.email = text.trim();
    }

    try {
      const partner = await storage.createPartner({
        telegramChatId: state.data.telegramChatId,
        telegramUsername: state.data.telegramUsername,
        name: state.data.name,
        cuNumber: state.data.cuNumber,
        phone: state.data.phone || null,
        email: state.data.email || null,
        status: "active",
      });

      registrationState.delete(String(chatId));

      await sendMessage(chatId,
        `✅ <b>Registrierung abgeschlossen!</b>\n\n` +
        `👤 Name: ${partner.name}\n` +
        `🔢 CU: ${partner.cuNumber}\n` +
        `${partner.phone ? `📱 Tel: ${partner.phone}\n` : ""}` +
        `${partner.email ? `📧 E-Mail: ${partner.email}\n` : ""}\n` +
        `Du kannst jetzt loslegen:\n` +
        `/invite — Einladungslink erstellen\n` +
        `/events — Meine Events anzeigen\n` +
        `/help — Hilfe`
      );

      console.log(`New partner registered: ${partner.name} (CU: ${partner.cuNumber})`);
    } catch (error: any) {
      registrationState.delete(String(chatId));
      if (error.message?.includes("unique")) {
        await sendMessage(chatId, `⚠️ Du bist bereits registriert. Sende /start um fortzufahren.`);
      } else {
        await sendMessage(chatId, `❌ Fehler bei der Registrierung. Bitte versuche es erneut mit /start.`);
      }
    }
    return true;
  }

  return false;
}

async function handleInvite(chatId: number): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) {
    await sendMessage(chatId, `⚠️ Du bist noch nicht registriert. Sende /start zum Registrieren.`);
    return;
  }

  const allEvents = await storage.getScheduleEvents(true);
  const today = new Date().toISOString().split("T")[0];
  const events = allEvents.filter((e: any) =>
    e.title && e.title.trim() !== "" &&
    e.date && e.date.trim() !== "" &&
    e.date >= today
  );

  if (events.length === 0) {
    await sendMessage(chatId, `📅 Aktuell sind keine Webinare geplant. Versuch es später noch mal.`);
    return;
  }

  const keyboard = events.map((event: any) => [{
    text: `${event.title.substring(0, 40)} — ${event.date}`,
    callback_data: `invite_event_${event.id}`,
  }]);

  await sendMessage(chatId,
    `📅 <b>Wähle ein Webinar:</b>\n\nKlicke auf ein Event, um deinen persönlichen Einladungslink zu erstellen.`,
    { reply_markup: { inline_keyboard: keyboard } }
  );
}

async function handleInviteCallback(callbackQueryId: string, chatId: number, scheduleEventId: number, messageId: number): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) {
    await answerCallbackQuery(callbackQueryId, "Nicht registriert");
    return;
  }

  const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
  if (!scheduleEvent) {
    await answerCallbackQuery(callbackQueryId, "Event nicht gefunden");
    return;
  }

  await answerCallbackQuery(callbackQueryId, "Erstelle Link...");

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

  const baseUrl = process.env.REPLIT_DEPLOYMENT_URL
    ? `https://${process.env.REPLIT_DEPLOYMENT_URL}`
    : process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "https://jetup.app";

  const inviteUrl = `${baseUrl}/invite/${inviteEvent.inviteCode}`;

  await editMessage(chatId, messageId,
    `✅ <b>Einladungslink erstellt!</b>\n\n` +
    `📋 <b>Event:</b> ${scheduleEvent.title}\n` +
    `📅 ${scheduleEvent.date} | 🕐 ${scheduleEvent.time}\n` +
    `🎙 Speaker: ${scheduleEvent.speaker}\n\n` +
    `🔗 <b>Dein Link:</b>\n${inviteUrl}\n\n` +
    `Teile diesen Link mit deinen Kontakten. Du erhältst eine Benachrichtigung, wenn sich jemand registriert!`
  );
}

async function handleEvents(chatId: number): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) {
    await sendMessage(chatId, `⚠️ Du bist noch nicht registriert. Sende /start zum Registrieren.`);
    return;
  }

  const events = await storage.getInviteEventsByPartnerId(partner.id);

  if (events.length === 0) {
    await sendMessage(chatId, `📋 Du hast noch keine Events erstellt. Sende /invite um einen Einladungslink zu generieren.`);
    return;
  }

  let msg = `📊 <b>Deine Events:</b>\n\n`;
  for (const event of events) {
    const status = event.isActive ? "🟢" : "⚪";
    msg += `${status} <b>${event.title}</b>\n`;
    msg += `   📅 ${event.eventDate} | 🕐 ${event.eventTime}\n`;
    msg += `   👥 ${event.guestCount} registriert | ✅ ${event.clickedCount} Zoom beigetreten\n`;
    msg += `   🔗 Code: ${event.inviteCode}\n\n`;
  }

  const keyboard = events.slice(0, 10).map(event => [{
    text: `📊 Bericht: ${event.title.substring(0, 30)}`,
    callback_data: `report_${event.id}`,
  }]);

  await sendMessage(chatId, msg, {
    reply_markup: keyboard.length > 0 ? { inline_keyboard: keyboard } : undefined,
  });
}

async function handleReport(chatId: number, eventId?: number): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) {
    await sendMessage(chatId, `⚠️ Du bist noch nicht registriert.`);
    return;
  }

  if (!eventId) {
    const events = await storage.getInviteEventsByPartnerId(partner.id);
    if (events.length === 0) {
      await sendMessage(chatId, `📋 Du hast noch keine Events.`);
      return;
    }

    const keyboard = events.slice(0, 10).map(event => [{
      text: `${event.title.substring(0, 35)} (${event.guestCount} Gäste)`,
      callback_data: `report_${event.id}`,
    }]);

    await sendMessage(chatId, `📊 <b>Wähle ein Event für den Bericht:</b>`, {
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  const event = await storage.getInviteEventById(eventId);
  if (!event || event.partnerId !== partner.id) {
    await sendMessage(chatId, `❌ Event nicht gefunden oder kein Zugriff.`);
    return;
  }

  const guests = await storage.getGuestsByEventId(event.id);
  const clicked = guests.filter(g => g.clickedZoom);
  const notClicked = guests.filter(g => !g.clickedZoom);

  let msg = `📊 <b>Event-Bericht: ${event.title}</b>\n`;
  msg += `📅 ${event.eventDate} | 🕐 ${event.eventTime}\n\n`;
  msg += `📝 Registriert: <b>${guests.length}</b> Gäste\n`;
  msg += `✅ Zoom beigetreten: <b>${clicked.length}</b>\n`;
  msg += `❌ Nicht beigetreten: <b>${notClicked.length}</b>\n`;

  const zoomData = await storage.getZoomAttendanceByEventId(event.id);
  if (zoomData.length > 0) {
    const totalDuration = zoomData.reduce((sum, z) => sum + z.durationMinutes, 0);
    const avgDuration = Math.round(totalDuration / zoomData.length);
    const totalQuestions = zoomData.reduce((sum, z) => sum + z.questionsAsked, 0);

    msg += `\n📹 <b>Zoom-Teilnehmer (API): ${zoomData.length}</b>\n`;
    msg += `⏱ Ø ${avgDuration} Min.`;
    if (totalQuestions > 0) msg += ` | 💬 ${totalQuestions} Fragen`;
    msg += `\n\n`;

    for (const z of zoomData.slice(0, 15)) {
      const guestName = z.participantName || z.participantEmail;
      const matched = z.inviteGuestId ? "✅" : "❓";
      const joinStr = z.joinTime ? new Date(z.joinTime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }) : "–";
      const leaveStr = z.leaveTime ? new Date(z.leaveTime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }) : "–";
      msg += `  ${matched} ${guestName}\n`;
      msg += `     📧 ${z.participantEmail} | ⏱ ${joinStr}–${leaveStr} (${z.durationMinutes} Min.)`;
      if (z.questionsAsked > 0) msg += ` | 💬 ${z.questionsAsked}`;
      msg += `\n`;
    }
    if (zoomData.length > 15) {
      msg += `  ... und ${zoomData.length - 15} weitere\n`;
    }

    const zoomEmails = new Set(zoomData.map(z => z.participantEmail.toLowerCase()));
    const registeredNotAttended = guests.filter(g => !zoomEmails.has(g.email.toLowerCase()));
    if (registeredNotAttended.length > 0) {
      msg += `\n⚠️ <b>Registriert, aber nicht auf Zoom (${registeredNotAttended.length}):</b>\n`;
      registeredNotAttended.slice(0, 10).forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
    }

    const guestEmails = new Set(guests.map(g => g.email.toLowerCase()));
    const attendedNotRegistered = zoomData.filter(z => !guestEmails.has(z.participantEmail.toLowerCase()) && !z.inviteGuestId);
    if (attendedNotRegistered.length > 0) {
      msg += `\n🔍 <b>Auf Zoom, aber nicht registriert (${attendedNotRegistered.length}):</b>\n`;
      attendedNotRegistered.slice(0, 10).forEach(z => { msg += `  • ${z.participantName || z.participantEmail}\n`; });
    }
  } else {
    if (clicked.length > 0) {
      msg += `\n<b>✅ Zoom-Link geklickt:</b>\n`;
      clicked.forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
    }
    if (notClicked.length > 0) {
      msg += `\n<b>❌ Nicht geklickt:</b>\n`;
      notClicked.forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
    }
  }

  const keyboard = [[{
    text: "🤖 KI Follow-up starten",
    callback_data: `followup_${event.id}`,
  }]];

  if (isZoomConfigured()) {
    keyboard.push([{
      text: zoomData.length > 0 ? "🔄 Zoom-Daten aktualisieren" : "📹 Zoom-Daten laden",
      callback_data: `zoom_sync_${event.id}`,
    }]);
  }

  await sendMessage(chatId, msg, { reply_markup: { inline_keyboard: keyboard } });
}

async function handleZoomSync(callbackQueryId: string, chatId: number, eventId: number): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) return;

  const event = await storage.getInviteEventById(eventId);
  if (!event || event.partnerId !== partner.id) {
    await answerCallbackQuery(callbackQueryId, "Kein Zugriff");
    return;
  }

  await answerCallbackQuery(callbackQueryId, "Lade Zoom-Daten...");
  await sendMessage(chatId, `⏳ Lade Zoom-Teilnehmerdaten für "<b>${event.title}</b>"...`);

  try {
    const result = await syncZoomDataForEvent(event.id, event.zoomLink);
    if (result.error) {
      await sendMessage(chatId, `⚠️ ${result.error}`);
    } else if (result.synced > 0) {
      let msg = `✅ ${result.synced} Teilnehmer synchronisiert!`;
      if (result.skipped > 0) msg += ` (${result.skipped} bereits vorhanden)`;
      msg += `\n\nSende /report für den aktualisierten Bericht.`;
      await sendMessage(chatId, msg);
    } else {
      await sendMessage(chatId, `ℹ️ Keine neuen Teilnehmerdaten gefunden.${result.skipped > 0 ? ` ${result.skipped} bereits synchronisiert.` : ''}`);
    }
  } catch (error) {
    await sendMessage(chatId, `❌ Fehler beim Laden der Zoom-Daten. Bitte versuche es später erneut.`);
  }
}

async function handleFollowup(chatId: number, eventId?: number): Promise<void> {
  const partner = await storage.getPartnerByTelegramChatId(String(chatId));
  if (!partner) {
    await sendMessage(chatId, `⚠️ Du bist noch nicht registriert.`);
    return;
  }

  if (!eventId) {
    const events = await storage.getInviteEventsByPartnerId(partner.id);
    if (events.length === 0) {
      await sendMessage(chatId, `📋 Keine Events für Follow-up vorhanden.`);
      return;
    }

    const keyboard = events.slice(0, 10).map(event => [{
      text: `${event.title.substring(0, 35)}`,
      callback_data: `followup_${event.id}`,
    }]);

    await sendMessage(chatId, `🤖 <b>Für welches Event möchtest du Follow-up-Nachrichten erstellen?</b>`, {
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  const event = await storage.getInviteEventById(eventId);
  if (!event || event.partnerId !== partner.id) {
    await sendMessage(chatId, `❌ Event nicht gefunden.`);
    return;
  }

  const guests = await storage.getGuestsByEventId(event.id);
  const zoomData = await storage.getZoomAttendanceByEventId(event.id);

  let guestSummary = "";
  for (const guest of guests) {
    const zoom = zoomData.find(z => z.inviteGuestId === guest.id);
    guestSummary += `- ${guest.name} (${guest.email}): `;
    if (zoom) {
      guestSummary += `Teilgenommen ${zoom.durationMinutes} Min.`;
      if (zoom.questionsAsked > 0) guestSummary += `, ${zoom.questionsAsked} Fragen gestellt`;
    } else if (guest.clickedZoom) {
      guestSummary += `Hat Zoom-Link geklickt`;
    } else {
      guestSummary += `Registriert, aber nicht beigetreten`;
    }
    guestSummary += "\n";
  }

  const systemPrompt = `Du bist ein KI-Assistent für JetUP Partner. Du hilfst Partnern bei der Nachbereitung von Webinaren.

Eventdaten:
- Titel: ${event.title}
- Datum: ${event.eventDate} ${event.eventTime}
- Partner: ${partner.name}

Gäste und Engagement:
${guestSummary || "Keine Gäste registriert."}

Deine Aufgaben:
1. Personalisierte Follow-up-Nachrichten für Gäste vorschlagen
2. Recruiting- und Vertriebsnachrichten formulieren
3. Gesprächsleitfäden für Abschlüsse bereitstellen
4. Empfehlungen geben, welche Gäste priorisiert werden sollten
5. Fragen des Partners zu seinen Leads beantworten

Antworte immer auf Deutsch. Sei professionell, aber freundlich. Gib konkrete, umsetzbare Vorschläge.`;

  const convKey = `${chatId}_followup`;
  aiConversations.set(convKey, {
    messages: [{ role: "system", content: systemPrompt }],
    eventId,
  });

  const initialPrompt = guests.length > 0
    ? `Hier ist eine Übersicht deiner ${guests.length} Gäste vom Event "${event.title}". Ich kann dir helfen mit:\n\n• Follow-up-Nachrichten für einzelne Gäste\n• Priorisierung der Leads\n• Recruiting-Strategien\n\nFrag mich einfach! Z.B. "Schreibe eine Follow-up-Nachricht für ${guests[0]?.name}" oder "Wen soll ich zuerst kontaktieren?"`
    : `Für "${event.title}" sind noch keine Gäste registriert. Sobald sich Gäste anmelden, kann ich dir mit Follow-up-Nachrichten helfen.`;

  await sendMessage(chatId,
    `🤖 <b>KI Follow-up Assistent</b>\n` +
    `📋 Event: ${event.title}\n\n` +
    initialPrompt + `\n\n` +
    `<i>Sende /exit um den Follow-up-Modus zu verlassen.</i>`
  );
}

async function handleAIMessage(chatId: number, text: string): Promise<boolean> {
  const convKey = `${chatId}_followup`;
  const conversation = aiConversations.get(convKey);
  if (!conversation) return false;

  if (text.startsWith("/")) {
    aiConversations.delete(convKey);
    return false;
  }

  conversation.messages.push({ role: "user", content: text });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation.messages.map(m => ({ role: m.role as any, content: m.content })),
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || "Entschuldigung, ich konnte keine Antwort generieren.";
    conversation.messages.push({ role: "assistant", content: reply });

    if (conversation.messages.length > 20) {
      const system = conversation.messages[0];
      conversation.messages = [system, ...conversation.messages.slice(-10)];
    }

    await sendMessage(chatId, reply);
  } catch (error) {
    console.error("AI followup error:", error);
    await sendMessage(chatId, `❌ Fehler bei der KI-Verarbeitung. Bitte versuche es erneut.`);
  }

  return true;
}

async function handleHelp(chatId: number): Promise<void> {
  await sendMessage(chatId,
    `📖 <b>JetUP Partner Bot — Hilfe</b>\n\n` +
    `<b>Befehle:</b>\n` +
    `/start — Registrierung / Willkommen\n` +
    `/invite — Einladungslink für ein Webinar erstellen\n` +
    `/events — Deine Events und Statistiken anzeigen\n` +
    `/report — Detaillierten Event-Bericht abrufen\n` +
    `/followup — KI-Assistent für Follow-up starten\n` +
    `/help — Diese Hilfe anzeigen\n\n` +
    `<b>So funktioniert's:</b>\n` +
    `1. Wähle ein Webinar mit /invite\n` +
    `2. Teile den Link mit deinen Kontakten\n` +
    `3. Erhalte Benachrichtigungen bei Registrierungen\n` +
    `4. Rufe nach dem Event den Bericht ab\n` +
    `5. Nutze den KI-Assistenten für Follow-up`
  );
}

async function handleUpdate(update: TelegramUpdate): Promise<void> {
  if (update.callback_query) {
    const { id: queryId, data, message, from } = update.callback_query;
    const chatId = message.chat.id;

    if (data.startsWith("invite_event_")) {
      const scheduleEventId = parseInt(data.replace("invite_event_", ""));
      await handleInviteCallback(queryId, chatId, scheduleEventId, message.message_id);
    } else if (data.startsWith("report_")) {
      const eventId = parseInt(data.replace("report_", ""));
      await answerCallbackQuery(queryId);
      await handleReport(chatId, eventId);
    } else if (data.startsWith("followup_")) {
      const eventId = parseInt(data.replace("followup_", ""));
      await answerCallbackQuery(queryId);
      await handleFollowup(chatId, eventId);
    } else if (data.startsWith("zoom_sync_")) {
      const eventId = parseInt(data.replace("zoom_sync_", ""));
      await handleZoomSync(queryId, chatId, eventId);
    } else {
      await answerCallbackQuery(queryId);
    }
    return;
  }

  if (!update.message?.text) return;

  const chatId = update.message.chat.id;
  const text = update.message.text.trim();
  const from = update.message.from;

  if (await handleRegistration(chatId, text)) return;

  if (await handleAIMessage(chatId, text)) return;

  const command = text.split(" ")[0].split("@")[0].toLowerCase();

  switch (command) {
    case "/start":
      await handleStart(chatId, from);
      break;
    case "/invite":
      await handleInvite(chatId);
      break;
    case "/events":
    case "/myevents":
      await handleEvents(chatId);
      break;
    case "/report":
      await handleReport(chatId);
      break;
    case "/followup":
      await handleFollowup(chatId);
      break;
    case "/help":
      await handleHelp(chatId);
      break;
    case "/exit":
      await sendMessage(chatId, `✅ Follow-up-Modus beendet. Sende /help für alle Befehle.`);
      break;
    default: {
      const partner = await storage.getPartnerByTelegramChatId(String(chatId));
      if (partner) {
        await sendMessage(chatId, `Ich verstehe diesen Befehl nicht. Sende /help für eine Liste aller Befehle.`);
      } else {
        await sendMessage(chatId, `Willkommen! Sende /start um dich als Partner zu registrieren.`);
      }
    }
  }
}

async function autoSetWebhook(): Promise<void> {
  const token = process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  if (!token) return;

  const baseUrl = process.env.REPLIT_DEPLOYMENT_URL
    ? `https://${process.env.REPLIT_DEPLOYMENT_URL}`
    : process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : null;

  if (!baseUrl) return;

  const webhookUrl = `${baseUrl}/api/telegram-bot/webhook`;
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const result = await res.json();
    console.log(`Partner bot webhook set to: ${webhookUrl}`, result);
  } catch (error) {
    console.error("Failed to auto-set partner bot webhook:", error);
  }
}

export function registerPartnerBotRoutes(app: Express): void {
  autoSetWebhook();

  app.post("/api/telegram-bot/webhook", async (req: Request, res: Response) => {
    try {
      const update: TelegramUpdate = req.body;
      await handleUpdate(update);
      res.sendStatus(200);
    } catch (error) {
      console.error("Bot webhook error:", error);
      res.sendStatus(200);
    }
  });

  app.post("/api/admin/bot/set-webhook", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'] || req.body?.adminPassword;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = process.env.TELEGRAM_PARTNER_BOT_TOKEN;
    if (!token) {
      return res.status(400).json({ error: "TELEGRAM_PARTNER_BOT_TOKEN not set" });
    }

    const webhookUrl = req.body.webhookUrl;
    if (!webhookUrl) {
      return res.status(400).json({ error: "webhookUrl required" });
    }

    try {
      const setRes = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      });
      const result = await setRes.json();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/partners", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const allPartners = await storage.getAllPartners();
      res.json(allPartners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/zoom-sync/:eventId", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const event = await storage.getInviteEventById(Number(req.params.eventId));
      if (!event) return res.status(404).json({ error: "Event not found" });

      const result = await syncZoomDataForEvent(event.id, event.zoomLink);
      if (result.error && result.synced === 0) {
        return res.json({ synced: 0, skipped: result.skipped || 0, error: result.error });
      }
      res.json({ synced: result.synced, skipped: result.skipped || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/zoom-test", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await testZoomConnection();
    res.json({ configured: isZoomConfigured(), ...result });
  });

  app.post("/api/admin/zoom-credentials", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { accountId, clientId, clientSecret } = req.body;
    if (!accountId || !clientId || !clientSecret) {
      return res.status(400).json({ error: "All three fields are required" });
    }

    process.env.ZOOM_ACCOUNT_ID = accountId;
    process.env.ZOOM_CLIENT_ID = clientId;
    process.env.ZOOM_CLIENT_SECRET = clientSecret;

    await saveZoomCredentialsToDb(accountId, clientId, clientSecret);

    const result = await testZoomConnection();
    res.json({ configured: true, ...result });
  });

  app.get("/api/admin/zoom-attendance/:eventId", async (req: Request, res: Response) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const attendance = await storage.getZoomAttendanceByEventId(Number(req.params.eventId));
      res.json(attendance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

export async function notifyPartnerNewRegistration(event: any, guest: any): Promise<void> {
  if (!event.partnerId) return;

  const partner = await storage.getPartnerById(event.partnerId);
  if (!partner) return;

  await sendTelegramMessageToChat(
    partner.telegramChatId,
    `🎟 <b>Neue Registrierung!</b>\n\n` +
    `📋 <b>Event:</b> ${event.title}\n` +
    `👤 <b>Gast:</b> ${guest.name}\n` +
    `📧 <b>E-Mail:</b> ${guest.email}\n` +
    `${guest.phone ? `📱 <b>Tel:</b> ${guest.phone}\n` : ""}` +
    `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`
  );
}
