import { storage } from "../storage";
import { sendTelegramMessageToChat } from "./telegram-notify";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { sendGuestReminderEmail } from "./resend-email";

const POLL_INTERVAL_MS = 2 * 60 * 1000;
let pollerInterval: ReturnType<typeof setInterval> | null = null;

function getPartnerBotToken(): string | undefined {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  return process.env.TELEGRAM_PARTNER_BOT_TOKEN_DEV || process.env.TELEGRAM_PARTNER_BOT_TOKEN;
}

async function sendTelegramMessageByUsername(username: string, text: string): Promise<boolean> {
  const token = getPartnerBotToken();
  if (!token) {
    console.warn("Telegram guest reminder skipped: partner bot token not set");
    return false;
  }

  const chatId = username.startsWith("@") ? username : `@${username}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn(`Telegram guest reminder to ${chatId} failed (user may not have started bot): ${err}`);
      return false;
    }
    console.log(`Telegram reminder sent to ${chatId}`);
    return true;
  } catch (error) {
    console.error("Telegram guest reminder send failed:", error);
    return false;
  }
}

async function sendPartnerBotMessage(chatId: string, text: string): Promise<boolean> {
  const token = getPartnerBotToken();
  if (!token) {
    console.warn("Reminder skipped: partner bot token not set");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Reminder send error:", err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Reminder send failed:", error);
    return false;
  }
}

function getTimezoneOffset(tz: string): string {
  const tzMap: Record<string, string> = {
    "CET": "+01:00",
    "CEST": "+02:00",
    "MET": "+01:00",
    "MEZ": "+01:00",
    "MESZ": "+02:00",
    "UTC": "+00:00",
    "GMT": "+00:00",
    "MSK": "+03:00",
    "Europe/Berlin": "+01:00",
    "Europe/Moscow": "+03:00",
  };

  const now = new Date();
  const berlinMonth = now.getMonth();
  if ((tz === "CET" || tz === "Europe/Berlin" || tz === "MET" || tz === "MEZ") && berlinMonth >= 2 && berlinMonth <= 9) {
    return "+02:00";
  }

  return tzMap[tz] || "+01:00";
}

function parseEventDateTime(dateStr: string, timeStr: string, timezone?: string): Date | null {
  try {
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;
    const offset = getTimezoneOffset(timezone || "CET");
    const dt = new Date(`${match[0]}T${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00${offset}`);
    if (isNaN(dt.getTime())) return null;
    return dt;
  } catch {
    return null;
  }
}

async function sendReminderForInvite(
  invite: any,
  event: any,
  partner: any,
  isAdvance: boolean,
): Promise<boolean> {
  const guestName = invite.guestName || invite.prospectName;
  const guestLang = invite.guestLanguage || "de";
  const contactLines: string[] = [];
  if (invite.guestEmail) contactLines.push(`📧 ${invite.guestEmail}`);
  if (invite.guestPhone) contactLines.push(`📱 ${invite.guestPhone}`);
  if (invite.guestTelegram) contactLines.push(`💬 @${invite.guestTelegram.replace('@', '')}`);

  const channelLabel = invite.reminderChannel === "whatsapp" ? "WhatsApp"
    : invite.reminderChannel === "telegram" ? "Telegram"
    : invite.reminderChannel === "email" ? "Email"
    : null;

  const timeLabelDe = isAdvance ? "24 Stunden" : "1 Stunde";
  const eventTimeStr = `${event.date} ${event.time}`;

  const partnerMsg =
    `⏰ <b>Erinnerung senden!</b>\n\n` +
    `Dein Gast <b>${guestName}</b> hat in ${timeLabelDe} ein Webinar.\n\n` +
    `📋 <b>Event:</b> ${event.title}\n` +
    `🕐 <b>Wann:</b> ${eventTimeStr}\n` +
    `${channelLabel ? `📨 <b>Kanal:</b> ${channelLabel}\n` : ''}` +
    `${contactLines.length > 0 ? `\n<b>Kontakt:</b>\n${contactLines.join('\n')}\n` : ''}` +
    `\n💡 <i>Sende deinem Gast eine Erinnerung${channelLabel ? ` über ${channelLabel}` : ''}!</i>`;

  const partnerSent = await sendPartnerBotMessage(partner.telegramChatId, partnerMsg);
  if (!partnerSent) {
    console.warn(`Partner reminder failed for invite ${invite.id}; will retry next cycle`);
    return false;
  }

  const timeLabel = isAdvance ? "24 hours" : "1 hour";
  const timeLabelRu = isAdvance ? "24 часа" : "1 час";
  const timeLabelDeFull = isAdvance ? "24 Stunden" : "1 Stunde";

  const baseUrl = process.env.NODE_ENV === "production"
    ? (process.env.PRODUCTION_URL || "https://jet-up.ai")
    : (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://jet-up.ai");

  const guestToken = invite.guestToken;
  const goLink = guestToken ? `${baseUrl}/go/${guestToken}` : event.link;

  let guestEmailSent = true;
  if (invite.guestEmail) {
    const emailGoLink = guestToken ? `${baseUrl}/go/${guestToken}` : undefined;
    guestEmailSent = await sendGuestReminderEmail({
      to: invite.guestEmail,
      name: guestName,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      timezone: event.timezone || "CET",
      speaker: event.speaker,
      zoomLink: event.link,
      goLink: emailGoLink,
      language: guestLang,
    }).catch((err) => {
      console.error(`Failed to send guest reminder email to ${invite.guestEmail}:`, err);
      return false;
    });
  }

  const hasTgChatId = !!invite.telegramChatId;
  const hasTgUsername = !!invite.guestTelegram;

  if (hasTgChatId || hasTgUsername) {
    const safeTitle = event.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSpeaker = event.speaker.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const reminderTexts: Record<string, string> = {
      en: `🎥 <b>Reminder!</b> The webinar "<b>${safeTitle}</b>" starts in ${timeLabel}!\n\n📅 ${event.date} | 🕐 ${event.time} ${event.timezone || "CET"}\n🎙 ${safeSpeaker}\n\n🔗 <b>Join now:</b> ${goLink}`,
      de: `🎥 <b>Erinnerung!</b> Das Webinar "<b>${safeTitle}</b>" beginnt in ${timeLabelDeFull}!\n\n📅 ${event.date} | 🕐 ${event.time} ${event.timezone || "CET"}\n🎙 ${safeSpeaker}\n\n🔗 <b>Jetzt teilnehmen:</b> ${goLink}`,
      ru: `🎥 <b>Напоминание!</b> Вебинар "<b>${safeTitle}</b>" начнётся через ${timeLabelRu}!\n\n📅 ${event.date} | 🕐 ${event.time} ${event.timezone || "CET"}\n🎙 ${safeSpeaker}\n\n🔗 <b>Войти сейчас:</b> ${goLink}`,
    };
    const tgMsg = reminderTexts[guestLang] || reminderTexts.de;

    if (hasTgChatId) {
      sendPartnerBotMessage(invite.telegramChatId, tgMsg).catch((err) =>
        console.error(`Telegram reminder via chat_id to ${invite.telegramChatId} failed:`, err)
      );
    } else if (hasTgUsername) {
      const tgHandle = invite.guestTelegram!.replace("@", "").trim();
      sendTelegramMessageByUsername(tgHandle, tgMsg).catch((err) =>
        console.error(`Telegram reminder to @${tgHandle} failed:`, err)
      );
    }
  }

  return guestEmailSent;
}

export async function checkAndSendReminders(): Promise<number> {
  let sentCount = 0;

  try {
    const pendingInvites = await storage.getPersonalInvitesPendingAutoReminder();
    if (pendingInvites.length === 0) return 0;

    const now = new Date();

    for (const invite of pendingInvites) {
      try {
        const event = await storage.getScheduleEvent(invite.scheduleEventId);
        if (!event) {
          await storage.markPersonalInviteReminderSent(invite.id);
          continue;
        }

        const eventTime = parseEventDateTime(event.date, event.time, event.timezone);
        if (!eventTime) {
          console.warn(`Cannot parse event date/time for event ${event.id}: ${event.date} ${event.time}`);
          continue;
        }

        const msUntilEvent = eventTime.getTime() - now.getTime();

        if (msUntilEvent < 0) {
          await storage.markPersonalInviteReminderSent(invite.id);
          continue;
        }

        const h24Ms = 24 * 60 * 60 * 1000;
        const h1Ms = 60 * 60 * 1000;
        const invite24hSent = !!(invite as any).reminder24hSent;

        const partner = await storage.getPartnerById(invite.partnerId);
        if (!partner) {
          await storage.markPersonalInviteReminderSent(invite.id);
          continue;
        }

        if (!invite24hSent && msUntilEvent <= h24Ms && msUntilEvent > h1Ms) {
          const ok = await sendReminderForInvite(invite, event, partner, true);
          if (ok) {
            await storage.markPersonalInviteReminder24hSent(invite.id);
            sentCount++;
            console.log(`24h reminder sent for guest ${invite.guestName || invite.prospectName}`);
          }
          continue;
        }

        if (msUntilEvent <= h1Ms) {
          const ok = await sendReminderForInvite(invite, event, partner, false);
          if (ok) {
            await storage.markPersonalInviteReminderSent(invite.id);
            sentCount++;
            console.log(`1h reminder sent for guest ${invite.guestName || invite.prospectName}`);
          }
        }
      } catch (err) {
        console.error(`Error processing reminder for invite ${invite.id}:`, err);
      }
    }

    if (sentCount > 0) {
      console.log(`Sent ${sentCount} reminder notification(s) this cycle`);
    }
  } catch (error) {
    console.error("Reminder scheduler error:", error);
  }

  return sentCount;
}

async function ensureReminderColumn(): Promise<void> {
  try {
    await db.execute(sql`ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT false`);
  } catch (err) {
    console.warn("reminder_sent column migration skipped:", err);
  }
  try {
    await db.execute(sql`ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS guest_language TEXT`);
  } catch (err) {
    console.warn("guest_language column migration skipped:", err);
  }
}

export function startReminderScheduler(): void {
  if (pollerInterval) return;

  console.log(`Starting reminder scheduler (every ${POLL_INTERVAL_MS / 1000}s)`);

  ensureReminderColumn().then(() => {
    pollerInterval = setInterval(() => {
      checkAndSendReminders().catch((err) =>
        console.error("Reminder scheduler cycle error:", err)
      );
    }, POLL_INTERVAL_MS);

    setTimeout(() => {
      checkAndSendReminders().catch((err) =>
        console.error("Initial reminder check error:", err)
      );
    }, 15000);
  }).catch((err) => {
    console.error("Failed to start reminder scheduler:", err);
  });
}

export function stopReminderScheduler(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log("Reminder scheduler stopped");
  }
}
