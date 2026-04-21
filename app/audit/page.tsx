'use client';

import { useState } from 'react';
import Image from 'next/image';
import AuditForm from '@/components/AuditForm';
import EmailCapture from '@/components/EmailCapture';
import AuditReport from '@/components/AuditReport';
import { AuditAnswers, AuditReport as AuditReportType } from '@/types/audit';

type Stage = 'form' | 'capture' | 'loading' | 'report' | 'error';

export default function AuditPage() {
  const [stage, setStage] = useState<Stage>('form');
  const [answers, setAnswers] = useState<AuditAnswers | null>(null);
  const [email, setEmail] = useState('');
  const [report, setReport] = useState<AuditReportType | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  function handleFormComplete(a: AuditAnswers) {
    setAnswers(a);
    setStage('capture');
  }

  async function handleEmailCapture(capturedEmail: string, name: string) {
    if (!answers) return;
    setEmail(capturedEmail);
    setStage('loading');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, email: capturedEmail, name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      setReport(data.report);
      setStage('report');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStage('error');
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Brand */}
        <div className="flex justify-center mb-10">
          <Image src="/3md-ventures.svg" alt="3MD Ventures" width={120} height={52} priority />
        </div>

        {stage === 'form' && (
          <AuditForm onComplete={handleFormComplete} />
        )}

        {stage === 'capture' && (
          <div className="flex flex-col items-center">
            <EmailCapture onCapture={handleEmailCapture} />
          </div>
        )}

        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-white font-semibold text-lg mb-1">Auditing your RevOps stack…</p>
              <p className="text-gray-500 text-sm">This takes about 10 seconds</p>
            </div>
          </div>
        )}

        {stage === 'report' && report && (
          <AuditReport report={report} email={email} />
        )}

        {stage === 'error' && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-12 h-12 bg-red-950 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-lg mb-2">Something went wrong</p>
              <p className="text-gray-500 text-sm mb-6 max-w-sm">{errorMsg}</p>
              <button
                onClick={() => {
                  setStage('form');
                  setAnswers(null);
                  setReport(null);
                  setErrorMsg('');
                }}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
