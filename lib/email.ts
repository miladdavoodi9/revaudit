import nodemailer from 'nodemailer';
import { AuditAnswers, AuditReport } from '@/types/audit';

const GMAIL_USER = process.env.GMAIL_USER ?? 'milad@3mdventures.com';
const INTERNAL   = 'milad@3mdventures.com';
const CALENDLY   = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/milad-3mdventures/30min';

function getTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function scoreColor(score: number) {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#eab308';
  if (score >= 45) return '#f97316';
  return '#ef4444';
}

// ─── User-facing email: short & punchy ───────────────────────────────────────

export async function sendThankYou(
  email: string,
  name: string,
  report: AuditReport
): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';
  const color     = scoreColor(report.overall_score);
  const fix       = report.top_3_fixes[0];

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#00091e;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:3px;color:#1097CD;text-transform:uppercase;">3MD Ventures</p>
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">Your RevOps Audit Results</h1>
  </td></tr>

  <!-- Score -->
  <tr><td style="background:#fff;padding:36px;text-align:center;border-bottom:1px solid #f3f4f6;">
    <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Hi ${firstName} — here's where you stand:</p>
    <p style="margin:8px 0 0;font-size:72px;font-weight:800;color:${color};line-height:1;">${report.overall_score}</p>
    <p style="margin:4px 0 8px;font-size:13px;color:#9ca3af;">out of 100</p>
    <span style="display:inline-block;padding:5px 14px;border-radius:6px;font-size:13px;font-weight:600;background:${color}22;color:${color};">${report.overall_label}</span>
    <p style="margin:16px 0 0;font-size:15px;color:#374151;font-style:italic;line-height:1.6;">&ldquo;${report.summary_headline}&rdquo;</p>
  </td></tr>

  <!-- Top fix -->
  <tr><td style="background:#fff;padding:28px 36px;border-bottom:1px solid #f3f4f6;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Your #1 Priority Fix</p>
    <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#111827;">${fix.title}</p>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">${fix.description}</p>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#00091e;padding:32px 36px;text-align:center;">
    <p style="margin:0 0 6px;font-size:17px;font-weight:700;color:#fff;">Want this fixed in 30 days?</p>
    <p style="margin:0 0 20px;font-size:13px;color:#1097CD;">Free 30-min review — no pitch, just a plan.</p>
    <a href="${CALENDLY}" style="display:inline-block;padding:13px 28px;background:#0068B5;color:#fff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">Book Your Free Call →</a>
  </td></tr>

  <!-- Signature -->
  <tr><td style="background:#fff;border-radius:0 0 16px 16px;padding:24px 36px;">
    <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;">Milad Davoodi</p>
    <p style="margin:0 0 2px;font-size:13px;color:#9ca3af;">Founder, 3MD Ventures</p>
    <p style="margin:0;font-size:13px;color:#9ca3af;">
      <a href="mailto:milad@3mdventures.com" style="color:#0068B5;text-decoration:none;">milad@3mdventures.com</a>
      &nbsp;·&nbsp;512-240-2568&nbsp;·&nbsp;
      <a href="https://www.3mdventures.com" style="color:#0068B5;text-decoration:none;">3mdventures.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await getTransport().sendMail({
    from: `Milad at 3MD Ventures <${GMAIL_USER}>`,
    to: email,
    subject: `Your RevOps Score: ${report.overall_score}/100 — ${report.overall_label}`,
    html,
  });

  console.log('[email] thank-you sent to', email);
}

// ─── Internal lead intel email ────────────────────────────────────────────────

const CATEGORY_NAMES: Record<string, string> = {
  pipeline_stage_design:   'Pipeline Stage Design',
  lead_source_attribution: 'Lead Source Attribution',
  data_completeness:       'Data Completeness',
  reporting_architecture:  'Reporting Architecture',
  revenue_leakage:         'Revenue Leakage',
};

export async function sendInternalSummary(
  email: string,
  name: string,
  answers: AuditAnswers,
  report: AuditReport
): Promise<void> {
  const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short' });

  const categoryDetail = Object.entries(report.categories).map(([key, cat]) => `
    <!-- ${CATEGORY_NAMES[key]} -->
    <tr><td colspan="3" style="padding:16px 28px 4px;background:#f9fafb;border-top:2px solid #e5e7eb;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:13px;font-weight:700;color:#111827;">${CATEGORY_NAMES[key] ?? key}</td>
        <td align="right">
          <span style="font-size:20px;font-weight:800;color:${scoreColor(cat.score)};">${cat.score}</span>
          <span style="font-size:12px;color:#9ca3af;">/100&nbsp;&nbsp;</span>
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${scoreColor(cat.score)}22;color:${scoreColor(cat.score)};">${cat.label}</span>
        </td>
      </tr></table>
    </td></tr>
    <tr><td colspan="3" style="padding:8px 28px 4px;">
      <ul style="margin:0;padding-left:18px;">
        ${cat.findings.map(f => `<li style="font-size:12px;color:#374151;margin-bottom:5px;line-height:1.5;">${f}</li>`).join('')}
      </ul>
    </td></tr>
    <tr><td colspan="3" style="padding:6px 28px 16px;">
      <p style="margin:0;font-size:12px;font-weight:600;color:#f97316;">ARR Impact: <span style="font-weight:400;">${cat.arr_impact}</span></p>
    </td></tr>`).join('');

  const fixDetail = report.top_3_fixes.map(fix => `
    <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:14px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:top;padding-right:12px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#111827;">#${fix.rank} — ${fix.title}</p>
          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">${fix.description}</p>
        </td>
        <td style="white-space:nowrap;vertical-align:top;text-align:right;font-size:11px;color:#9ca3af;">
          Effort: ${fix.effort}<br>Impact: ${fix.impact}
        </td>
      </tr></table>
    </td></tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

  <!-- Announcement banner -->
  <tr><td style="background:#00091e;padding:24px 28px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:3px;color:#1097CD;text-transform:uppercase;">New Submission · ${submittedAt} CT</p>
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;">Someone just completed their RevOps Audit</h1>
  </td></tr>

  <!-- Who submitted -->
  <tr><td style="padding:20px 28px;border-bottom:2px solid #e5e7eb;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Who Submitted</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:6px;width:110px;">Name</td>
        <td style="font-size:13px;font-weight:600;color:#111827;padding-bottom:6px;">${name || '—'}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:6px;">Email</td>
        <td style="font-size:13px;padding-bottom:6px;"><a href="mailto:${email}" style="color:#0068B5;text-decoration:none;font-weight:600;">${email}</a></td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:6px;">CRM</td>
        <td style="font-size:13px;color:#374151;padding-bottom:6px;">${answers.crm}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:6px;">Company Size</td>
        <td style="font-size:13px;color:#374151;padding-bottom:6px;">${answers.company_size} employees</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:6px;">Industry</td>
        <td style="font-size:13px;color:#374151;padding-bottom:6px;">${answers.industry || '—'}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;">ARR</td>
        <td style="font-size:13px;font-weight:600;color:#374151;">${answers.arr || 'Not provided'}</td>
      </tr>
    </table>
  </td></tr>

  <!-- Results at a glance -->
  <tr><td style="padding:20px 28px;border-bottom:2px solid #e5e7eb;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Results at a Glance</p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr>
      <td style="padding-right:20px;">
        <p style="margin:0;font-size:48px;font-weight:800;color:${scoreColor(report.overall_score)};line-height:1;">${report.overall_score}</p>
        <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">out of 100</p>
      </td>
      <td style="vertical-align:middle;">
        <span style="display:inline-block;padding:5px 12px;border-radius:6px;font-size:13px;font-weight:600;background:${scoreColor(report.overall_score)}22;color:${scoreColor(report.overall_score)};">${report.overall_label}</span>
        <p style="margin:8px 0 0;font-size:13px;color:#374151;font-style:italic;">&ldquo;${report.summary_headline}&rdquo;</p>
      </td>
    </tr></table>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${Object.entries(report.categories).map(([key, cat]) => `
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:8px 0;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:12px;color:#374151;">${CATEGORY_NAMES[key]}</td>
          <td align="right">
            <span style="font-size:13px;font-weight:700;color:${scoreColor(cat.score)};margin-right:8px;">${cat.score}</span>
            <span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;background:${scoreColor(cat.score)}22;color:${scoreColor(cat.score)};">${cat.label}</span>
          </td>
        </tr></table>
      </td></tr>`).join('')}
    </table>
  </td></tr>

  <!-- Full breakdown -->
  <tr><td style="padding:20px 28px 8px;">
    <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Full Category Breakdown</p>
  </td></tr>
  <table width="100%" cellpadding="0" cellspacing="0">${categoryDetail}</table>

  <!-- Top 3 fixes -->
  <tr><td style="padding:20px 28px 8px;border-top:2px solid #e5e7eb;">
    <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Top 3 Recommended Fixes</p>
  </td></tr>
  <table width="100%" cellpadding="0" cellspacing="0">${fixDetail}</table>

  <!-- Footer -->
  <tr><td style="background:#f3f4f6;padding:14px 28px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9ca3af;">RevAudit · 3MD Ventures · Internal use only</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await getTransport().sendMail({
    from: `Milad at 3MD Ventures <${GMAIL_USER}>`,
    to: INTERNAL,
    subject: `[New Lead] ${name || email} — ${report.overall_score}/100 ${report.overall_label} · ${answers.crm} · ${answers.company_size}`,
    html,
  });

  console.log('[email] internal summary sent for', email);
}
