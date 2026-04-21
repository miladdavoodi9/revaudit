import { NextRequest, NextResponse } from 'next/server';
import { generateAudit, generateAuditFromSchema } from '@/lib/claude';
import { saveLead } from '@/lib/drive';
import { sendThankYou, sendInternalSummary } from '@/lib/email';
import { AuditAnswers } from '@/types/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, schema, schemaContext, email, name } = body as {
      answers?: AuditAnswers;
      schema?: string;
      schemaContext?: { crm: string; company_size: string; industry?: string; arr?: string };
      email: string;
      name: string;
    };

    if (!email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!answers && !schema) {
      return NextResponse.json({ error: 'Provide either answers or a schema' }, { status: 400 });
    }

    const report = schema && schemaContext
      ? await generateAuditFromSchema(schema, schemaContext)
      : await generateAudit(answers!);

    // Non-blocking side-effects — log errors but don't fail the response
    saveLead({ email, name: name ?? '', answers, report }).catch((err: unknown) => {
      console.error('[drive] save failed:', err instanceof Error ? err.message : err);
    });

    sendThankYou(email, name ?? '', report).catch((err: unknown) => {
      console.error('[email] thank-you failed:', err instanceof Error ? err.message : err);
    });

    sendInternalSummary(email, name ?? '', answers, report).catch((err: unknown) => {
      console.error('[email] internal summary failed:', err instanceof Error ? err.message : err);
    });

    return NextResponse.json({ report });
  } catch (err) {
    console.error('[audit] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audit generation failed' },
      { status: 500 }
    );
  }
}
