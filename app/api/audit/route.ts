import { NextRequest, NextResponse } from 'next/server';
import { generateAudit } from '@/lib/claude';
import { saveLead } from '@/lib/drive';
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

    // Non-blocking — do not fail the request if Drive write fails
    saveLead({ email, name: name ?? '', answers, report }).catch((err) => {
      console.error('Drive save failed:', err);
    });

    return NextResponse.json({ report });
  } catch (err) {
    console.error('Audit API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audit generation failed' },
      { status: 500 }
    );
  }
}
