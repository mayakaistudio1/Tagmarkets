import { storage } from "./storage";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toAbsoluteUrl(urlPath: string, baseUrl: string): string {
  if (!urlPath) return "";
  if (urlPath.startsWith("http")) return urlPath;
  return baseUrl ? `${baseUrl}${urlPath}` : urlPath;
}

export async function buildCrawlerHtml(url: string, baseUrl: string): Promise<string | null> {
  const eventMatch = url.match(/^\/event\/(\d+)/);
  const promoMatch = url.match(/^\/promo\/(\d+)/);

  let title = "JetUP";
  let description = "Your clear entry into the financial markets. Structure. Transparency. Control.";
  let image = "";
  let pageUrl = `${baseUrl}${url}`;

  if (eventMatch) {
    const id = parseInt(eventMatch[1]);
    const event = await storage.getScheduleEvent(id);
    if (!event) return null;
    title = `JetUP: ${escapeHtml(event.title)}`;
    description = escapeHtml(`${event.speaker} — ${event.day || ""}, ${event.date || ""}${event.time ? `, ${event.time}` : ""}`);
    image = toAbsoluteUrl(event.banner || event.speakerPhoto || "", baseUrl);
  } else if (promoMatch) {
    const id = parseInt(promoMatch[1]);
    const promo = await storage.getPromotion(id);
    if (!promo) return null;
    title = `JetUP: ${escapeHtml(promo.title)}`;
    description = escapeHtml(promo.subtitle || "");
    image = toAbsoluteUrl(promo.banner || "", baseUrl);
  } else {
    return null;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(pageUrl)}" />
${image ? `<meta property="og:image" content="${image}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
${image ? `<meta name="twitter:image" content="${image}" />` : ""}
</head>
<body></body>
</html>`;
}
