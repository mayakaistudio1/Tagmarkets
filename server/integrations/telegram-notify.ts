const TELEGRAM_API = "https://api.telegram.org";

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_NOTIFY_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_NOTIFY_CHAT_ID not set");
    return false;
  }

  return sendTelegramMessageToChat(chatId, message);
}

export async function sendTelegramMessageToChat(chatId: string, message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn("Telegram message skipped: TELEGRAM_BOT_TOKEN not set");
    return false;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram send error:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram message failed:", error);
    return false;
  }
}

export function formatPromoApplicationMessage(app: {
  name: string;
  email: string;
  cuNumber: string;
  promoTitle?: string;
  isDuplicate?: boolean;
}): string {
  const lines = [
    app.isDuplicate ? `⚠️ <b>Wiederholte Anmeldung!</b>` : `🎯 <b>Neue Promo-Anmeldung!</b>`,
    ``,
    `👤 <b>Name:</b> ${app.name}`,
    `📧 <b>E-Mail:</b> ${app.email}`,
    `🔢 <b>CU-Nummer:</b> ${app.cuNumber}`,
  ];

  if (app.promoTitle) {
    lines.push(`📋 <b>Aktion:</b> ${app.promoTitle}`);
  }

  if (app.isDuplicate) {
    lines.push(``, `🔁 <i>Diese E-Mail oder CU-Nummer wurde bereits verwendet.</i>`);
  }

  lines.push(``, `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`);

  return lines.join("\n");
}
