'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  AuditReport as AuditReportType,
  CATEGORY_META,
  getScoreColor,
  getScoreBg,
  getLabelColor,
  EffortImpact,
  RiskLabel,
} from '@/types/audit';

interface AuditReportProps {
  report: AuditReportType;
  email: string;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = animated ? circumference - (score / 100) * circumference : circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function EffortBadge({ value, type }: { value: EffortImpact; type: 'effort' | 'impact' }) {
  const colorMap: Record<EffortImpact, string> = {
    Low: type === 'effort' ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-800 text-gray-400',
    Medium: 'bg-yellow-900 text-yellow-300',
    High: type === 'effort' ? 'bg-red-900 text-red-300' : 'bg-brand-900 text-brand-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${colorMap[value]}`}>
      {type === 'effort' ? 'Effort: ' : 'Impact: '}{value}
    </span>
  );
}

function LabelBadge({ label }: { label: RiskLabel }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getLabelColor(label)}`}>
      {label}
    </span>
  );
}

export default function AuditReport({ report, email }: AuditReportProps) {
  const categories = Object.entries(report.categories) as [
    keyof typeof report.categories,
    (typeof report.categories)[keyof typeof report.categories]
  ][];

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '#';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="text-center pt-6">
        <h1 className="text-3xl font-bold text-white mb-3">Your RevOps Audit Report</h1>
        <p className="text-gray-400 italic text-base max-w-xl mx-auto">
          &ldquo;{report.summary_headline}&rdquo;
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
        <ScoreRing score={report.overall_score} size={128} />
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">Overall Score</p>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-4xl font-bold ${getScoreColor(report.overall_score)}`}>
              {report.overall_score}
            </span>
            <LabelBadge label={report.overall_label} />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            {report.summary_headline}
          </p>
        </div>
      </div>

      {/* Category Scorecard */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Category Scorecard</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {categories.map(([key, cat]) => (
            <div key={key} className="px-6 py-4 flex items-center gap-4">
              <div className="w-40 flex-shrink-0">
                <p className="text-sm font-medium text-gray-300 leading-tight">
                  {CATEGORY_META[key].display}
                </p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getScoreBg(cat.score)}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <LabelBadge label={cat.label} />
                <span className={`text-sm font-bold w-8 text-right ${getScoreColor(cat.score)}`}>
                  {cat.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Detail Cards */}
      {categories.map(([key, cat]) => (
        <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand-400 uppercase mb-1">
                Category
              </p>
              <h3 className="text-lg font-semibold text-white">{CATEGORY_META[key].display}</h3>
              <p className="text-gray-500 text-xs mt-1">{CATEGORY_META[key].description}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className={`text-3xl font-bold ${getScoreColor(cat.score)}`}>{cat.score}</div>
              <LabelBadge label={cat.label} />
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Findings</p>
              <ul className="space-y-2">
                {cat.findings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-500 mt-0.5">
                      {i + 1}
                    </span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">ARR Impact</p>
              <p className="text-sm text-gray-300">{cat.arr_impact}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Top 3 Fixes */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Top 3 Fixes</h2>
        <div className="space-y-4">
          {report.top_3_fixes.map((fix) => (
            <div key={fix.rank} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-900 rounded-xl flex items-center justify-center text-brand-300 font-bold text-sm">
                  {fix.rank}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white mb-2">{fix.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{fix.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <EffortBadge value={fix.effort} type="effort" />
                    <EffortBadge value={fix.impact} type="impact" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Block */}
      <div className="bg-brand-950 border border-brand-800 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Want these fixed in 30 days?</h2>
        <p className="text-brand-300 text-sm mb-6 max-w-md mx-auto">
          Book a free 30-minute RevOps review with Milad. We&apos;ll walk through your top 3 fixes and build a 30-day action plan — no pitch, just specifics.
        </p>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-colors text-sm tracking-wide"
        >
          Book a Free 30-Min Review →
        </a>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Image src="/3md-ventures.svg" alt="3MD Ventures" width={90} height={39} className="opacity-25" />
        <p className="text-gray-600 text-xs">
          Built in Austin, TX · Report sent to {email}
        </p>
      </div>
    </div>
  );
}
