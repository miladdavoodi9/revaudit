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
  'Answers JSON',
  'Report JSON',
];

async function getSheets() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

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
      requestBody: {
        requests: [{ addSheet: { properties: { title: TAB_NAME } } }],
      },
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
  if (!spreadsheetId || spreadsheetId === 'your_sheet_id_here') {
    throw new Error('GOOGLE_SHEET_ID not set');
  }

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
    lead.answers.industry,
    JSON.stringify(lead.answers),
    JSON.stringify(lead.report),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TAB_NAME}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}
