'use client';

import { useState } from 'react';
import { AuditAnswers, AnswerOption } from '@/types/audit';

interface Question {
  id: keyof Pick<AuditAnswers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10'>;
  category: string;
  text: string;
  options: { value: AnswerOption; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'Pipeline Stage Design',
    text: 'How many stages does your sales pipeline have, and are they named after buyer actions or internal process steps?',
    options: [
      { value: 'A', label: '5 or fewer stages, buyer-action named' },
      { value: 'B', label: '6–9 stages, mix of buyer and internal naming' },
      { value: 'C', label: '10+ stages, or mostly internally named' },
      { value: 'D', label: 'No formal stage structure' },
    ],
  },
  {
    id: 'q2',
    category: 'Pipeline Stage Design',
    text: 'When a deal is lost, do reps log a specific loss reason in your CRM?',
    options: [
      { value: 'A', label: 'Yes — required field, specific categories' },
      { value: 'B', label: 'Yes — optional field, inconsistent compliance' },
      { value: 'C', label: 'No — won/lost tracked but not why' },
      { value: 'D', label: 'Not tracked at all' },
    ],
  },
  {
    id: 'q3',
    category: 'Lead Source Attribution',
    text: 'When a new lead enters your CRM, how is the originating source captured?',
    options: [
      { value: 'A', label: 'Automatically via UTM parameters tied to a required Lead Source field' },
      { value: 'B', label: 'Manually by the rep at time of creation' },
      { value: 'C', label: 'Inconsistently — sometimes captured, sometimes not' },
      { value: 'D', label: 'Not tracked in CRM' },
    ],
  },
  {
    id: 'q4',
    category: 'Lead Source Attribution',
    text: 'Can you pull a report today showing which lead sources generated the most closed-won revenue in the last 12 months?',
    options: [
      { value: 'A', label: 'Yes — saved report used regularly' },
      { value: 'B', label: 'Partially — buildable but time-consuming and unreliable' },
      { value: 'C', label: 'No — source doesn\'t follow the deal to close' },
      { value: 'D', label: 'No reporting capability on this' },
    ],
  },
  {
    id: 'q5',
    category: 'Data Completeness',
    text: 'How often do open opportunities sit past their original close date without being updated?',
    options: [
      { value: 'A', label: 'Rarely — reps update close dates weekly' },
      { value: 'B', label: 'Sometimes — caught in reviews but slips' },
      { value: 'C', label: 'Often — most pipeline has stale close dates' },
      { value: 'D', label: 'Always — close date updates not enforced' },
    ],
  },
  {
    id: 'q6',
    category: 'Data Completeness',
    text: 'Are key CRM fields (owner, close date, deal value, stage) enforced via validation rules?',
    options: [
      { value: 'A', label: 'Enforced — validation rules block saving without required fields' },
      { value: 'B', label: 'Partially — some required, others optional' },
      { value: 'C', label: 'Optional — reps can save with blank key fields' },
      { value: 'D', label: 'No validation rules configured' },
    ],
  },
  {
    id: 'q7',
    category: 'Reporting Architecture',
    text: 'How does your leadership team review pipeline and forecast each week?',
    options: [
      { value: 'A', label: 'Live CRM dashboard in the meeting' },
      { value: 'B', label: 'CRM report exported to spreadsheet before the meeting' },
      { value: 'C', label: 'Verbal rep updates, no structured data pull' },
      { value: 'D', label: 'No regular pipeline review cadence' },
    ],
  },
  {
    id: 'q8',
    category: 'Reporting Architecture',
    text: 'Can you compare this quarter\'s pipeline creation to last quarter\'s in under 5 minutes?',
    options: [
      { value: 'A', label: 'Yes — saved QoQ pipeline report' },
      { value: 'B', label: 'With effort — buildable but not maintained' },
      { value: 'C', label: 'No — would require reconstructing from exports' },
      { value: 'D', label: 'No historical reporting visibility' },
    ],
  },
  {
    id: 'q9',
    category: 'Revenue Leakage',
    text: 'How do you track renewal and expansion revenue in your CRM?',
    options: [
      { value: 'A', label: 'Separate pipeline with own stages and owner' },
      { value: 'B', label: 'Renewal deals in CRM but mixed with new business' },
      { value: 'C', label: 'Tracked in a spreadsheet outside the CRM' },
      { value: 'D', label: 'Not tracked systematically' },
    ],
  },
  {
    id: 'q10',
    category: 'Revenue Leakage',
    text: 'Are discounts logged at the deal level, and do you capture churn reasons when customers leave?',
    options: [
      { value: 'A', label: 'Yes to both' },
      { value: 'B', label: 'One but not the other' },
      { value: 'C', label: 'Neither — handled verbally or in email' },
      { value: 'D', label: 'Not applicable' },
    ],
  },
];

const CRM_OPTIONS = ['Salesforce', 'HubSpot', 'Pipedrive', 'Monday.com', 'Other'];
const SIZE_OPTIONS = ['1–10', '11–50', '51–200', '201–500', '500+'];

type PartialAnswers = Partial<Pick<AuditAnswers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10'>>;

interface AuditFormProps {
  onComplete: (answers: AuditAnswers) => void;
}

export default function AuditForm({ onComplete }: AuditFormProps) {
  const [step, setStep] = useState(0); // 0-9 = questions, 10 = metadata
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [meta, setMeta] = useState({ crm: '', company_size: '', industry: '' });
  const [selected, setSelected] = useState<AnswerOption | null>(null);

  const currentQuestion = QUESTIONS[step];
  const progress = step < 10 ? (step / 11) * 100 : (10 / 11) * 100;

  function handleSelect(value: AnswerOption) {
    setSelected(value);
    setTimeout(() => {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      setSelected(null);
      setStep((s) => s + 1);
    }, 300);
  }

  function handleMetaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!meta.crm || !meta.company_size) return;
    const complete = answers as Pick<AuditAnswers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10'>;
    onComplete({ ...complete, ...meta });
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Question {Math.min(step + 1, 10)} of 10</span>
          <span>{step < 10 ? QUESTIONS[step].category : 'About You'}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step < 10 ? (
        <div className="animate-fade-in">
          <div className="mb-2">
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">
              {currentQuestion.category}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>
          <div className="space-y-3">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-150 group ${
                  selected === opt.value
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-indigo-600 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold mt-0.5 ${
                      selected === opt.value
                        ? 'bg-white text-indigo-600'
                        : 'bg-gray-800 text-gray-400 group-hover:bg-indigo-900 group-hover:text-indigo-300'
                    }`}
                  >
                    {opt.value}
                  </span>
                  <span className="text-sm leading-relaxed">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleMetaSubmit} className="animate-fade-in">
          <div className="mb-2">
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">
              Almost done
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-6">
            Tell us a bit about your stack
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Your CRM <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CRM_OPTIONS.map((crm) => (
                  <button
                    key={crm}
                    type="button"
                    onClick={() => setMeta((m) => ({ ...m, crm }))}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      meta.crm === crm
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-indigo-600 hover:text-white'
                    }`}
                  >
                    {crm}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Company Size <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setMeta((m) => ({ ...m, company_size: size }))}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      meta.company_size === size
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-indigo-600 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Industry <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                value={meta.industry}
                onChange={(e) => setMeta((m) => ({ ...m, industry: e.target.value }))}
                placeholder="e.g. SaaS, FinTech, Healthcare"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!meta.crm || !meta.company_size}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm tracking-wide"
            >
              Generate My Audit →
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
