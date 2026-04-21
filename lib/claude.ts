import Anthropic from '@anthropic-ai/sdk';
import { AuditAnswers, AuditReport, RiskLabel } from '@/types/audit';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Explicit scores per question per answer — calibrated to real business impact
const QUESTION_SCORES: Record<string, Record<string, number>> = {
  q1:  { A: 90, B: 65, C: 35, D: 10 },
  q2:  { A: 95, B: 55, C: 25, D:  5 },
  q3:  { A: 95, B: 50, C: 20, D:  0 },
  q4:  { A: 90, B: 55, C: 20, D:  5 },
  q5:  { A: 90, B: 65, C: 30, D:  5 },
  q6:  { A: 95, B: 60, C: 30, D: 10 },
  q7:  { A: 90, B: 55, C: 20, D:  0 },
  q8:  { A: 90, B: 55, C: 20, D:  5 },
  q9:  { A: 90, B: 60, C: 30, D:  5 },
  q10: { A: 90, B: 55, C: 20, D: 75 }, // D = "Not applicable" — neutral, not penalised
};

function scoreOf(answers: AuditAnswers, q: keyof typeof QUESTION_SCORES): number {
  return QUESTION_SCORES[q][answers[q as keyof AuditAnswers] as string] ?? 50;
}

function getRiskLabel(score: number): RiskLabel {
  if (score >= 80) return 'Strong';
  if (score >= 65) return 'Good';
  if (score >= 45) return 'Needs Work';
  if (score >= 25) return 'High Risk';
  return 'Critical';
}

interface ComputedScores {
  overall: number;
  pipeline_stage_design: number;
  lead_source_attribution: number;
  data_completeness: number;
  reporting_architecture: number;
  revenue_leakage: number;
}

function computeScores(answers: AuditAnswers): ComputedScores {
  const pipeline_stage_design   = Math.round((scoreOf(answers, 'q1') + scoreOf(answers, 'q2')) / 2);
  const lead_source_attribution = Math.round((scoreOf(answers, 'q3') + scoreOf(answers, 'q4')) / 2);
  const data_completeness       = Math.round((scoreOf(answers, 'q5') + scoreOf(answers, 'q6')) / 2);
  const reporting_architecture  = Math.round((scoreOf(answers, 'q7') + scoreOf(answers, 'q8')) / 2);
  const revenue_leakage         = Math.round((scoreOf(answers, 'q9') + scoreOf(answers, 'q10')) / 2);
  const overall = Math.round(
    (pipeline_stage_design + lead_source_attribution + data_completeness + reporting_architecture + revenue_leakage) / 5
  );
  return { overall, pipeline_stage_design, lead_source_attribution, data_completeness, reporting_architecture, revenue_leakage };
}

const QUESTION_LABELS = [
  'Q1 (Pipeline Stage Design): Stage naming and count',
  'Q2 (Pipeline Stage Design): Loss reason tracking',
  'Q3 (Lead Source Attribution): How sources are captured',
  'Q4 (Lead Source Attribution): Source-to-revenue reporting',
  'Q5 (Data Completeness): Stale close date frequency',
  'Q6 (Data Completeness): CRM field validation rules',
  'Q7 (Reporting Architecture): Weekly pipeline review method',
  'Q8 (Reporting Architecture): QoQ pipeline comparison speed',
  'Q9 (Revenue Leakage): Renewal/expansion tracking',
  'Q10 (Revenue Leakage): Discount and churn tracking',
];

export async function generateAudit(answers: AuditAnswers): Promise<AuditReport> {
  const scores = computeScores(answers);

  const answerBlock = (['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'] as const)
    .map((q, i) => `${QUESTION_LABELS[i]}\nAnswer: ${answers[q]}`)
    .join('\n\n');

  const arrContext = answers.arr
    ? `Their current ARR is ${answers.arr}. Use this to calculate specific dollar estimates for every arr_impact field — e.g. "At $3M ARR, losing 10% of pipeline to bad attribution = ~$300K annually." Make the numbers real and tied to their ARR.`
    : `No ARR provided. Use their company size (${answers.company_size} employees) as a proxy to produce plausible dollar ranges — clearly framed as estimates.`;

  const systemPrompt = `You are a senior RevOps consultant with 15 years of experience auditing CRM systems for B2B SaaS companies. You are direct, specific, and speak in dollars and percentages.

The scores for this audit have already been calculated by the scoring engine — do NOT recalculate or change them. Your job is to write the narrative: findings, ARR impact, and top 3 fixes based on the answers and the provided scores.

${arrContext}

For each category, provide:
- 3 specific findings: what's broken or at risk, written as specific observations about THEIR RevOps — not generic advice
- arr_impact: a dollar range or percentage tied to the specific gap. Be concrete. Use their ARR if provided.

For top_3_fixes, pick the 3 highest-leverage interventions. Each fix needs:
- A concrete title (not "Improve X" — say exactly what to do, e.g. "Enforce Loss Reason as a Required CRM Field")
- A 2-sentence description: what exactly to do and why it matters for revenue
- effort: "Low" | "Medium" | "High"
- impact: "Low" | "Medium" | "High"

Respond with ONLY valid JSON. No markdown, no explanation, no code blocks. Use this exact structure:

{
  "overall_score": ${scores.overall},
  "overall_label": "${getRiskLabel(scores.overall)}",
  "summary_headline": "One punchy sentence summarizing the single biggest risk in their RevOps stack",
  "categories": {
    "pipeline_stage_design": {
      "score": ${scores.pipeline_stage_design},
      "label": "${getRiskLabel(scores.pipeline_stage_design)}",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    },
    "lead_source_attribution": {
      "score": ${scores.lead_source_attribution},
      "label": "${getRiskLabel(scores.lead_source_attribution)}",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    },
    "data_completeness": {
      "score": ${scores.data_completeness},
      "label": "${getRiskLabel(scores.data_completeness)}",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    },
    "reporting_architecture": {
      "score": ${scores.reporting_architecture},
      "label": "${getRiskLabel(scores.reporting_architecture)}",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    },
    "revenue_leakage": {
      "score": ${scores.revenue_leakage},
      "label": "${getRiskLabel(scores.revenue_leakage)}",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    }
  },
  "top_3_fixes": [
    {
      "rank": 1,
      "title": "Specific action title",
      "description": "Two sentences: what exactly to do and why it matters for revenue.",
      "effort": "Low|Medium|High",
      "impact": "Low|Medium|High"
    },
    {
      "rank": 2,
      "title": "Specific action title",
      "description": "Two sentences.",
      "effort": "Low|Medium|High",
      "impact": "Low|Medium|High"
    },
    {
      "rank": 3,
      "title": "Specific action title",
      "description": "Two sentences.",
      "effort": "Low|Medium|High",
      "impact": "Low|Medium|High"
    }
  ]
}`;

  const userMessage = `Here are the RevOps audit answers:

${answerBlock}

Additional context:
- CRM: ${answers.crm}
- Company Size: ${answers.company_size} employees
- Industry: ${answers.industry || 'Not specified'}
- ARR: ${answers.arr || 'Not provided'}

Generate the full audit report as JSON using the exact scores and labels already embedded in the system prompt structure.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const raw = textBlock.text.trim();
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No JSON found in Claude response');
  }

  return JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as AuditReport;
}
