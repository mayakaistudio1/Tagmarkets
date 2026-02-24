import { storage } from "./storage";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let _baseUrl = "";
function toAbsoluteUrl(urlPath: string): string {
  if (!urlPath) return "";
  if (urlPath.startsWith("http")) return urlPath;
  return _baseUrl ? `${_baseUrl}${urlPath}` : urlPath;
}

export async function injectOgTags(url: string, html: string, baseUrl?: string): Promise<string> {
  if (baseUrl) _baseUrl = baseUrl;
  const eventMatch = url.match(/^\/event\/(\d+)/);
  const promoMatch = url.match(/^\/promo\/(\d+)/);

  if (eventMatch) {
    const id = parseInt(eventMatch[1]);
    try {
      const event = await storage.getScheduleEvent(id);
      if (event) {
        const title = escapeHtml(event.title);
        const desc = escapeHtml(`${event.speaker} — ${event.day || ""}, ${event.date || ""}${event.time ? `, ${event.time}` : ""}`);
        const image = toAbsoluteUrl(event.banner || event.speakerPhoto || "");
        return replaceOgTags(html, `JetUP: ${title}`, desc, image);
      }
    } catch {}
  }

  if (promoMatch) {
    const id = parseInt(promoMatch[1]);
    try {
      const promo = await storage.getPromotion(id);
      if (promo) {
        const title = escapeHtml(promo.title);
        const desc = escapeHtml(promo.subtitle || "");
        const image = toAbsoluteUrl(promo.banner || "");
        return replaceOgTags(html, `JetUP: ${title}`, desc, image);
      }
    } catch {}
  }

  return html;
}

function replaceOgTags(html: string, title: string, description: string, image: string): string {
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${description}" />`
  );

  if (image) {
    const imgTag = `<meta property="og:image" content="${image}" />`;
    const twImgTag = `<meta name="twitter:image" content="${image}" />`;
    if (html.includes('og:image')) {
      html = html.replace(/<meta property="og:image" content="[^"]*" \/>/, imgTag);
    } else {
      html = html.replace(/<meta property="og:title"/, `${imgTag}\n    <meta property="og:title"`);
    }
    if (html.includes('twitter:image')) {
      html = html.replace(/<meta name="twitter:image" content="[^"]*" \/>/, twImgTag);
    } else {
      html = html.replace(/<meta name="twitter:title"/, `${twImgTag}\n    <meta name="twitter:title"`);
    }
  }

  return html;
}
