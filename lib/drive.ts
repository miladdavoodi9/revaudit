import { google } from 'googleapis';
import { AuditAnswers, AuditReport } from '@/types/audit';

export interface AuditLead {
  email: string;
  name: string;
  answers: AuditAnswers;
  report: AuditReport;
}

const TAB_NAME = 'RevAudit Leads';
const HEADERS = [
  'Timestamp',
  'Email',
  'Name',
  'Overall Score',
  'Risk Label',
  'Summary Headline',
  'CRM',
  'Company Size',
  'Industry',
  'ARR',
  'Answers JSON',
  'Report JSON',
];

async function getSheets() {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google OAuth env vars (CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN)');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000');
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

async function ensureTab(
  sheets: Awaited<ReturnType<typeof getSheets>>,
  spreadsheetId: string
) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTabs = meta.data.sheets?.map((s) => s.properties?.title) ?? [];

  if (!existingTabs.includes(TAB_NAME)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: TAB_NAME } } }] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TAB_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function saveLead(lead: AuditLead): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error('GOOGLE_SHEET_ID not set');

  console.log('[drive] saving lead for', lead.email);

  const sheets = await getSheets();
  await ensureTab(sheets, spreadsheetId);

  const row = [
    new Date().toISOString(),
    lead.email,
    lead.name,
    lead.report.overall_score,
    lead.report.overall_label,
    lead.report.summary_headline,
    lead.answers.crm,
    lead.answers.company_size,
    lead.answers.industry ?? '',
    lead.answers.arr ?? '',
    JSON.stringify(lead.answers),
    JSON.stringify(lead.report),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TAB_NAME}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });

  console.log('[drive] lead saved successfully for', lead.email);
}
