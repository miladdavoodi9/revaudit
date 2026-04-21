import { Resend } from 'resend';
import { AuditReport } from '@/types/audit';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM     = process.env.EMAIL_FROM ?? 'Milad at 3MD Ventures <milad@3mdventures.com>';
const CALENDLY = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/milad-3mdventures/30min';

function scoreBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty  = 10 - filled;
  const color  = score >= 80 ? '#10b981' : score >= 65 ? '#eab308' : score >= 45 ? '#f97316' : '#ef4444';
  return `<span style="color:${color};font-size:18px;">${'█'.repeat(filled)}${'░'.repeat(empty)}</span>`;
}

function labelColor(label: string): string {
  if (label === 'Strong')    return '#10b981';
  if (label === 'Good')      return '#eab308';
  if (label === 'Needs Work') return '#f97316';
  return '#ef4444';
}

export async function sendThankYou(
  email: string,
  name: string,
  report: AuditReport
): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your RevOps Audit Results</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#00091e;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:3px;color:#1097CD;text-transform:uppercase;">3MD Ventures</p>
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">Your RevOps Audit is Ready</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px;">

          <p style="margin:0 0 24px;font-size:16px;color:#374151;">Hi ${firstName},</p>

          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
            Thanks for completing your RevOps audit. Here's a quick summary of where you stand — and where the biggest opportunities are.
          </p>

          <!-- Score card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:32px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Overall Score</p>
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:16px;">
                  <p style="margin:0;font-size:48px;font-weight:700;color:${labelColor(report.overall_label)};">${report.overall_score}</p>
                  <p style="margin:0;font-size:13px;color:#9ca3af;">out of 100</p>
                </td>
                <td style="vertical-align:middle;">
                  <span style="display:inline-block;padding:4px 12px;border-radius:6px;font-size:13px;font-weight:600;background:${labelColor(report.overall_label)}22;color:${labelColor(report.overall_label)};">${report.overall_label}</span>
                </td>
              </tr></table>
              <p style="margin:16px 0 8px;font-size:13px;color:#6b7280;">${scoreBar(report.overall_score)}&nbsp; ${report.overall_score}/100</p>
              <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">&ldquo;${report.summary_headline}&rdquo;</p>
            </td></tr>
          </table>

          <!-- Category breakdown -->
          <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#111827;text-transform:uppercase;letter-spacing:1px;">Category Breakdown</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            ${Object.entries(report.categories).map(([, cat]) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:13px;color:#374151;width:50%;">${
                    cat === report.categories.pipeline_stage_design ? 'Pipeline Stage Design' :
                    cat === report.categories.lead_source_attribution ? 'Lead Source Attribution' :
                    cat === report.categories.data_completeness ? 'Data Completeness' :
                    cat === report.categories.reporting_architecture ? 'Reporting Architecture' :
                    'Revenue Leakage'
                  }</td>
                  <td align="right" style="font-size:13px;font-weight:700;color:${labelColor(cat.label)};width:30px;">${cat.score}</td>
                  <td align="right" style="width:80px;"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${labelColor(cat.label)}22;color:${labelColor(cat.label)};">${cat.label}</span></td>
                </tr></table>
              </td>
            </tr>`).join('')}
          </table>

          <!-- Top fix -->
          <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#111827;text-transform:uppercase;letter-spacing:1px;">Your #1 Fix Right Now</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;margin-bottom:32px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#0c4a6e;">${report.top_3_fixes[0].title}</p>
              <p style="margin:0;font-size:14px;color:#075985;line-height:1.6;">${report.top_3_fixes[0].description}</p>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td align="center" style="background:#00091e;border-radius:12px;padding:32px 24px;">
              <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#ffffff;">Want these fixed in 30 days?</p>
              <p style="margin:0 0 24px;font-size:14px;color:#1097CD;line-height:1.6;">Book a free 30-minute RevOps review. I'll walk through your top fixes and build a 30-day action plan — no pitch, just specifics.</p>
              <a href="${CALENDLY}" style="display:inline-block;padding:14px 32px;background:#0068B5;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">Book a Free 30-Min Review →</a>
            </td></tr>
          </table>

          <!-- Contact -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:24px;margin-top:8px;">
            <tr><td>
              <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">Milad Davoodi</p>
              <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">Founder, 3MD Ventures</p>
              <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">
                <a href="mailto:milad@3mdventures.com" style="color:#0068B5;text-decoration:none;">milad@3mdventures.com</a>
                &nbsp;·&nbsp; 512-240-2568
              </p>
              <p style="margin:0;font-size:13px;color:#6b7280;">
                <a href="https://www.3mdventures.com" style="color:#0068B5;text-decoration:none;">3mdventures.com</a>
                &nbsp;·&nbsp;
                <a href="https://linkedin.com/in/miladdavoodi/" style="color:#0068B5;text-decoration:none;">LinkedIn</a>
              </p>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f3f4f6;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Built in Austin, TX &nbsp;·&nbsp; 3MD Ventures &nbsp;·&nbsp; One follow-up, no spam.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your RevOps Audit Score: ${report.overall_score}/100 — ${report.overall_label}`,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  console.log('[email] thank-you sent to', email);
}
