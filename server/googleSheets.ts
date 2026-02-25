import { google } from 'googleapis';
import { db } from './db';
import { chatSessions, chatMessages } from '@shared/schema';
import { desc } from 'drizzle-orm';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

async function getSheetsClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

async function getDriveClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

let cachedSpreadsheetId: string | null = null;

const SPREADSHEET_TITLE = 'JetUP Chat Logs';
const SHEET_HEADERS = ['session_id', 'type', 'language', 'created_at', 'role', 'content', 'message_timestamp'];

export async function getOrCreateSpreadsheet(): Promise<string> {
  if (cachedSpreadsheetId) {
    try {
      const sheets = await getSheetsClient();
      await sheets.spreadsheets.get({ spreadsheetId: cachedSpreadsheetId });
      return cachedSpreadsheetId;
    } catch {
      cachedSpreadsheetId = null;
    }
  }

  const drive = await getDriveClient();
  const res = await drive.files.list({
    q: `name='${SPREADSHEET_TITLE}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    cachedSpreadsheetId = res.data.files[0].id!;
    return cachedSpreadsheetId;
  }

  const sheets = await getSheetsClient();
  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SPREADSHEET_TITLE },
      sheets: [{
        properties: { title: 'Chat Logs' },
      }],
    },
  });

  cachedSpreadsheetId = createRes.data.spreadsheetId!;

  await sheets.spreadsheets.values.update({
    spreadsheetId: cachedSpreadsheetId,
    range: 'Chat Logs!A1:G1',
    valueInputOption: 'RAW',
    requestBody: { values: [SHEET_HEADERS] },
  });

  return cachedSpreadsheetId;
}

export async function syncAllChatSessions(): Promise<{ spreadsheetId: string; rowCount: number }> {
  const spreadsheetId = await getOrCreateSpreadsheet();
  const sheets = await getSheetsClient();

  const sessions = await db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
  const allMessages = await db.select().from(chatMessages).orderBy(chatMessages.timestamp);

  const sessionMap = new Map<string, typeof sessions[0]>();
  for (const s of sessions) {
    sessionMap.set(s.sessionId, s);
  }

  const rows: string[][] = [];
  for (const msg of allMessages) {
    const session = sessionMap.get(msg.sessionId);
    rows.push([
      msg.sessionId,
      session?.type || '',
      session?.language || '',
      session?.createdAt?.toISOString() || '',
      msg.role || '',
      msg.content || '',
      msg.timestamp?.toISOString() || '',
    ]);
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: 'Chat Logs!A2:G',
  });

  if (rows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Chat Logs!A1:G1',
      valueInputOption: 'RAW',
      requestBody: { values: [SHEET_HEADERS] },
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Chat Logs!A2:G',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows },
    });
  }

  return { spreadsheetId, rowCount: rows.length };
}

export async function appendChatMessageToSheet(
  sessionId: string,
  role: string,
  content: string,
  language: string,
  type: string,
  sessionCreatedAt?: string,
): Promise<void> {
  try {
    const spreadsheetId = await getOrCreateSpreadsheet();
    const sheets = await getSheetsClient();

    const row = [
      sessionId,
      type,
      language,
      sessionCreatedAt || new Date().toISOString(),
      role,
      content,
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Chat Logs!A2:G',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });
  } catch (error) {
    console.error('Failed to append message to Google Sheets:', error);
  }
}
