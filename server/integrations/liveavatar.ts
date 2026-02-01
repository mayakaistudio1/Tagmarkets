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

const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;
const LIVEAVATAR_AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID || "YOUR_AVATAR_ID";
const LIVEAVATAR_VOICE_ID = process.env.LIVEAVATAR_VOICE_ID || "YOUR_VOICE_ID";
const LIVEAVATAR_CONTEXT_ID = process.env.LIVEAVATAR_CONTEXT_ID || "YOUR_CONTEXT_ID";
const LIVEAVATAR_BASE_URL = "https://api.liveavatar.com/v1";

export async function getSessionToken(language: string = "ru"): Promise<any> {
  if (!LIVEAVATAR_API_KEY) {
    throw new Error("Missing LIVEAVATAR_API_KEY in environment");
  }

  // Use simple language codes for HeyGen API: "ru" or "en"
  const heygenLanguage = language === "en" ? "en" : "ru";
  
  // Use English voice if available, otherwise default voice
  const LIVEAVATAR_VOICE_ID_EN = process.env.LIVEAVATAR_VOICE_ID_EN || LIVEAVATAR_VOICE_ID;
  const voiceId = language === "en" ? LIVEAVATAR_VOICE_ID_EN : LIVEAVATAR_VOICE_ID;

  // Use English context if available, otherwise use default (Russian) context
  const LIVEAVATAR_CONTEXT_ID_EN = process.env.LIVEAVATAR_CONTEXT_ID_EN;
  const contextId = language === "en" ? (LIVEAVATAR_CONTEXT_ID_EN || LIVEAVATAR_CONTEXT_ID) : LIVEAVATAR_CONTEXT_ID;

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
}
