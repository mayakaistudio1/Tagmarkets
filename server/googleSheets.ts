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

let cachedSpreadsheetId: string | null = null;
const SPREADSHEET_TITLE = 'JetUP Chat Logs';
const OVERVIEW_SHEET = 'Übersicht';
const MAX_SESSIONS = 200;

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

function sessionSheetName(sessionId: string, language: string): string {
  const lang = (language || 'de').toUpperCase();
  return `${shortId(sessionId)} ${lang}`;
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
      sheets: [{ properties: { title: OVERVIEW_SHEET } }],
    },
  });

  cachedSpreadsheetId = createRes.data.spreadsheetId!;
  return cachedSpreadsheetId;
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
    const sheetName = sessionSheetName(session.sessionId, session.language || 'de');
    addRequests.push({
      addSheet: { properties: { title: sheetName, index: i + 1 } }
    });
  }

  if (deleteRequests.length > 0 || addRequests.length > 0) {
    const allRequests = [...addRequests, ...deleteRequests];
    if (allRequests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: allRequests },
      });
    }
  }

  const overviewHeaders = ['Nr', 'Session ID', 'Sprache', 'Typ', 'Datum', 'Nachrichten'];
  const overviewRows: any[][] = [overviewHeaders];

  for (let i = 0; i < limitedSessions.length; i++) {
    const session = limitedSessions[i];
    const sheetName = sessionSheetName(session.sessionId, session.language || 'de');
    const msgCount = messagesBySession.get(session.sessionId)?.length || 0;
    const sid = shortId(session.sessionId);

    overviewRows.push([
      i + 1,
      `=HYPERLINK("#gid=" & INDIRECT("'" & "${sheetName}" & "'!ZZ1", FALSE), "${sid}")`,
      (session.language || 'de').toUpperCase(),
      session.type === 'video' ? 'Video' : 'Text',
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

  for (const session of limitedSessions) {
    const sheetName = sessionSheetName(session.sessionId, session.language || 'de');
    const msgs = messagesBySession.get(session.sessionId) || [];
    const dialogText = buildDialogText(msgs);

    const langLabel = (session.language || 'de').toUpperCase();
    const typeLabel = session.type === 'video' ? 'Video' : 'Text';
    const headerInfo = `Session: ${shortId(session.sessionId)} | ${langLabel} | ${typeLabel} | ${formatDate(session.createdAt)}`;

    const sheetData: any[][] = [
      [headerInfo, 'Notizen'],
      [],
      [dialogText],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: sheetData },
    });
  }

  const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const updatedSheets = updatedSpreadsheet.data.sheets || [];

  const formatRequests: any[] = [];
  for (const sheet of updatedSheets) {
    const title = sheet.properties?.title;
    const sheetId = sheet.properties?.sheetId;
    if (sheetId === undefined) continue;

    if (title === OVERVIEW_SHEET) {
      formatRequests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.9, green: 0.9, blue: 0.95 } } },
          fields: 'userEnteredFormat(textFormat,backgroundColor)',
        }
      });
      formatRequests.push({
        updateSheetProperties: {
          properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
          fields: 'gridProperties.frozenRowCount',
        }
      });
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
          properties: { pixelSize: 50 },
          fields: 'pixelSize',
        }
      });
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
          properties: { pixelSize: 120 },
          fields: 'pixelSize',
        }
      });
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 },
          properties: { pixelSize: 160 },
          fields: 'pixelSize',
        }
      });
    } else {
      formatRequests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.95, green: 0.95, blue: 1.0 } } },
          fields: 'userEnteredFormat(textFormat,backgroundColor)',
        }
      });
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
          properties: { pixelSize: 800 },
          fields: 'pixelSize',
        }
      });
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
          properties: { pixelSize: 300 },
          fields: 'pixelSize',
        }
      });
      formatRequests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 1 },
          cell: { userEnteredFormat: { wrapStrategy: 'WRAP', verticalAlignment: 'TOP' } },
          fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)',
        }
      });
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
    const sheetName = sessionSheetName(sessionId, language);

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets || [];
    const sheetExists = existingSheets.some(s => s.properties?.title === sheetName);

    const time = formatTime(new Date());
    const label = roleLabel(role);
    const newLine = `[${time}] ${label}: ${content.trim()}`;

    if (!sheetExists) {
      const sheetCount = existingSheets.length;
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: { properties: { title: sheetName, index: sheetCount } }
          }]
        },
      });

      const langLabel = language.toUpperCase();
      const typeLabel = type === 'video' ? 'Video' : 'Text';
      const headerInfo = `Session: ${shortId(sessionId)} | ${langLabel} | ${typeLabel} | ${formatDate(new Date())}`;

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
    } else {
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A3`,
      });

      const currentText = existing.data.values?.[0]?.[0] || '';
      const updatedText = currentText ? `${currentText}\n\n${newLine}` : newLine;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A3`,
        valueInputOption: 'RAW',
        requestBody: { values: [[updatedText]] },
      });
    }
  } catch (error) {
    console.error('Failed to append message to Google Sheets:', error);
  }
}
