import { google } from 'googleapis';
import { db } from './db';
import { chatSessions, chatMessages } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';

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

let cachedSpreadsheetIdDev: string | null = null;
let cachedSpreadsheetIdProd: string | null = null;
const OVERVIEW_SHEET = 'Übersicht';
const MAX_SESSIONS = 200;

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getSpreadsheetTitle(): string {
  return isProduction() ? 'JetUP Chat Logs PROD' : 'JetUP Chat Logs DEV';
}

function getCachedId(): string | null {
  return isProduction() ? cachedSpreadsheetIdProd : cachedSpreadsheetIdDev;
}

function setCachedId(id: string | null): void {
  if (isProduction()) {
    cachedSpreadsheetIdProd = id;
  } else {
    cachedSpreadsheetIdDev = id;
  }
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function shortId(sessionId: string): string {
  return sessionId.substring(0, 8);
}

function typeLabelShort(type: string): string {
  return type === 'video' ? 'Live' : 'Text';
}

function typeLabelLong(type: string): string {
  return type === 'video' ? 'Live Maria' : 'Text Chat';
}

function sessionSheetName(sessionId: string, type: string): string {
  return `${shortId(sessionId)} ${typeLabelShort(type)}`;
}

function roleLabel(role: string): string {
  return role === 'assistant' ? 'Maria' : 'User';
}

function findSheetBySessionId(sheets: any[], sessionId: string): { title: string; sheetId: number } | null {
  const sid = shortId(sessionId);
  for (const sheet of sheets) {
    const title = sheet.properties?.title || '';
    if (title.startsWith(sid)) {
      return { title, sheetId: sheet.properties?.sheetId };
    }
  }
  return null;
}

export async function getOrCreateSpreadsheet(): Promise<string> {
  const cached = getCachedId();
  if (cached) {
    try {
      const sheets = await getSheetsClient();
      await sheets.spreadsheets.get({ spreadsheetId: cached });
      return cached;
    } catch {
      setCachedId(null);
    }
  }

  const title = getSpreadsheetTitle();
  const drive = await getDriveClient();
  const res = await drive.files.list({
    q: `name='${title}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    setCachedId(res.data.files[0].id!);
    return getCachedId()!;
  }

  const sheets = await getSheetsClient();
  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [{ properties: { title: OVERVIEW_SHEET } }],
    },
  });

  setCachedId(createRes.data.spreadsheetId!);
  return getCachedId()!;
}

function buildSessionRows(messages: Array<{ role: string; content: string; timestamp: Date | string | null }>): any[][] {
  const headerRow = ['Dialog', 'Notizen'];
  const rows: any[][] = [headerRow];
  for (const msg of messages) {
    const time = formatTime(msg.timestamp);
    const label = roleLabel(msg.role || 'user');
    const content = (msg.content || '').trim();
    rows.push([`[${time}] ${label}: ${content}`]);
  }
  return rows;
}

export async function syncAllChatSessions(): Promise<{ spreadsheetId: string; sessionCount: number }> {
  const spreadsheetId = await getOrCreateSpreadsheet();
  const sheets = await getSheetsClient();

  const sessions = await db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
  const allMessages = await db.select().from(chatMessages).orderBy(chatMessages.timestamp);

  const limitedSessions = sessions.slice(0, MAX_SESSIONS);

  const messagesBySession = new Map<string, typeof allMessages>();
  for (const msg of allMessages) {
    if (!messagesBySession.has(msg.sessionId)) {
      messagesBySession.set(msg.sessionId, []);
    }
    messagesBySession.get(msg.sessionId)!.push(msg);
  }

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = spreadsheet.data.sheets || [];

  const deleteRequests: any[] = [];
  for (const sheet of existingSheets) {
    const title = sheet.properties?.title;
    if (title && title !== OVERVIEW_SHEET) {
      deleteRequests.push({
        deleteSheet: { sheetId: sheet.properties?.sheetId }
      });
    }
  }

  const hasOverview = existingSheets.some(s => s.properties?.title === OVERVIEW_SHEET);
  const addRequests: any[] = [];

  if (!hasOverview) {
    addRequests.push({
      addSheet: { properties: { title: OVERVIEW_SHEET, index: 0 } }
    });
  }

  for (let i = 0; i < limitedSessions.length; i++) {
    const session = limitedSessions[i];
    const sheetName = sessionSheetName(session.sessionId, session.type || 'text');
    addRequests.push({
      addSheet: { properties: { title: sheetName, index: i + 1 } }
    });
  }

  if (addRequests.length > 0 || deleteRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [...addRequests, ...deleteRequests] },
    });
  }

  for (const session of limitedSessions) {
    const sheetName = sessionSheetName(session.sessionId, session.type || 'text');
    const msgs = messagesBySession.get(session.sessionId) || [];

    const langLabel = (session.language || 'de').toUpperCase();
    const tLabel = typeLabelLong(session.type || 'text');
    const headerInfo = `Session: ${shortId(session.sessionId)} | ${langLabel} | ${tLabel} | ${formatDate(session.createdAt)}`;

    const msgRows = buildSessionRows(msgs);

    const sheetData: any[][] = [
      [headerInfo],
      [],
      ...msgRows,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: sheetData },
    });
  }

  const overviewHeaders = ['Nr', 'Session ID', 'Sprache', 'Typ', 'Datum', 'Nachrichten'];
  const overviewRows: any[][] = [overviewHeaders];

  for (let i = 0; i < limitedSessions.length; i++) {
    const session = limitedSessions[i];
    const msgCount = messagesBySession.get(session.sessionId)?.length || 0;

    overviewRows.push([
      i + 1,
      shortId(session.sessionId),
      (session.language || 'de').toUpperCase(),
      typeLabelShort(session.type || 'text'),
      formatDate(session.createdAt),
      msgCount,
    ]);
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `'${OVERVIEW_SHEET}'!A:F`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${OVERVIEW_SHEET}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: overviewRows },
  });

  const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const updatedSheets = updatedSpreadsheet.data.sheets || [];

  const formatRequests: any[] = [];
  for (const sheet of updatedSheets) {
    const title = sheet.properties?.title;
    const sheetId = sheet.properties?.sheetId;
    if (sheetId === undefined) continue;

    if (title === OVERVIEW_SHEET) {
      formatRequests.push(
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.9, green: 0.9, blue: 0.95 } } },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          }
        },
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
            properties: { pixelSize: 50 },
            fields: 'pixelSize',
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
            properties: { pixelSize: 120 },
            fields: 'pixelSize',
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 },
            properties: { pixelSize: 160 },
            fields: 'pixelSize',
          }
        },
      );
    } else {
      formatRequests.push(
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.95, green: 0.95, blue: 1.0 } } },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          }
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 2, endRowIndex: 3 },
            cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.93, green: 0.93, blue: 0.93 } } },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          }
        },
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 3 } },
            fields: 'gridProperties.frozenRowCount',
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
            properties: { pixelSize: 700 },
            fields: 'pixelSize',
          }
        },
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
            properties: { pixelSize: 300 },
            fields: 'pixelSize',
          }
        },
      );
    }
  }

  if (formatRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: formatRequests },
    });
  }

  return { spreadsheetId, sessionCount: limitedSessions.length };
}

export async function appendChatMessageToSheet(
  sessionId: string,
  role: string,
  content: string,
  language: string,
  type: string,
): Promise<void> {
  try {
    const spreadsheetId = await getOrCreateSpreadsheet();
    const sheets = await getSheetsClient();

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets || [];
    const found = findSheetBySessionId(existingSheets, sessionId);

    const time = formatTime(new Date());
    const label = roleLabel(role);
    const msgContent = content.trim();

    if (found) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${found.title}'!A:B`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [[`[${time}] ${label}: ${msgContent}`]] },
      });
    } else {
      const sheetName = sessionSheetName(sessionId, type);
      const sheetCount = existingSheets.length;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: { properties: { title: sheetName, index: sheetCount } }
          }]
        },
      });

      const langLabel = (language || 'de').toUpperCase();
      const tLabel = typeLabelLong(type);
      const headerInfo = `Session: ${shortId(sessionId)} | ${langLabel} | ${tLabel} | ${formatDate(new Date())}`;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            [headerInfo],
            [],
            ['Dialog', 'Notizen'],
            [`[${time}] ${label}: ${msgContent}`],
          ]
        },
      });

      const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
      const newSheet = updatedSpreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
      if (newSheet?.properties?.sheetId !== undefined) {
        const sheetId = newSheet.properties.sheetId;
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
                  cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.95, green: 0.95, blue: 1.0 } } },
                  fields: 'userEnteredFormat(textFormat,backgroundColor)',
                }
              },
              {
                repeatCell: {
                  range: { sheetId, startRowIndex: 2, endRowIndex: 3 },
                  cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.93, green: 0.93, blue: 0.93 } } },
                  fields: 'userEnteredFormat(textFormat,backgroundColor)',
                }
              },
              {
                updateSheetProperties: {
                  properties: { sheetId, gridProperties: { frozenRowCount: 3 } },
                  fields: 'gridProperties.frozenRowCount',
                }
              },
              {
                updateDimensionProperties: {
                  range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
                  properties: { pixelSize: 700 },
                  fields: 'pixelSize',
                }
              },
              {
                updateDimensionProperties: {
                  range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
                  properties: { pixelSize: 300 },
                  fields: 'pixelSize',
                }
              },
            ]
          },
        });
      }
    }

    await updateOverviewForSession(spreadsheetId, sheets, sessionId, language, type);
  } catch (error) {
    console.error('Failed to append message to Google Sheets:', error);
  }
}

async function updateOverviewForSession(
  spreadsheetId: string,
  sheets: any,
  sessionId: string,
  language: string,
  type: string,
): Promise<void> {
  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${OVERVIEW_SHEET}'!A:F`,
    });

    const rows: any[][] = existing.data.values || [];
    const sid = shortId(sessionId);
    let foundRow = -1;

    for (let i = 1; i < rows.length; i++) {
      const cellB = String(rows[i]?.[1] || '');
      if (cellB === sid) {
        foundRow = i;
        break;
      }
    }

    if (foundRow >= 0) {
      const currentCount = parseInt(rows[foundRow][5] || '0', 10);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${OVERVIEW_SHEET}'!F${foundRow + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[currentCount + 1]] },
      });
    } else {
      const newNr = rows.length;

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${OVERVIEW_SHEET}'!A:F`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [[
            newNr,
            sid,
            (language || 'de').toUpperCase(),
            typeLabelShort(type),
            formatDate(new Date()),
            1,
          ]]
        },
      });
    }
  } catch (error) {
    console.error('Failed to update Übersicht:', error);
  }
}
