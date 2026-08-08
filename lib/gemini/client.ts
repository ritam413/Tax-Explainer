import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey && !apiKey.includes('placeholder')
  ? new GoogleGenAI({ apiKey })
  : null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!ai) {
    const currentKey = process.env.GEMINI_API_KEY || '';
    if (currentKey && !currentKey.includes('placeholder')) {
      return new GoogleGenAI({ apiKey: currentKey });
    }
    return null;
  }
  return ai;
}

export function getGroqClient(): Groq | null {
  const currentKey = process.env.GROQ_API_KEY || '';
  if (currentKey && !currentKey.includes('placeholder')) {
    return new Groq({ apiKey: currentKey, dangerouslyAllowBrowser: true });
  }
  return null;
}

export interface BudgetPromptContext {
  category: string;
  allocatedAmount: number;
  priorYearAmount?: number;
  growthPercentage?: number;
  country?: string;
  year?: number;
  currency?: string;
  unit?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function buildExplanationPrompt(context: BudgetPromptContext): string {
  const country = context.country || 'India';
  const year = context.year || 2026;
  const countryLower = country.toLowerCase();
  
  const currency = context.currency || (
    countryLower.includes('united') || countryLower.includes('us') ? '$' :
    countryLower.includes('japan') ? '¥' :
    countryLower.includes('russia') ? '₽' : '₹'
  );
  
  const unit = context.unit || (
    countryLower.includes('united') || countryLower.includes('us') ? 'Billion' :
    countryLower.includes('japan') || countryLower.includes('russia') ? 'Trillion' : 'Lakh Cr'
  );

  return `[SYSTEM INSTRUCTION: STRICT GROUNDING REQUIREMENT]
You are a public finance expert explaining government budget allocations to everyday citizens in clear, plain language.
CRITICAL CONSTRAINT: You MUST ground your explanation strictly in the numeric data provided below. Do NOT invent, hallucinate, or assume any unverified figures, statistics, or metrics.

BUDGET DATA CONTEXT:
- Country / Fiscal Year: ${country} (${year})
- Sector / Category: ${context.category}
- Allocated Amount: ${currency}${context.allocatedAmount} ${unit}
${context.priorYearAmount !== undefined ? `- Prior Year Amount: ${currency}${context.priorYearAmount} ${unit}` : ''}
${context.growthPercentage !== undefined ? `- Growth / Delta: ${context.growthPercentage}%` : ''}

EXPLANATION FORMAT RULES:
1. Provide a concise 2-3 sentence explanation.
2. Explain what real-world public services, infrastructure, or initiatives this sector typically funds.
3. Highlight the context of the growth/change if prior year data is present.
4. Keep tone objective, encouraging, and clear without jargon.`;
}

export function buildComparisonExplanationPrompt(comparisonData: {
  countryA: string;
  yearA: number;
  totalA: number;
  currencyA: string;
  countryB: string;
  yearB: number;
  totalB: number;
  currencyB: string;
  totalDelta: number;
  totalPercentageChange: number;
  topDeltas: Array<{ category: string; amountA: number; amountB: number; delta: number; percentageChange: number; status: string }>;
  isIdentical?: boolean;
}): string {
  if (comparisonData.isIdentical) {
    return `[SYSTEM INSTRUCTION: STRICT GROUNDING REQUIREMENT]
You are a public finance AI analyst. Explain that the user selected identical datasets (${comparisonData.countryA} ${comparisonData.yearA}).
Explain in 2 concise sentences that all spending allocations and sector deltas are 0% because the baseline and target datasets are identical.`;
  }

  const topChangesFormatted = comparisonData.topDeltas
    .slice(0, 5)
    .map(
      (d) =>
        `- ${d.category}: Base ${comparisonData.currencyA}${d.amountA} → Target ${comparisonData.currencyB}${d.amountB} (Delta: ${d.delta > 0 ? '+' : ''}${d.delta}, Change: ${d.percentageChange}%, Status: ${d.status})`
    )
    .join('\n');

  return `[SYSTEM INSTRUCTION: STRICT GROUNDING REQUIREMENT]
You are an expert public finance analyst explaining a budget comparison diff to everyday citizens.
CRITICAL CONSTRAINT: Ground your explanation strictly in the provided numeric delta figures. Do NOT hallucinate figures or invent unverified statistics.

BUDGET COMPARISON CONTEXT:
- Dataset A (Baseline): ${comparisonData.countryA} ${comparisonData.yearA} (Total: ${comparisonData.currencyA}${comparisonData.totalA})
- Dataset B (Target): ${comparisonData.countryB} ${comparisonData.yearB} (Total: ${comparisonData.currencyB}${comparisonData.totalB})
- Total Net Shift: ${comparisonData.totalDelta > 0 ? '+' : ''}${comparisonData.totalDelta} (${comparisonData.totalPercentageChange}%)

KEY SECTOR DELTAS:
${topChangesFormatted}

EXPLANATION FORMAT RULES:
1. Provide a clear 3-4 sentence summary of what shifted between these two budget datasets and why it matters.
2. Highlight the largest spending increases or cuts from the provided list above.
3. Mention any new or discontinued categories if present in the data.
4. Keep the tone objective, analytical, and accessible without academic jargon.`;
}

export function buildChatPrompt(
  context: BudgetPromptContext,
  history: ChatMessage[],
  followUpMessage: string
): string {
  const country = context.country || 'India';
  const year = context.year || 2026;
  const countryLower = country.toLowerCase();
  
  const currency = context.currency || (
    countryLower.includes('united') || countryLower.includes('us') ? '$' :
    countryLower.includes('japan') ? '¥' :
    countryLower.includes('russia') ? '₽' : '₹'
  );
  
  const unit = context.unit || (
    countryLower.includes('united') || countryLower.includes('us') ? 'Billion' :
    countryLower.includes('japan') || countryLower.includes('russia') ? 'Trillion' : 'Lakh Cr'
  );

  const formattedHistory = history
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
    .join('\n');

  return `[SYSTEM INSTRUCTION: STRICT GROUNDING REQUIREMENT]
You are an AI Budget Assistant answering a citizen's follow-up question regarding a specific government budget allocation.
CRITICAL CONSTRAINT: Stay strictly focused on the context of this specific budget item. Use only provided facts and numeric figures. Do NOT speculate or provide advice on unrelated political/financial topics.

BUDGET CONTEXT:
- Sector: ${context.category} (${country} ${year})
- Allocated Amount: ${currency}${context.allocatedAmount} ${unit}
${context.priorYearAmount !== undefined ? `- Prior Year: ${currency}${context.priorYearAmount} ${unit}` : ''}
${context.growthPercentage !== undefined ? `- Growth: ${context.growthPercentage}%` : ''}

CONVERSATION HISTORY:
${formattedHistory ? formattedHistory : '(No prior messages)'}

USER FOLLOW-UP QUESTION:
${followUpMessage}

Answer concisely in 2-3 sentences.`;
}

export function buildTradeoffPrompt(data: {
  country: string;
  year: number;
  currency: string;
  unit: string;
  baselineTotalBudget: number;
  deltas: Array<{
    sectorId: string;
    category?: string;
    baselineAmount?: number;
    newAmount: number;
    deltaPercentage: number;
  }>;
}): string {
  if (!data.deltas || data.deltas.length === 0) {
    return `[SYSTEM INSTRUCTION: STRICT GROUNDING REQUIREMENT]
You are a public finance AI advisor evaluating a citizen's hypothetical budget reallocation simulation.
CRITICAL CONSTRAINT: Ground your analysis strictly in the structured budget deltas listed below. Do NOT hallucinate figures or assume unverified statistics.

HYPOTHETICAL BUDGET REALLOCATION CONTEXT:
- Country & Fiscal Year: ${data.country} ${data.year}
- Total Budget Baseline: ${data.currency}${data.baselineTotalBudget} ${data.unit} (Zero-Sum Balance Maintained)
- No sector changes detected

EXPLANATION FORMAT RULES:
1. Provide a clear 3-4 sentence trade-off analysis explaining the policy consequences of these sector budget shifts.
2. Explain which public services benefit from the extra funding and which face cuts.
3. Assess the socio-economic impacts of this budget shift in plain, clear citizen-friendly language.
4. Conclude with a neutral statement on overall fiscal policy balance.`;
  }

  const formatDeltaLine = (d: any) => {
    const name = d.category || d.sectorId;
    const base = d.baselineAmount !== undefined ? `${data.currency}${d.baselineAmount} ${data.unit}` : 'baseline';
    const net = `${data.currency}${d.newAmount} ${data.unit}`;
    const change = `${d.deltaPercentage > 0 ? '+' : ''}${d.deltaPercentage}%`;
    return `- ${name}: ${base} → ${net} (${change})`;
  };

  const increases = data.deltas.filter((d) => d.deltaPercentage > 0);
  const cuts = data.deltas.filter((d) => d.deltaPercentage < 0);

  const increaseLines = increases.length > 0 ? increases.map(formatDeltaLine).join('\n') : '- No sector increases';
  const cutLines = cuts.length > 0 ? cuts.map(formatDeltaLine).join('\n') : '- No sector cuts';

  return `[SYSTEM INSTRUCTION: STRICT GROUNDING REQUIREMENT]
You are a public finance AI advisor evaluating a citizen's hypothetical budget reallocation simulation.
CRITICAL CONSTRAINT: Ground your analysis strictly in the structured budget deltas listed below. Do NOT hallucinate figures or assume unverified statistics.

HYPOTHETICAL BUDGET REALLOCATION CONTEXT:
- Country & Fiscal Year: ${data.country} ${data.year}
- Total Budget Baseline: ${data.currency}${data.baselineTotalBudget} ${data.unit} (Zero-Sum Balance Maintained)

FUNDING INCREASES (+):
${increaseLines}

FUNDING CUTS (-):
${cutLines}

EXPLANATION FORMAT RULES:
1. Provide a clear 3-4 sentence trade-off analysis explaining the policy consequences of these sector budget shifts.
2. Explain which public services benefit from the extra funding and which face cuts.
3. Assess the socio-economic impacts of this budget shift in plain, clear citizen-friendly language.
4. Conclude with a neutral statement on overall fiscal policy balance.`;
}

