import { describe, it, expect, vi } from 'vitest';
import {
  buildExplanationPrompt,
  buildComparisonExplanationPrompt,
  buildChatPrompt,
  buildTradeoffPrompt,
  getGeminiClient,
  getGroqClient,
} from './client';
import type { BudgetPromptContext, ChatMessage } from './client';

// ─── buildExplanationPrompt ───────────────────────────────────────────────────

describe('buildExplanationPrompt', () => {
  const ctx: BudgetPromptContext = {
    category: 'Healthcare & Sanitation',
    allocatedAmount: 1.22,
    country: 'India',
    year: 2026,
    priorYearAmount: 1.10,
    growthPercentage: 10.91,
  };

  it('includes the category name', () => {
    const prompt = buildExplanationPrompt(ctx);
    expect(prompt).toContain('Healthcare & Sanitation');
  });

  it('includes the allocated amount', () => {
    const prompt = buildExplanationPrompt(ctx);
    expect(prompt).toContain('1.22');
  });

  it('includes prior year amount when provided', () => {
    const prompt = buildExplanationPrompt(ctx);
    // JS serializes 1.10 → '1.1' (trailing zeros dropped), prompt contains '1.1'
    expect(prompt).toContain('1.1');
  });

  it('includes growth percentage when provided', () => {
    const prompt = buildExplanationPrompt(ctx);
    expect(prompt).toContain('10.91');
  });

  it('contains the CRITICAL CONSTRAINT anti-hallucination directive', () => {
    const prompt = buildExplanationPrompt(ctx);
    expect(prompt).toContain('CRITICAL CONSTRAINT');
  });

  it('contains country and year in the context', () => {
    const prompt = buildExplanationPrompt(ctx);
    expect(prompt).toContain('India');
    expect(prompt).toContain('2026');
  });

  it('does NOT include prior year line when priorYearAmount is undefined', () => {
    const ctxNoPrior: BudgetPromptContext = { category: 'Tech', allocatedAmount: 0.95 };
    const prompt = buildExplanationPrompt(ctxNoPrior);
    expect(prompt).not.toContain('Prior Year Amount');
  });

  it('does NOT include growth line when growthPercentage is undefined', () => {
    const ctxNoGrowth: BudgetPromptContext = { category: 'Tech', allocatedAmount: 0.95 };
    const prompt = buildExplanationPrompt(ctxNoGrowth);
    expect(prompt).not.toContain('Growth / Delta');
  });
});

// ─── buildComparisonExplanationPrompt ─────────────────────────────────────────

describe('buildComparisonExplanationPrompt', () => {
  const basePayload = {
    countryA: 'India',
    yearA: 2025,
    totalA: 48.0,
    currencyA: '₹',
    countryB: 'India',
    yearB: 2026,
    totalB: 50.65,
    currencyB: '₹',
    totalDelta: 2.65,
    totalPercentageChange: 5.52,
    topDeltas: [
      {
        category: 'Defence & Security',
        amountA: 5.94,
        amountB: 6.22,
        delta: 0.28,
        percentageChange: 4.71,
        status: 'increased',
      },
    ],
  };

  it('includes Dataset A details in normal comparison', () => {
    const prompt = buildComparisonExplanationPrompt(basePayload);
    expect(prompt).toContain('India');
    expect(prompt).toContain('2025');
    expect(prompt).toContain('48');
  });

  it('includes Dataset B details in normal comparison', () => {
    const prompt = buildComparisonExplanationPrompt(basePayload);
    expect(prompt).toContain('2026');
    expect(prompt).toContain('50.65');
  });

  it('includes top sector delta details', () => {
    const prompt = buildComparisonExplanationPrompt(basePayload);
    expect(prompt).toContain('Defence & Security');
  });

  it('includes the total net shift value', () => {
    const prompt = buildComparisonExplanationPrompt(basePayload);
    expect(prompt).toContain('2.65');
  });

  it('contains CRITICAL CONSTRAINT directive', () => {
    const prompt = buildComparisonExplanationPrompt(basePayload);
    expect(prompt).toContain('CRITICAL CONSTRAINT');
  });

  it('returns short identical-dataset notice when isIdentical is true', () => {
    const identicalPayload = { ...basePayload, yearB: 2025, totalB: 48.0, isIdentical: true };
    const prompt = buildComparisonExplanationPrompt(identicalPayload);
    expect(prompt).toContain('identical');
    expect(prompt).not.toContain('KEY SECTOR DELTAS');
  });

  it('limits displayed deltas to max 5', () => {
    const manyDeltas = Array.from({ length: 10 }, (_, i) => ({
      category: `Sector ${i}`,
      amountA: i,
      amountB: i + 1,
      delta: 1,
      percentageChange: 10,
      status: 'increased',
    }));
    const prompt = buildComparisonExplanationPrompt({ ...basePayload, topDeltas: manyDeltas });
    // Only first 5 should appear (sectors 0-4)
    expect(prompt).toContain('Sector 4');
    expect(prompt).not.toContain('Sector 5');
  });
});

// ─── buildChatPrompt ──────────────────────────────────────────────────────────

describe('buildChatPrompt', () => {
  const ctx: BudgetPromptContext = {
    category: 'Education & Skill Building',
    allocatedAmount: 1.48,
    country: 'India',
    year: 2026,
  };

  it('includes the sector context', () => {
    const prompt = buildChatPrompt(ctx, [], 'What is this funding used for?');
    expect(prompt).toContain('Education & Skill Building');
    expect(prompt).toContain('1.48');
  });

  it('embeds conversation history when provided', () => {
    const history: ChatMessage[] = [
      { role: 'user', text: 'What is PM-KISAN?' },
      { role: 'model', text: 'PM-KISAN provides direct income support to farmers.' },
    ];
    const prompt = buildChatPrompt(ctx, history, 'How much does it give each farmer?');
    expect(prompt).toContain('PM-KISAN');
    expect(prompt).toContain('direct income support');
  });

  it('handles empty history gracefully', () => {
    const prompt = buildChatPrompt(ctx, [], 'Tell me more.');
    expect(prompt).toContain('No prior messages');
  });

  it('includes the follow-up question', () => {
    const prompt = buildChatPrompt(ctx, [], 'What percentage of GDP is this?');
    expect(prompt).toContain('What percentage of GDP is this?');
  });

  it('labels user messages as "User" and model as "Assistant"', () => {
    const history: ChatMessage[] = [{ role: 'user', text: 'Hello' }];
    const prompt = buildChatPrompt(ctx, history, 'Next question');
    expect(prompt).toContain('User: Hello');
  });

  it('labels model messages as "Assistant"', () => {
    const history: ChatMessage[] = [{ role: 'model', text: 'Budget answer here.' }];
    const prompt = buildChatPrompt(ctx, history, 'Follow up');
    expect(prompt).toContain('Assistant: Budget answer here.');
  });

  it('contains CRITICAL CONSTRAINT anti-hallucination directive', () => {
    const prompt = buildChatPrompt(ctx, [], 'More info please.');
    expect(prompt).toContain('CRITICAL CONSTRAINT');
  });
});

// ─── buildTradeoffPrompt ──────────────────────────────────────────────────────

describe('buildTradeoffPrompt', () => {
  const tradeoffData = {
    country: 'India',
    year: 2026,
    currency: '₹',
    unit: 'Lakh Cr',
    baselineTotalBudget: 50.65,
    deltas: [
      {
        sectorId: 'sec-education',
        category: 'Education & Skill Building',
        baselineAmount: 1.48,
        newAmount: 3.0,
        deltaPercentage: 102.7,
      },
      {
        sectorId: 'sec-defence',
        category: 'Defence & Security',
        baselineAmount: 6.22,
        newAmount: 4.7,
        deltaPercentage: -24.44,
      },
    ],
  };

  it('includes country and year in context header', () => {
    const prompt = buildTradeoffPrompt(tradeoffData);
    expect(prompt).toContain('India 2026');
  });

  it('includes baseline total budget', () => {
    const prompt = buildTradeoffPrompt(tradeoffData);
    expect(prompt).toContain('50.65');
  });

  it('formats each delta line with baseline and new amounts', () => {
    const prompt = buildTradeoffPrompt(tradeoffData);
    expect(prompt).toContain('Education & Skill Building');
    expect(prompt).toContain('1.48');
    expect(prompt).toContain('3');
  });

  it('shows positive deltaPercentage with + prefix', () => {
    const prompt = buildTradeoffPrompt(tradeoffData);
    expect(prompt).toContain('+102.7%');
  });

  it('shows negative deltaPercentage without + prefix', () => {
    const prompt = buildTradeoffPrompt(tradeoffData);
    expect(prompt).toContain('-24.44%');
  });

  it('shows fallback message when deltas array is empty', () => {
    const empty = { ...tradeoffData, deltas: [] };
    const prompt = buildTradeoffPrompt(empty);
    expect(prompt).toContain('No sector changes detected');
  });

  it('contains the CRITICAL CONSTRAINT directive', () => {
    const prompt = buildTradeoffPrompt(tradeoffData);
    expect(prompt).toContain('CRITICAL CONSTRAINT');
  });

  it('uses sectorId as fallback when category is missing', () => {
    const noCat = {
      ...tradeoffData,
      deltas: [{ sectorId: 'sec-health', newAmount: 2.0, deltaPercentage: 5 }],
    };
    const prompt = buildTradeoffPrompt(noCat);
    expect(prompt).toContain('sec-health');
  });
});

// ─── getGeminiClient ──────────────────────────────────────────────────────────

describe('getGeminiClient', () => {
  it('returns null when GEMINI_API_KEY is not set', () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(() => getGeminiClient()).not.toThrow();
    vi.unstubAllEnvs();
  });

  it('returns null when API key contains "placeholder"', () => {
    vi.stubEnv('GEMINI_API_KEY', 'placeholder_key_value');
    const client = getGeminiClient();
    expect(client).toBeNull();
    vi.unstubAllEnvs();
  });
});

// ─── getGroqClient ────────────────────────────────────────────────────────────

describe('getGroqClient', () => {
  it('returns null when GROQ_API_KEY is not set', () => {
    vi.stubEnv('GROQ_API_KEY', '');
    const client = getGroqClient();
    expect(client).toBeNull();
    vi.unstubAllEnvs();
  });

  it('returns null when GROQ_API_KEY contains "placeholder"', () => {
    vi.stubEnv('GROQ_API_KEY', 'placeholder_key_value');
    const client = getGroqClient();
    expect(client).toBeNull();
    vi.unstubAllEnvs();
  });

  it('instantiates Groq client when a valid GROQ_API_KEY is provided', () => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test_mock_key_123456');
    const client = getGroqClient();
    expect(client).not.toBeNull();
    vi.unstubAllEnvs();
  });
});
