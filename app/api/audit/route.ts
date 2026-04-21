import { NextRequest, NextResponse } from 'next/server';
import { generateAudit } from '@/lib/claude';
import { saveLead } from '@/lib/drive';
import { sendThankYou } from '@/lib/email';
import { AuditAnswers } from '@/types/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, email, name } = body as {
      answers: AuditAnswers;
      email: string;
      name: string;
    };

    if (!answers || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const report = await generateAudit(answers);

    // Non-blocking side-effects — log errors but don't fail the response
    saveLead({ email, name: name ?? '', answers, report }).catch((err: unknown) => {
      console.error('[drive] save failed:', err instanceof Error ? err.message : err);
    });

    sendThankYou(email, name ?? '', report).catch((err: unknown) => {
      console.error('[email] send failed:', err instanceof Error ? err.message : err);
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
