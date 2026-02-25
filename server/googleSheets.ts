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

function typeLabel(type: string): string {
  return type === 'video' ? 'Live' : 'Text';
}

function sessionSheetName(sessionId: string, type: string): string {
  return `${shortId(sessionId)} ${typeLabel(type)}`;
}

function roleLabel(role: string): string {
  return role === 'assistant' ? 'Maria' : 'User';
}

function buildDialogText(messages: Array<{ role: string; content: string; timestamp: Date | string | null }>): string {
  return messages.map(msg => {
    const time = formatTime(msg.timestamp);
    const label = roleLabel(msg.role || 'user');
    const content = (msg.content || '').trim();
    return `[${time}] ${label}: ${content}`;
  }).join('\n\n');
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
    const dialogText = buildDialogText(msgs);

    const langLabel = (session.language || 'de').toUpperCase();
    const tLabel = session.type === 'video' ? 'Live Maria' : 'Text Chat';
    const headerInfo = `Session: ${shortId(session.sessionId)} | ${langLabel} | ${tLabel} | ${formatDate(session.createdAt)}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [headerInfo, 'Notizen'],
          [],
          [dialogText],
        ]
      },
    });
  }

  const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const updatedSheets = updatedSpreadsheet.data.sheets || [];

  const sheetGids = new Map<string, number>();
  for (const sheet of updatedSheets) {
    const title = sheet.properties?.title || '';
    const gid = sheet.properties?.sheetId;
    if (gid !== undefined) {
      sheetGids.set(title, gid);
    }
  }

  const overviewHeaders = ['Nr', 'Session ID', 'Sprache', 'Typ', 'Datum', 'Nachrichten'];
  const overviewRows: any[][] = [overviewHeaders];

  for (let i = 0; i < limitedSessions.length; i++) {
    const session = limitedSessions[i];
    const sheetName = sessionSheetName(session.sessionId, session.type || 'text');
    const msgCount = messagesBySession.get(session.sessionId)?.length || 0;
    const sid = shortId(session.sessionId);
    const gid = sheetGids.get(sheetName);

    const sidCell = gid !== undefined
      ? `=HYPERLINK("#gid=${gid}", "${sid}")`
      : sid;

    overviewRows.push([
      i + 1,
      sidCell,
      (session.language || 'de').toUpperCase(),
      typeLabel(session.type || 'text'),
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
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: overviewRows },
  });

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
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
            properties: { pixelSize: 800 },
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
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 1 },
            cell: { userEnteredFormat: { wrapStrategy: 'WRAP', verticalAlignment: 'TOP' } },
            fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)',
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
    const newLine = `[${time}] ${label}: ${content.trim()}`;

    if (found) {
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${found.title}'!A3`,
      });

      const currentText = existing.data.values?.[0]?.[0] || '';
      const updatedText = currentText ? `${currentText}\n\n${newLine}` : newLine;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${found.title}'!A3`,
        valueInputOption: 'RAW',
        requestBody: { values: [[updatedText]] },
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
      const tLabel = type === 'video' ? 'Live Maria' : 'Text Chat';
      const headerInfo = `Session: ${shortId(sessionId)} | ${langLabel} | ${tLabel} | ${formatDate(new Date())}`;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            [headerInfo, 'Notizen'],
            [],
            [newLine],
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
                updateDimensionProperties: {
                  range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
                  properties: { pixelSize: 800 },
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
              {
                repeatCell: {
                  range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 1 },
                  cell: { userEnteredFormat: { wrapStrategy: 'WRAP', verticalAlignment: 'TOP' } },
                  fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)',
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
      const cellB = rows[i]?.[1] || '';
      if (cellB.includes(sid)) {
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
      const sheetName = sessionSheetName(sessionId, type);

      const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
      const allSheets = updatedSpreadsheet.data.sheets || [];
      const targetSheet = allSheets.find((s: any) => s.properties?.title === sheetName);
      const gid = targetSheet?.properties?.sheetId;

      const sidCell = gid !== undefined
        ? `=HYPERLINK("#gid=${gid}", "${sid}")`
        : sid;

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${OVERVIEW_SHEET}'!A:F`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [[
            newNr,
            sidCell,
            (language || 'de').toUpperCase(),
            typeLabel(type),
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
