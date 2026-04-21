export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export interface AuditAnswers {
  q1: AnswerOption;
  q2: AnswerOption;
  q3: AnswerOption;
  q4: AnswerOption;
  q5: AnswerOption;
  q6: AnswerOption;
  q7: AnswerOption;
  q8: AnswerOption;
  q9: AnswerOption;
  q10: AnswerOption;
  crm: string;
  company_size: string;
  industry: string;
  arr?: string;
}

export type RiskLabel = 'Critical' | 'High Risk' | 'Needs Work' | 'Good' | 'Strong';
export type CategoryLabel = RiskLabel;
export type EffortImpact = 'Low' | 'Medium' | 'High';

export interface CategoryResult {
  score: number;
  label: CategoryLabel;
  findings: string[];
  arr_impact: string;
}

export interface Fix {
  rank: number;
  title: string;
  description: string;
  effort: EffortImpact;
  impact: EffortImpact;
}

export interface AuditReport {
  overall_score: number;
  overall_label: RiskLabel;
  summary_headline: string;
  overall_arr_impact: string;
  overall_arr_impact_amount: string;
  categories: {
    pipeline_stage_design: CategoryResult;
    lead_source_attribution: CategoryResult;
    data_completeness: CategoryResult;
    reporting_architecture: CategoryResult;
    revenue_leakage: CategoryResult;
  };
  top_3_fixes: Fix[];
}

export const CATEGORY_META: Record<keyof AuditReport['categories'], { display: string; description: string }> = {
  pipeline_stage_design: {
    display: 'Pipeline Stage Design',
    description: 'How well your sales stages reflect buyer behavior and capture loss intelligence.',
  },
  lead_source_attribution: {
    display: 'Lead Source Attribution',
    description: 'Your ability to trace revenue back to the marketing sources that generated it.',
  },
  data_completeness: {
    display: 'Data Completeness',
    description: 'The accuracy and freshness of key CRM fields across your open pipeline.',
  },
  reporting_architecture: {
    display: 'Reporting Architecture',
    description: 'How quickly and reliably your team can answer pipeline and forecast questions.',
  },
  revenue_leakage: {
    display: 'Revenue Leakage',
    description: 'Your visibility into renewal, expansion, churn, and discount exposure.',
  },
};

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getScoreBorder(score: number): string {
  if (score >= 80) return 'border-emerald-500';
  if (score >= 60) return 'border-yellow-500';
  if (score >= 40) return 'border-orange-500';
  return 'border-red-500';
}

export function getLabelColor(label: RiskLabel): string {
  switch (label) {
    case 'Strong': return 'bg-emerald-900 text-emerald-300 border border-emerald-700';
    case 'Good': return 'bg-yellow-900 text-yellow-300 border border-yellow-700';
    case 'Needs Work': return 'bg-orange-900 text-orange-300 border border-orange-700';
    case 'High Risk': return 'bg-red-900 text-red-300 border border-red-700';
    case 'Critical': return 'bg-red-950 text-red-400 border border-red-800';
  }
}
