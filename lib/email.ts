import { Resend } from 'resend';
import { AuditAnswers, AuditReport } from '@/types/audit';

const resend   = new Resend(process.env.RESEND_API_KEY);
const FROM     = process.env.EMAIL_FROM ?? 'Milad at 3MD Ventures <milad@3mdventures.com>';
const INTERNAL = 'milad@3mdventures.com';
const CALENDLY = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/milad-3mdventures/30min';

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

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your RevOps Score: ${report.overall_score}/100 — ${report.overall_label}`,
    html,
  });

  if (error) throw new Error(`Resend user email error: ${error.message}`);
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
  const categoryRows = Object.entries(report.categories).map(([key, cat]) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:14px 16px;font-size:13px;font-weight:600;color:#111827;">${CATEGORY_NAMES[key] ?? key}</td>
      <td style="padding:14px 8px;font-size:13px;font-weight:700;color:${scoreColor(cat.score)};text-align:center;">${cat.score}</td>
      <td style="padding:14px 8px;text-align:center;">
        <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${scoreColor(cat.score)}22;color:${scoreColor(cat.score)};">${cat.label}</span>
      </td>
    </tr>
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td colspan="3" style="padding:0 16px 14px;">
        <ul style="margin:0;padding-left:18px;">
          ${cat.findings.map(f => `<li style="font-size:12px;color:#6b7280;margin-bottom:4px;">${f}</li>`).join('')}
        </ul>
        <p style="margin:8px 0 0;font-size:12px;color:#f97316;"><strong>ARR Impact:</strong> ${cat.arr_impact}</p>
      </td>
    </tr>`).join('');

  const fixRows = report.top_3_fixes.map(fix => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#111827;">#${fix.rank} ${fix.title}</td>
      <td style="padding:12px 8px;font-size:12px;color:#6b7280;text-align:center;">Effort: ${fix.effort}</td>
      <td style="padding:12px 8px;font-size:12px;color:#6b7280;text-align:center;">Impact: ${fix.impact}</td>
    </tr>
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td colspan="3" style="padding:0 16px 12px;font-size:12px;color:#6b7280;">${fix.description}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

  <tr><td style="background:#00091e;border-radius:12px 12px 0 0;padding:20px 28px;">
    <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:3px;color:#1097CD;text-transform:uppercase;">Internal Lead Alert</p>
    <h1 style="margin:4px 0 0;font-size:20px;font-weight:700;color:#fff;">New RevAudit Submission</h1>
  </td></tr>

  <!-- Lead info -->
  <tr><td style="background:#fff;padding:24px 28px;border-bottom:1px solid #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:8px;width:120px;">Name</td>
        <td style="font-size:13px;font-weight:600;color:#111827;padding-bottom:8px;">${name || '—'}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:8px;">Email</td>
        <td style="font-size:13px;font-weight:600;color:#0068B5;padding-bottom:8px;"><a href="mailto:${email}" style="color:#0068B5;text-decoration:none;">${email}</a></td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:8px;">CRM</td>
        <td style="font-size:13px;color:#374151;padding-bottom:8px;">${answers.crm}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:8px;">Company Size</td>
        <td style="font-size:13px;color:#374151;padding-bottom:8px;">${answers.company_size} employees</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;padding-bottom:8px;">Industry</td>
        <td style="font-size:13px;color:#374151;padding-bottom:8px;">${answers.industry || '—'}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#9ca3af;">ARR</td>
        <td style="font-size:13px;font-weight:600;color:#374151;">${answers.arr || 'Not provided'}</td>
      </tr>
    </table>
  </td></tr>

  <!-- Overall score -->
  <tr><td style="background:#fff;padding:20px 28px;border-bottom:1px solid #f3f4f6;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:16px;">
        <p style="margin:0 0 2px;font-size:11px;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Overall</p>
        <p style="margin:0;font-size:36px;font-weight:800;color:${scoreColor(report.overall_score)};line-height:1;">${report.overall_score}<span style="font-size:16px;font-weight:400;color:#9ca3af;">/100</span></p>
      </td>
      <td style="vertical-align:middle;">
        <span style="display:inline-block;padding:4px 12px;border-radius:6px;font-size:13px;font-weight:600;background:${scoreColor(report.overall_score)}22;color:${scoreColor(report.overall_score)};">${report.overall_label}</span>
        <p style="margin:6px 0 0;font-size:13px;color:#6b7280;font-style:italic;">&ldquo;${report.summary_headline}&rdquo;</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Categories -->
  <tr><td style="background:#fff;padding:0;">
    <p style="margin:0;padding:16px 28px 8px;font-size:11px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Category Breakdown</p>
    <table width="100%" cellpadding="0" cellspacing="0">${categoryRows}</table>
  </td></tr>

  <!-- Top 3 fixes -->
  <tr><td style="background:#fff;padding:0;border-top:1px solid #e5e7eb;">
    <p style="margin:0;padding:16px 28px 8px;font-size:11px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Top 3 Fixes</p>
    <table width="100%" cellpadding="0" cellspacing="0">${fixRows}</table>
  </td></tr>

  <tr><td style="background:#f3f4f6;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">RevAudit by 3MD Ventures &nbsp;·&nbsp; Submitted ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short' })} CT</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: INTERNAL,
    subject: `[RevAudit Lead] ${name || email} — ${report.overall_score}/100 ${report.overall_label} · ${answers.crm} · ${answers.company_size}`,
    html,
  });

  if (error) throw new Error(`Resend internal email error: ${error.message}`);
  console.log('[email] internal summary sent for', email);
}
