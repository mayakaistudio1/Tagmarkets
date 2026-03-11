import { pollPromoSheetForVerifications } from "../googleSheets";
import { storage } from "../storage";
import { sendPromoVerificationEmail } from "./resend-email";
import { sendTelegramNotification } from "./telegram-notify";

const POLL_INTERVAL_MS = 3 * 60 * 1000;
let pollerInterval: ReturnType<typeof setInterval> | null = null;

export async function checkAndProcessVerifications(): Promise<number> {
  let processedCount = 0;

  try {
    const verifiedInSheet = await pollPromoSheetForVerifications();

    if (verifiedInSheet.length === 0) return 0;

    for (const entry of verifiedInSheet) {
      try {
        const app = await storage.getUnverifiedPromoApplicationByEmail(entry.email, entry.cuNumber);
        if (!app) continue;

        const updated = await storage.markPromoApplicationVerified(app.id);

        const emailSent = await sendPromoVerificationEmail(entry.email, entry.name || app.name);

        if (emailSent) {
          await storage.markPromoApplicationEmailSent(app.id);
        }

        const tgMessage = formatVerificationMessage({
          name: app.name,
          email: app.email,
          cuNumber: app.cuNumber,
          emailSent,
        });
        sendTelegramNotification(tgMessage).catch((err) =>
          console.error("TG verification notify error:", err)
        );

        processedCount++;
      } catch (err) {
        console.error(`Error processing verification for ${entry.email}:`, err);
      }
    }

    if (processedCount > 0) {
      console.log(`Processed ${processedCount} new promo verification(s)`);
    }
  } catch (error) {
    console.error("Verification polling error:", error);
  }

  return processedCount;
}

function formatVerificationMessage(app: {
  name: string;
  email: string;
  cuNumber: string;
  emailSent: boolean;
}): string {
  const lines = [
    `✅ <b>Promo Application Verified!</b>`,
    ``,
    `👤 <b>Name:</b> ${app.name}`,
    `📧 <b>E-Mail:</b> ${app.email}`,
    `🔢 <b>CU-Nummer:</b> ${app.cuNumber}`,
    ``,
    app.emailSent
      ? `📨 Confirmation email sent successfully`
      : `⚠️ Failed to send confirmation email`,
    ``,
    `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
  ];
  return lines.join("\n");
}

export function startVerificationPoller(): void {
  if (pollerInterval) return;

  console.log(`Starting promo verification poller (every ${POLL_INTERVAL_MS / 1000}s)`);

  pollerInterval = setInterval(() => {
    checkAndProcessVerifications().catch((err) =>
      console.error("Verification poller cycle error:", err)
    );
  }, POLL_INTERVAL_MS);

  setTimeout(() => {
    checkAndProcessVerifications().catch((err) =>
      console.error("Initial verification check error:", err)
    );
  }, 10000);
}

export function stopVerificationPoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log("Promo verification poller stopped");
  }
}
