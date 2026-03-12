import { storage } from "../storage";
import type { InsertZoomAttendance } from "@shared/schema";

export async function loadZoomCredentialsFromDb(): Promise<void> {
  try {
    const accountId = await storage.getSetting("zoom_account_id");
    const clientId = await storage.getSetting("zoom_client_id");
    const clientSecret = await storage.getSetting("zoom_client_secret");
    if (accountId && !process.env.ZOOM_ACCOUNT_ID) process.env.ZOOM_ACCOUNT_ID = accountId;
    if (clientId && !process.env.ZOOM_CLIENT_ID) process.env.ZOOM_CLIENT_ID = clientId;
    if (clientSecret && !process.env.ZOOM_CLIENT_SECRET) process.env.ZOOM_CLIENT_SECRET = clientSecret;
  } catch (e) {
    console.error("Failed to load Zoom credentials from DB:", e);
  }
}

export async function saveZoomCredentialsToDb(accountId: string, clientId: string, clientSecret: string): Promise<void> {
  await storage.setSetting("zoom_account_id", accountId);
  await storage.setSetting("zoom_client_id", clientId);
  await storage.setSetting("zoom_client_secret", clientSecret);
  cachedToken = null;
}

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZoomParticipant {
  id?: string;
  name: string;
  user_email: string;
  join_time: string;
  leave_time: string;
  duration: number;
}

interface ZoomQAEntry {
  email: string;
  question: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export function isZoomConfigured(): boolean {
  return !!(
    process.env.ZOOM_ACCOUNT_ID &&
    process.env.ZOOM_CLIENT_ID &&
    process.env.ZOOM_CLIENT_SECRET
  );
}

async function getZoomAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID!;
  const clientId = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=account_credentials&account_id=${accountId}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom OAuth failed: ${err}`);
  }

  const data: ZoomTokenResponse = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export async function testZoomConnection(): Promise<{ ok: boolean; error?: string }> {
  if (!isZoomConfigured()) {
    return { ok: false, error: "Zoom credentials not configured (ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET)" };
  }
  try {
    const token = await getZoomAccessToken();
    const res = await fetch("https://api.zoom.us/v2/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Zoom API returned ${res.status}: ${body}` };
    }
    const data = await res.json();
    return { ok: true, error: undefined };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function fetchZoomMeetingParticipants(meetingId: string): Promise<ZoomParticipant[]> {
  if (!isZoomConfigured()) return [];

  try {
    const token = await getZoomAccessToken();
    const cleanId = meetingId.replace(/\s/g, "");

    const res = await fetch(
      `https://api.zoom.us/v2/report/meetings/${cleanId}/participants?page_size=300`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      if (res.status === 404) {
        console.log("Zoom meeting not found or not yet ended:", cleanId);
        throw new Error("Meeting not found or has not ended yet. Zoom data is available after the meeting ends.");
      } else if (res.status === 429) {
        console.error("Zoom API rate limit hit");
        throw new Error("Zoom API rate limit reached. Please try again in a few minutes.");
      } else {
        console.error("Zoom participants API error:", res.status, errorText);
        throw new Error(`Zoom API error (${res.status}): ${errorText}`);
      }
    }

    const data = await res.json();
    return data.participants || [];
  } catch (error: any) {
    console.error("Failed to fetch Zoom participants:", error);
    throw error;
  }
}

export async function fetchZoomMeetingQA(meetingId: string): Promise<ZoomQAEntry[]> {
  if (!isZoomConfigured()) return [];

  try {
    const token = await getZoomAccessToken();
    const cleanId = meetingId.replace(/\s/g, "");

    const res = await fetch(
      `https://api.zoom.us/v2/report/meetings/${cleanId}/qa`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const entries: ZoomQAEntry[] = [];
    for (const q of data.questions || []) {
      entries.push({ email: q.email || "", question: q.question_details?.[0]?.question || "" });
    }
    return entries;
  } catch {
    return [];
  }
}

export function extractMeetingId(zoomUrl: string): string | null {
  const match = zoomUrl.match(/\/j\/(\d+)/);
  return match ? match[1] : null;
}

export async function syncZoomDataForEvent(inviteEventId: number, zoomMeetingUrl: string): Promise<{
  participants: ZoomParticipant[];
  synced: number;
  skipped: number;
  error?: string;
}> {
  if (!isZoomConfigured()) {
    return { participants: [], synced: 0, skipped: 0, error: "Zoom not configured" };
  }

  const meetingId = extractMeetingId(zoomMeetingUrl);
  if (!meetingId) {
    return { participants: [], synced: 0, skipped: 0, error: "Invalid Zoom URL — could not extract meeting ID" };
  }

  let participants: ZoomParticipant[];
  try {
    participants = await fetchZoomMeetingParticipants(meetingId);
  } catch (error: any) {
    return { participants: [], synced: 0, skipped: 0, error: error.message };
  }
  if (participants.length === 0) {
    return { participants: [], synced: 0, skipped: 0, error: "No participants found. The meeting may not have ended yet or the ID is incorrect." };
  }

  const qaData = await fetchZoomMeetingQA(meetingId);
  const guests = await storage.getGuestsByEventId(inviteEventId);
  const existingAttendance = await storage.getZoomAttendanceByEventId(inviteEventId);
  const existingEmails = new Set(existingAttendance.map(a => a.participantEmail.toLowerCase()));

  let synced = 0;
  let skipped = 0;

  for (const participant of participants) {
    const email = participant.user_email?.toLowerCase() || "";
    if (existingEmails.has(email)) {
      skipped++;
      continue;
    }

    const matchedGuest = guests.find(
      (g) => g.email.toLowerCase() === email
    );

    const questionsCount = qaData.filter(
      (q) => q.email.toLowerCase() === email
    ).length;

    const attendanceData: InsertZoomAttendance = {
      inviteGuestId: matchedGuest?.id || null,
      inviteEventId,
      participantEmail: participant.user_email || "unknown",
      participantName: participant.name,
      joinTime: new Date(participant.join_time),
      leaveTime: new Date(participant.leave_time),
      durationMinutes: participant.duration,
      questionsAsked: questionsCount,
    };

    await storage.createZoomAttendance(attendanceData);
    existingEmails.add(email);
    synced++;
  }

  return { participants, synced, skipped };
}
