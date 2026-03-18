import { storage } from "../storage";
import { sendTelegramMessageToChat } from "./telegram-notify";

const POLL_INTERVAL_MS = 2 * 60 * 1000;
let pollerInterval: ReturnType<typeof setInterval> | null = null;

function getPartnerBotToken(): string | undefined {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  return process.env.TELEGRAM_PARTNER_BOT_TOKEN_DEV || process.env.TELEGRAM_PARTNER_BOT_TOKEN;
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

function parseEventDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;
    const dt = new Date(`${match[0]}T${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00+01:00`);
    if (isNaN(dt.getTime())) return null;
    return dt;
  } catch {
    return null;
  }
}

export async function checkAndSendReminders(): Promise<number> {
  let sentCount = 0;

  try {
    const pendingInvites = await storage.getPersonalInvitesPendingReminder();
    if (pendingInvites.length === 0) return 0;

    const now = new Date();

    for (const invite of pendingInvites) {
      try {
        const event = await storage.getScheduleEvent(invite.scheduleEventId);
        if (!event) {
          await storage.markPersonalInviteReminderSent(invite.id);
          continue;
        }

        const eventTime = parseEventDateTime(event.date, event.time);
        if (!eventTime) {
          console.warn(`Cannot parse event date/time for event ${event.id}: ${event.date} ${event.time}`);
          continue;
        }

        const msUntilEvent = eventTime.getTime() - now.getTime();

        if (msUntilEvent < 0) {
          await storage.markPersonalInviteReminderSent(invite.id);
          continue;
        }

        const oneHourMs = 60 * 60 * 1000;
        const fifteenMinMs = 15 * 60 * 1000;
        let shouldSend = false;

        if (invite.reminderPreference === "1_hour" && msUntilEvent <= oneHourMs) {
          shouldSend = true;
        } else if (invite.reminderPreference === "15_min" && msUntilEvent <= fifteenMinMs) {
          shouldSend = true;
        }

        if (!shouldSend) continue;

        const partner = await storage.getPartnerById(invite.partnerId);
        if (!partner) {
          await storage.markPersonalInviteReminderSent(invite.id);
          continue;
        }

        const guestName = invite.guestName || invite.prospectName;
        const contactLines: string[] = [];
        if (invite.guestEmail) contactLines.push(`📧 ${invite.guestEmail}`);
        if (invite.guestPhone) contactLines.push(`📱 ${invite.guestPhone}`);
        if (invite.guestTelegram) contactLines.push(`💬 @${invite.guestTelegram.replace('@', '')}`);

        const timeLabel = invite.reminderPreference === "1_hour" ? "1 Stunde" : "15 Minuten";
        const eventTimeStr = `${event.date} ${event.time}`;

        const partnerMsg =
          `⏰ <b>Erinnerung senden!</b>\n\n` +
          `Dein Gast <b>${guestName}</b> hat eine Erinnerung ${timeLabel} vor dem Webinar angefordert.\n\n` +
          `📋 <b>Event:</b> ${event.title}\n` +
          `🕐 <b>Wann:</b> ${eventTimeStr}\n` +
          `${contactLines.length > 0 ? `\n<b>Kontakt:</b>\n${contactLines.join('\n')}\n` : ''}` +
          `\n💡 <i>Sende deinem Gast eine kurze Erinnerung über den bevorzugten Kanal!</i>`;

        const sent = await sendPartnerBotMessage(partner.telegramChatId, partnerMsg);
        if (sent) {
          await storage.markPersonalInviteReminderSent(invite.id);
          sentCount++;
          console.log(`Reminder notification sent to partner ${partner.name} for guest ${guestName}`);
        }
      } catch (err) {
        console.error(`Error processing reminder for invite ${invite.id}:`, err);
      }
    }

    if (sentCount > 0) {
      console.log(`Sent ${sentCount} reminder notification(s) to partners`);
    }
  } catch (error) {
    console.error("Reminder scheduler error:", error);
  }

  return sentCount;
}

export function startReminderScheduler(): void {
  if (pollerInterval) return;

  console.log(`Starting reminder scheduler (every ${POLL_INTERVAL_MS / 1000}s)`);

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
}

export function stopReminderScheduler(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log("Reminder scheduler stopped");
  }
}
