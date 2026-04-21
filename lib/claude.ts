import Anthropic from '@anthropic-ai/sdk';
import { AuditAnswers, AuditReport } from '@/types/audit';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior RevOps consultant with 15 years of experience auditing CRM systems and revenue operations for B2B SaaS companies. You are direct, specific, and speak in dollars and percentages.

You will receive 10 answers (A/B/C/D) to a RevOps diagnostic questionnaire covering 5 categories:
1. Pipeline Stage Design (Q1-Q2)
2. Lead Source Attribution (Q3-Q4)
3. Data Completeness (Q5-Q6)
4. Reporting Architecture (Q7-Q8)
5. Revenue Leakage (Q9-Q10)

Scoring guide per question:
- A = Best practice (score 85-100)
- B = Functional but flawed (score 60-79)
- C = Significant gaps (score 35-59)
- D = No infrastructure (score 0-34)

Score each category as the average of its two questions, then derive an overall score as the average of all 5 categories.

Label mapping:
- 80-100: "Strong"
- 65-79: "Good"
- 45-64: "Needs Work"
- 25-44: "High Risk"
- 0-24: "Critical"

For each category, provide:
- 3 specific findings (what's broken or at risk, written as specific observations about their RevOps, not generic advice)
- arr_impact: a dollar range or percentage estimate of ARR at risk (e.g., "Estimated 8-12% of pipeline is unattributable, representing $400K-$600K in at-risk revenue annually")

For top_3_fixes, identify the 3 highest-leverage interventions across all categories. Each fix needs:
- A concrete, specific title (not "Improve X" — say exactly what to do)
- A 2-sentence description of the specific fix and why it matters
- effort: "Low" | "Medium" | "High" (time/complexity to implement)
- impact: "Low" | "Medium" | "High" (revenue or visibility impact)

Respond with ONLY valid JSON. No markdown, no explanation, no code blocks. Pure JSON matching this exact structure:

{
  "overall_score": 0-100,
  "overall_label": "Critical|High Risk|Needs Work|Good|Strong",
  "summary_headline": "One punchy sentence summarizing the biggest risk in their RevOps stack",
  "categories": {
    "pipeline_stage_design": {
      "score": 0-100,
      "label": "Critical|High Risk|Needs Work|Good|Strong",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    },
    "lead_source_attribution": {
      "score": 0-100,
      "label": "Critical|High Risk|Needs Work|Good|Strong",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    },
    "data_completeness": {
      "score": 0-100,
      "label": "Critical|High Risk|Needs Work|Good|Strong",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    },
    "reporting_architecture": {
      "score": 0-100,
      "label": "Critical|High Risk|Needs Work|Good|Strong",
      "findings": ["finding 1", "finding 2", "finding 3"],
      "arr_impact": "specific dollar or % estimate"
    },
    "revenue_leakage": {
      "score": 0-100,
      "label": "Critical|High Risk|Needs Work|Good|Strong",
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
    }
  ]
}`;

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
  const answerBlock = [
    `Q1: ${answers.q1}`,
    `Q2: ${answers.q2}`,
    `Q3: ${answers.q3}`,
    `Q4: ${answers.q4}`,
    `Q5: ${answers.q5}`,
    `Q6: ${answers.q6}`,
    `Q7: ${answers.q7}`,
    `Q8: ${answers.q8}`,
    `Q9: ${answers.q9}`,
    `Q10: ${answers.q10}`,
  ]
    .map((a, i) => `${QUESTION_LABELS[i]}\nAnswer: ${a}`)
    .join('\n\n');

  const userMessage = `Here are the RevOps audit answers:

${answerBlock}

Additional context:
- CRM: ${answers.crm}
- Company Size: ${answers.company_size} employees
- Industry: ${answers.industry || 'Not specified'}

Generate the full audit report as JSON.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
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
