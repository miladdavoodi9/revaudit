import { NextRequest, NextResponse, after } from 'next/server';
import { generateAudit, generateAuditFromSchema } from '@/lib/claude';
import { saveLead } from '@/lib/drive';
import { sendThankYou, sendInternalSummary } from '@/lib/email';
import { checkRateLimit } from '@/lib/ratelimit';
import { AuditAnswers } from '@/types/audit';

const EMAIL_RE      = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D']);
const VALID_CRM     = new Set(['Salesforce', 'HubSpot', 'Pipedrive', 'Monday.com', 'Other']);
const VALID_SIZE    = new Set(['1–10', '11–50', '51–200', '201–500', '500+']);
const VALID_ARR     = new Set(['Under $500K', '$500K–$1M', '$1M–$5M', '$5M–$20M', '$20M–$50M', '$50M+', '']);
const MAX_SCHEMA_CHARS = 400_000; // ~400 KB of text
const MAX_BODY_BYTES   = 600_000;

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function validateAnswers(answers: unknown): answers is AuditAnswers {
  if (!answers || typeof answers !== 'object') return false;
  const a = answers as Record<string, unknown>;
  for (const q of ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10']) {
    if (!VALID_ANSWERS.has(a[q] as string)) return false;
  }
  if (typeof a.crm !== 'string' || !VALID_CRM.has(a.crm)) return false;
  if (typeof a.company_size !== 'string' || !VALID_SIZE.has(a.company_size)) return false;
  if (a.arr !== undefined && !VALID_ARR.has(a.arr as string)) return false;
  return true;
}

function validateSchemaContext(ctx: unknown): ctx is { crm: string; company_size: string; industry?: string; arr?: string } {
  if (!ctx || typeof ctx !== 'object') return false;
  const c = ctx as Record<string, unknown>;
  if (!VALID_CRM.has(c.crm as string)) return false;
  if (!VALID_SIZE.has(c.company_size as string)) return false;
  if (c.arr !== undefined && !VALID_ARR.has(c.arr as string)) return false;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  // Body size guard
  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) return bad('Request body too large.', 413);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad('Invalid JSON body.');
  }

  const { answers, schema, schemaContext, email, name } = body;

  // Email validation
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return bad('A valid email address is required.');
  }

  // Name sanitization
  const safeName = typeof name === 'string' ? name.slice(0, 100).trim() : '';

  // Must provide one input path
  if (!answers && !schema) return bad('Provide either answers or a schema file.');

  // Schema path validation
  if (schema !== undefined) {
    if (typeof schema !== 'string') return bad('Schema must be a text string.');
    if (schema.length > MAX_SCHEMA_CHARS) return bad('Schema file is too large. Please export field definitions only, not records.');
    if (!validateSchemaContext(schemaContext)) return bad('Invalid CRM context provided.');
  }

  // Quiz path validation
  if (answers !== undefined && !validateAnswers(answers)) {
    return bad('Invalid answers format.');
  }

  try {
    const report = schema && schemaContext
      ? await generateAuditFromSchema(schema, schemaContext as { crm: string; company_size: string; industry?: string; arr?: string })
      : await generateAudit(answers as AuditAnswers);

    // Fire side-effects after response is sent — after() keeps the function
    // alive on Vercel until these complete instead of cutting them off early.
    after(async () => {
      await Promise.allSettled([
        saveLead({ email, name: safeName, answers: answers as AuditAnswers | undefined, report })
          .catch((err: unknown) => console.error('[drive] save failed:', err instanceof Error ? err.message : err)),
        sendThankYou(email, safeName, report)
          .catch((err: unknown) => console.error('[email] thank-you failed:', err instanceof Error ? err.message : err)),
        sendInternalSummary(email, safeName, answers as AuditAnswers | undefined, report)
          .catch((err: unknown) => console.error('[email] internal summary failed:', err instanceof Error ? err.message : err)),
      ]);
    });

    return NextResponse.json({ report });
  } catch (err) {
    // Log full error server-side, return generic message to client
    console.error('[audit] error:', err);
    return NextResponse.json({ error: 'Audit generation failed. Please try again.' }, { status: 500 });
  }
}
