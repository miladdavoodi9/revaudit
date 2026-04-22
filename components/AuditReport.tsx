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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
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
    Low:    type === 'effort' ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-800 text-gray-400',
    Medium: 'bg-yellow-900 text-yellow-300',
    High:   type === 'effort' ? 'bg-red-900 text-red-300' : 'bg-brand-900 text-brand-300',
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

function LockedBody({ calendlyUrl }: { calendlyUrl: string }) {
  return (
    <div className="px-6 py-8 flex flex-col items-center gap-3 text-center border-t border-gray-800">
      <div className="w-9 h-9 bg-brand-900 rounded-xl flex items-center justify-center">
        <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="text-gray-400 text-sm">Full findings unlocked on your call</p>
      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold rounded-xl transition-colors"
      >
        Book a Free 30-Min Review →
      </a>
    </div>
  );
}

export default function AuditReport({ report, email }: AuditReportProps) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '#';
  const categories = Object.entries(report.categories) as [
    keyof typeof report.categories,
    (typeof report.categories)[keyof typeof report.categories]
  ][];

  // First two categories are fully visible; the rest are blurred
  const UNLOCKED = 2;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="text-center pt-6">
        <h1 className="text-3xl font-bold text-white mb-1">Your RevOps Audit Report</h1>
      </div>

      {/* Overall Score */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
        <ScoreRing score={report.overall_score} size={128} />
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">Overall Score</p>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-4xl font-bold ${getScoreColor(report.overall_score)}`}>
              {report.overall_score}
            </span>
            <LabelBadge label={report.overall_label} />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">{report.summary_headline}</p>
        </div>
      </div>

      {/* ARR Impact — standalone callout */}
      <div className="rounded-2xl p-px bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-400">
        <div className="bg-gray-950 rounded-2xl px-8 py-7 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Estimated ARR at Risk</p>
          <p className="text-5xl sm:text-6xl font-extrabold text-orange-300 leading-none mb-3">
            {report.overall_arr_impact_amount ?? '—'}
          </p>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">{report.overall_arr_impact}</p>
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
                <p className="text-sm font-medium text-gray-300 leading-tight">{CATEGORY_META[key].display}</p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${getScoreBg(cat.score)}`} style={{ width: `${cat.score}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <LabelBadge label={cat.label} />
                <span className={`text-sm font-bold w-8 text-right ${getScoreColor(cat.score)}`}>{cat.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Detail Cards */}
      {categories.map(([key, cat], index) => {
        const locked = index >= UNLOCKED;
        return (
          <div key={key}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {/* Header always visible */}
              <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-brand-400 uppercase mb-1">Category</p>
                  <h3 className="text-lg font-semibold text-white">{CATEGORY_META[key].display}</h3>
                  <p className="text-gray-500 text-xs mt-1">{CATEGORY_META[key].description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className={`text-3xl font-bold ${getScoreColor(cat.score)}`}>{cat.score}</div>
                  <LabelBadge label={cat.label} />
                </div>
              </div>

              {/* Body: locked or visible */}
              {locked ? (
                <LockedBody calendlyUrl={calendlyUrl} />
              ) : (
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
              )}
            </div>
          </div>
        );
      })}

      {/* Top 3 Fixes */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Top 3 Fixes</h2>
          <span className="text-xs text-gray-500">Full detail on your call</span>
        </div>
        <div className="divide-y divide-gray-800">
          {report.top_3_fixes.map((fix) => (
            <div key={fix.rank} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-7 h-7 bg-brand-900 rounded-lg flex items-center justify-center text-brand-300 font-bold text-xs">
                {fix.rank}
              </div>
              <p className="text-sm font-medium text-gray-300 flex-1">{fix.title}</p>
              <div className="flex gap-2 flex-shrink-0">
                <EffortBadge value={fix.effort} type="effort" />
                <EffortBadge value={fix.impact} type="impact" />
              </div>
            </div>
          ))}
        </div>
        <LockedBody calendlyUrl={calendlyUrl} />
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Image src="/3md-ventures.svg" alt="3MD Ventures" width={90} height={39} className="opacity-25" />
        <p className="text-gray-600 text-xs">Built in Austin, TX · Report sent to {email}</p>
      </div>
    </div>
  );
}
