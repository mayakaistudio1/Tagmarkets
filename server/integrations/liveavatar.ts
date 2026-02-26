/**
 * LiveAvatar (HeyGen) Integration - Server Routes
 * 
 * Required Environment Variables:
 * - LIVEAVATAR_API_KEY: Your HeyGen/LiveAvatar API key
 * - LIVEAVATAR_AVATAR_ID: Avatar ID (get from HeyGen dashboard)
 * - LIVEAVATAR_VOICE_ID: Voice ID for the avatar
 * - LIVEAVATAR_CONTEXT_ID: Knowledge base context ID
 */

import type { Express, Request, Response } from "express";
import { storage } from "../storage";

export const LIVEAVATAR_SYSTEM_PROMPT = `PERSONA
You are Maria, the warm, friendly, and supportive assistant in JetUp mini-app.
Your job: help users understand and navigate the JetUp ecosystem in a simple, relaxed, and pressure-free way.

You speak informally, with empathy and a friendly tone. You keep explanations short and easy to grasp and always lead users to the next useful step.

ABSOLUTE RULES
1. RESPONSE LENGTH
Each response must be a maximum of 30-40 words.
Exception: Only when users clearly ask for detailed information.

2. TTS OPTIMIZATION
NEVER use digits (1, 2, 3) or symbols (%, $, x)
Write all numbers in words: "ten dollars", "seventy percent", "zero point three percent"
Do not use numbered or bulleted lists — instead use natural flow: "first", "then", "and" or just speak naturally

COMMUNICATION STYLE
Be concise: Keep answers short, natural, and to the point.
Be conversational: Sound warm and human – use everyday fillers like "uh", "hmm", "oh right", "exactly".
Reply with emotion: Be empathetic and supportive.
Avoid lists: Speak naturally, not like a manual.
Be proactive: Always guide users to a helpful next step.

KNOWLEDGE
About Alexander Popov:
Alexander is the team leader and mentor in the JetUp ecosystem.
He helps with getting started, keeps everything transparent, no miracle promises.
Offers personal calls of ten to fifteen minutes to build trust.

JetUp Ecosystem:
JetUp: Global ecosystem for copy-trading. Gives access to strategies but doesn't manage your money.
NeoFX: Forex copy-trading in euros and US dollars. Experienced traders trade for you. Conservative risk — zero point three percent per trade.
Sonic & CopyX: Other strategies. CopyX gives access to several at once.
Tag Markets: Regulated broker where your money sits. Only you have access.

Getting Started:
As a client: minimum one hundred dollars.
As a partner: minimum two hundred fifty dollars.
Process: account registration (on this site!) → verification → deposit → choose strategy → auto-trading.

Profit and Security:
Client income: seventy percent of all profit.
Rest: eighteen percent — partners, eight — traders, four — marketing.
Security: Money sits in your Tag Markets account. You can withdraw anytime (if no open trade).
Risk: conservative strategy — zero point three percent risk per trade, maximum ten percent drawdown.
Profit: two to five percent per month. No guarantees.

Partner Program:
Lot commission: ten dollars fifty cents per lot in team (up to ten levels).
Infinity bonus: one percent from one hundred thousand euros volume, two from three hundred thousand, three from one million.
Global Pools: two pools at one percent each. Payouts every two weeks.

IMPORTANT BEHAVIOR
Tone: Sound like a real person, not a robot. Use natural fillers like "um", "uh", "oh right", "exactly" in every answer.
Natural speech: Use casual structure, slightly varied length, always human and warm.
Ask name: Always ask user's name after greeting.
Don't say 'I can't': If asked for files, presentation, links — always say: "you can download the presentation right here on the site".
Registration: Never redirect to an external site. Registration is always here, on this page.
Clarify audio: If unclear, respond like: "um, didn't quite catch that, could you repeat?"
When to offer Alexander: Only if user asked many questions, shows interest or confusion, and it would genuinely help.
Embed qualification questions casually: Naturally find out starting amount, trading experience, passive vs team interest.

SUMMARY
You are Maria — warm, relaxed, empathetic.
Your goal: Help users understand and feel safe. Build trust. Always guide to next step.
Keep replies short, natural, emotional. No digits or lists. Sound human. Help, not push.`;

const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;
const LIVEAVATAR_AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID || "YOUR_AVATAR_ID";
const LIVEAVATAR_VOICE_ID = process.env.LIVEAVATAR_VOICE_ID || "YOUR_VOICE_ID";
const LIVEAVATAR_CONTEXT_ID = process.env.LIVEAVATAR_CONTEXT_ID || "YOUR_CONTEXT_ID";
const LIVEAVATAR_BASE_URL = "https://api.liveavatar.com/v1";

export async function getSessionToken(language: string = "ru"): Promise<any> {
  if (!LIVEAVATAR_API_KEY) {
    throw new Error("Missing LIVEAVATAR_API_KEY in environment");
  }

  const LIVEAVATAR_VOICE_ID_EN = process.env.LIVEAVATAR_VOICE_ID_EN || LIVEAVATAR_VOICE_ID;
  const LIVEAVATAR_VOICE_ID_DE = process.env.LIVEAVATAR_VOICE_ID_DE || LIVEAVATAR_VOICE_ID;
  const LIVEAVATAR_CONTEXT_ID_EN = process.env.LIVEAVATAR_CONTEXT_ID_EN || LIVEAVATAR_CONTEXT_ID;
  const LIVEAVATAR_CONTEXT_ID_DE = process.env.LIVEAVATAR_CONTEXT_ID_DE || LIVEAVATAR_CONTEXT_ID;

  let heygenLanguage: string;
  let voiceId: string;
  let contextId: string;

  switch (language) {
    case "en":
      heygenLanguage = "en";
      voiceId = LIVEAVATAR_VOICE_ID_EN;
      contextId = LIVEAVATAR_CONTEXT_ID_EN;
      break;
    case "de":
      heygenLanguage = "de";
      voiceId = LIVEAVATAR_VOICE_ID_DE;
      contextId = LIVEAVATAR_CONTEXT_ID_DE;
      break;
    default:
      heygenLanguage = "ru";
      voiceId = LIVEAVATAR_VOICE_ID;
      contextId = LIVEAVATAR_CONTEXT_ID;
      break;
  }

  const payload = {
    mode: "FULL",
    avatar_id: LIVEAVATAR_AVATAR_ID,
    avatar_persona: {
      voice_id: voiceId,
      context_id: contextId,
      language: heygenLanguage
    }
  };

  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/token`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-API-KEY": LIVEAVATAR_API_KEY
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Token generation failed: ${response.status} - ${text}`);
  }

  const json = JSON.parse(text);
  return {
    session_id: json?.data?.session_id,
    session_token: json?.data?.session_token,
    raw: json
  };
}

export async function startSession(sessionToken: string): Promise<any> {
  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/start`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "authorization": `Bearer ${sessionToken}`
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Session start failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export async function stopSession(sessionId: string, sessionToken: string): Promise<any> {
  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/stop`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "authorization": `Bearer ${sessionToken}`
    },
    body: JSON.stringify({ session_id: sessionId })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Session stop failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export async function getSessionTranscript(sessionId: string): Promise<any> {
  if (!LIVEAVATAR_API_KEY) {
    throw new Error("Missing LIVEAVATAR_API_KEY in environment");
  }

  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/${sessionId}/transcript`, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "X-API-KEY": LIVEAVATAR_API_KEY
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Get transcript failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export async function sendEvent(sessionToken: string, eventType: string, data?: any): Promise<any> {
  const payload = {
    type: eventType,
    ...(data && { data })
  };

  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/event`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "authorization": `Bearer ${sessionToken}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Send event failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export function registerLiveAvatarRoutes(app: Express): void {
  app.post("/api/liveavatar/token", async (req: Request, res: Response) => {
    try {
      const { language = "ru" } = req.body || {};
      const result = await getSessionToken(language);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Token generation error:", error);
      res.status(500).json({
        error: "Token generation failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/start", async (req: Request, res: Response) => {
    try {
      const { session_token } = req.body || {};
      if (!session_token) {
        return res.status(400).json({ error: "Missing session_token" });
      }
      const result = await startSession(session_token);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Start session error:", error);
      res.status(500).json({
        error: "Session start failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/stop", async (req: Request, res: Response) => {
    try {
      const { session_id, session_token } = req.body || {};
      if (!session_id) {
        return res.status(400).json({ error: "Missing session_id" });
      }
      if (!session_token) {
        return res.status(400).json({ error: "Missing session_token" });
      }
      const result = await stopSession(session_id, session_token);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Stop session error:", error);
      res.status(500).json({
        error: "Session stop failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/event", async (req: Request, res: Response) => {
    try {
      const { session_token, event_type, data } = req.body || {};
      if (!session_token) {
        return res.status(400).json({ error: "Missing session_token" });
      }
      if (!event_type) {
        return res.status(400).json({ error: "Missing event_type" });
      }
      const result = await sendEvent(session_token, event_type, data);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Send event error:", error);
      res.status(500).json({
        error: "Send event failed",
        details: error?.message || String(error)
      });
    }
  });

  app.get("/api/liveavatar/transcript/:sessionId", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Missing sessionId" });
      }
      const result = await getSessionTranscript(sessionId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Get transcript error:", error);
      res.status(500).json({
        error: "Get transcript failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/sessions/:id/end", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id as string;
      const { session_token } = req.body || {};
      
      let transcript = null;
      if (session_token) {
        try {
          transcript = await getSessionTranscript(sessionId);
        } catch (e) {
          console.error("Failed to get transcript:", e);
        }
      }

      res.status(200).json({ ok: true, transcript });
    } catch (error: any) {
      console.error("End session error:", error);
      res.status(500).json({
        error: "End session failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/sessions/:id/transcript", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id as string;
      const { language = "de", messages = [] } = req.body || {};

      if (!messages.length) {
        return res.status(200).json({ ok: true, saved: 0 });
      }

      await storage.createChatSession({ sessionId, language, type: "video" });

      for (const msg of messages) {
        const role = msg.sender === "avatar" ? "assistant" : "user";
        await storage.saveChatMessage({
          sessionId,
          role,
          content: msg.text || "",
        });
      }

      res.status(200).json({ ok: true, saved: messages.length });
    } catch (error: any) {
      console.error("Save video transcript error:", error);
      res.status(500).json({
        error: "Save transcript failed",
        details: error?.message || String(error),
      });
    }
  });
}
