import { storage } from "../storage";
import type { InsertZoomAttendance } from "@shared/schema";

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
      console.error("Zoom participants API error:", await res.text());
      return [];
    }

    const data = await res.json();
    return data.participants || [];
  } catch (error) {
    console.error("Failed to fetch Zoom participants:", error);
    return [];
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

export async function syncZoomDataForEvent(inviteEventId: number, zoomMeetingUrl: string): Promise<{
  participants: ZoomParticipant[];
  synced: number;
}> {
  const meetingIdMatch = zoomMeetingUrl.match(/\/j\/(\d+)/);
  if (!meetingIdMatch) {
    return { participants: [], synced: 0 };
  }

  const meetingId = meetingIdMatch[1];
  const participants = await fetchZoomMeetingParticipants(meetingId);
  const qaData = await fetchZoomMeetingQA(meetingId);

  const guests = await storage.getGuestsByEventId(inviteEventId);
  let synced = 0;

  for (const participant of participants) {
    const matchedGuest = guests.find(
      (g) => g.email.toLowerCase() === participant.user_email.toLowerCase()
    );

    const questionsCount = qaData.filter(
      (q) => q.email.toLowerCase() === participant.user_email.toLowerCase()
    ).length;

    const attendanceData: InsertZoomAttendance = {
      inviteGuestId: matchedGuest?.id || null,
      inviteEventId,
      participantEmail: participant.user_email,
      participantName: participant.name,
      joinTime: new Date(participant.join_time),
      leaveTime: new Date(participant.leave_time),
      durationMinutes: Math.round(participant.duration / 60),
      questionsAsked: questionsCount,
    };

    await storage.createZoomAttendance(attendanceData);
    synced++;
  }

  return { participants, synced };
}
