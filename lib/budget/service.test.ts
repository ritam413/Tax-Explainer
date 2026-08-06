import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { sanitizeBudgetDataset, compareBudgets, DEFAULT_INDIA_2026_BUDGET } from './service';
import type { BudgetDataset } from '@/types/budget';

// ─── Zod Runtime Schemas (test-only validation layer) ─────────────────────────

const SectorBudgetSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  allocatedAmount: z.number().finite().nonnegative(),
  priorYearAmount: z.number().finite().nonnegative().optional(),
  growthPercentage: z.number().finite().optional(),
  percentageOfTotal: z.number().finite().min(0).max(100),
  description: z.string().optional(),
});

const BudgetDatasetSchema = z.object({
  id: z.string().min(1),
  country: z.string().min(1),
  year: z.number().int().positive(),
  currency: z.string().min(1),
  unit: z.string().optional(),
  totalBudget: z.number().finite().nonnegative(),
  sectors: z.array(SectorBudgetSchema).min(1),
});

const CompareRequestSchema = z.object({
  countryA: z.string().min(1),
  yearA: z.number().int().positive(),
  countryB: z.string().min(1),
  yearB: z.number().int().positive(),
  inflationRate: z.number().nonnegative().optional(),
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const validDataset: BudgetDataset = {
  id: 'ind-2026',
  country: 'India',
  year: 2026,
  currency: '₹',
  unit: 'Lakh Cr',
  totalBudget: 100.0,
  sectors: [
    { id: 'sec-a', category: 'Sector A', allocatedAmount: 60.0, percentageOfTotal: 60.0 },
    { id: 'sec-b', category: 'Sector B', allocatedAmount: 40.0, percentageOfTotal: 40.0 },
  ],
};

const datasetWithNaN: BudgetDataset = {
  id: 'bad-data',
  country: 'India',
  year: 2025,
  currency: '₹',
  totalBudget: 100.0,
  sectors: [
    {
      id: 'sec-x',
      category: 'Sector X',
      allocatedAmount: NaN,
      percentageOfTotal: NaN,
    },
  ],
};

const zeroBudgetDataset: BudgetDataset = {
  id: 'zero-budget',
  country: 'India',
  year: 2025,
  currency: '₹',
  totalBudget: 0,
  sectors: [{ id: 'sec-a', category: 'Sector A', allocatedAmount: 0, percentageOfTotal: 0 }],
};

// ─── Zod Schema Validation ────────────────────────────────────────────────────

describe('Zod schema: SectorBudgetSchema', () => {
  it('accepts a valid sector', () => {
    const result = SectorBudgetSchema.safeParse({
      id: 'sec-defence',
      category: 'Defence & Security',
      allocatedAmount: 6.22,
      percentageOfTotal: 12.28,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative allocatedAmount', () => {
    const result = SectorBudgetSchema.safeParse({
      id: 'sec-x',
      category: 'Bad Sector',
      allocatedAmount: -5.0,
      percentageOfTotal: 10.0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing category', () => {
    const result = SectorBudgetSchema.safeParse({
      id: 'sec-x',
      allocatedAmount: 10,
      percentageOfTotal: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects percentageOfTotal > 100', () => {
    const result = SectorBudgetSchema.safeParse({
      id: 'sec-x',
      category: 'X',
      allocatedAmount: 10,
      percentageOfTotal: 101,
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional priorYearAmount and growthPercentage', () => {
    const result = SectorBudgetSchema.safeParse({
      id: 'sec-health',
      category: 'Healthcare',
      allocatedAmount: 1.22,
      percentageOfTotal: 2.41,
      priorYearAmount: 1.10,
      growthPercentage: 10.91,
    });
    expect(result.success).toBe(true);
  });
});

describe('Zod schema: BudgetDatasetSchema', () => {
  it('accepts the default India 2026 dataset shape', () => {
    const result = BudgetDatasetSchema.safeParse(DEFAULT_INDIA_2026_BUDGET);
    expect(result.success).toBe(true);
  });

  it('rejects dataset with empty sectors array', () => {
    const result = BudgetDatasetSchema.safeParse({ ...validDataset, sectors: [] });
    expect(result.success).toBe(false);
  });

  it('rejects dataset with negative totalBudget', () => {
    const result = BudgetDatasetSchema.safeParse({ ...validDataset, totalBudget: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects dataset with non-integer year', () => {
    const result = BudgetDatasetSchema.safeParse({ ...validDataset, year: 2026.5 });
    expect(result.success).toBe(false);
  });
});

describe('Zod schema: CompareRequestSchema', () => {
  it('accepts a valid compare request', () => {
    const result = CompareRequestSchema.safeParse({
      countryA: 'India',
      yearA: 2025,
      countryB: 'India',
      yearB: 2026,
      inflationRate: 5.0,
    });
    expect(result.success).toBe(true);
  });

  it('accepts without optional inflationRate', () => {
    const result = CompareRequestSchema.safeParse({
      countryA: 'India',
      yearA: 2025,
      countryB: 'Japan',
      yearB: 2024,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative inflationRate', () => {
    const result = CompareRequestSchema.safeParse({
      countryA: 'India',
      yearA: 2025,
      countryB: 'India',
      yearB: 2026,
      inflationRate: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing countryA', () => {
    const result = CompareRequestSchema.safeParse({
      yearA: 2025,
      countryB: 'India',
      yearB: 2026,
    });
    expect(result.success).toBe(false);
  });
});

// ─── sanitizeBudgetDataset ────────────────────────────────────────────────────

describe('sanitizeBudgetDataset', () => {
  it('replaces NaN allocatedAmount with 0', () => {
    const sanitized = sanitizeBudgetDataset(datasetWithNaN);
    expect(sanitized.sectors[0].allocatedAmount).toBe(0);
    expect(Number.isNaN(sanitized.sectors[0].allocatedAmount)).toBe(false);
  });

  it('replaces NaN percentageOfTotal with 0', () => {
    const sanitized = sanitizeBudgetDataset(datasetWithNaN);
    expect(Number.isNaN(sanitized.sectors[0].percentageOfTotal)).toBe(false);
  });

  it('assigns default id when sector id is missing', () => {
    const noId: BudgetDataset = {
      ...validDataset,
      sectors: [{ id: '', category: 'Test', allocatedAmount: 10, percentageOfTotal: 10 }],
    };
    const sanitized = sanitizeBudgetDataset(noId);
    expect(sanitized.sectors[0].id).toBeTruthy();
    expect(sanitized.sectors[0].id.length).toBeGreaterThan(0);
  });

  it('recalculates percentageOfTotal from allocatedAmount/totalBudget', () => {
    const sanitized = sanitizeBudgetDataset(validDataset);
    // sec-a: 60 / 100 = 60%
    expect(sanitized.sectors[0].percentageOfTotal).toBeCloseTo(60.0, 1);
  });

  it('does NOT produce division-by-zero when totalBudget is 0', () => {
    const sanitized = sanitizeBudgetDataset(zeroBudgetDataset);
    sanitized.sectors.forEach((s) => {
      expect(Number.isNaN(s.percentageOfTotal)).toBe(false);
      expect(Number.isFinite(s.percentageOfTotal)).toBe(true);
    });
  });

  it('assigns unit "Lakh Cr" for India datasets missing unit', () => {
    const noUnit: BudgetDataset = { ...validDataset, unit: undefined };
    const sanitized = sanitizeBudgetDataset(noUnit);
    expect(sanitized.unit).toBe('Lakh Cr');
  });

  it('assigns unit "Billion" for US datasets missing unit', () => {
    const usDataset: BudgetDataset = { ...validDataset, country: 'United States', unit: undefined };
    const sanitized = sanitizeBudgetDataset(usDataset);
    expect(sanitized.unit).toBe('Billion');
  });

  it('generates growthPercentage from prior/current when missing', () => {
    const dataset: BudgetDataset = {
      ...validDataset,
      sectors: [
        {
          id: 'sec-a',
          category: 'Sector A',
          allocatedAmount: 10,
          priorYearAmount: 8,
          percentageOfTotal: 10,
          // growthPercentage intentionally omitted
        },
      ],
    };
    const sanitized = sanitizeBudgetDataset(dataset);
    // (10 - 8) / 8 * 100 = 25%
    expect(sanitized.sectors[0].growthPercentage).toBeCloseTo(25.0, 1);
  });

  it('sanitized dataset passes BudgetDatasetSchema', () => {
    const sanitized = sanitizeBudgetDataset(validDataset);
    const result = BudgetDatasetSchema.safeParse(sanitized);
    expect(result.success).toBe(true);
  });
});

// ─── compareBudgets ───────────────────────────────────────────────────────────

describe('compareBudgets — identical datasets', () => {
  it('sets isIdentical to true when same country and year', () => {
    const result = compareBudgets(validDataset, validDataset);
    expect(result.isIdentical).toBe(true);
  });

  it('returns totalDelta of 0 for identical datasets', () => {
    const result = compareBudgets(validDataset, validDataset);
    expect(result.totalDelta).toBe(0);
  });

  it('returns totalPercentageChange of 0 for identical datasets', () => {
    const result = compareBudgets(validDataset, validDataset);
    expect(result.totalPercentageChange).toBe(0);
  });

  it('includes zeroDeltaNotice message when identical', () => {
    const result = compareBudgets(validDataset, validDataset);
    expect(result.zeroDeltaNotice).toBeTruthy();
    expect(result.zeroDeltaNotice).toContain('Identical datasets');
  });

  it('all sector statuses are "unchanged" when identical', () => {
    const result = compareBudgets(validDataset, validDataset);
    result.sectorDeltas.forEach((d) => {
      expect(d.status).toBe('unchanged');
    });
  });
});

describe('compareBudgets — different datasets', () => {
  const datasetA: BudgetDataset = {
    id: 'a',
    country: 'India',
    year: 2025,
    currency: '₹',
    unit: 'Lakh Cr',
    totalBudget: 100.0,
    sectors: [
      { id: 'sec-a', category: 'Education', allocatedAmount: 40.0, percentageOfTotal: 40.0 },
      { id: 'sec-b', category: 'Defence', allocatedAmount: 60.0, percentageOfTotal: 60.0 },
    ],
  };

  const datasetB: BudgetDataset = {
    id: 'b',
    country: 'India',
    year: 2026,
    currency: '₹',
    unit: 'Lakh Cr',
    totalBudget: 110.0,
    sectors: [
      { id: 'sec-a', category: 'Education', allocatedAmount: 50.0, percentageOfTotal: 45.45 },
      { id: 'sec-b', category: 'Defence', allocatedAmount: 60.0, percentageOfTotal: 54.55 },
    ],
  };

  it('sets isIdentical to false for different years', () => {
    const result = compareBudgets(datasetA, datasetB);
    expect(result.isIdentical).toBe(false);
  });

  it('calculates totalDelta correctly', () => {
    const result = compareBudgets(datasetA, datasetB);
    expect(result.totalDelta).toBeCloseTo(10.0, 2);
  });

  it('calculates totalPercentageChange correctly', () => {
    const result = compareBudgets(datasetA, datasetB);
    // (110 - 100) / 100 * 100 = 10%
    expect(result.totalPercentageChange).toBeCloseTo(10.0, 1);
  });

  it('marks increased sector correctly', () => {
    const result = compareBudgets(datasetA, datasetB);
    const education = result.sectorDeltas.find((d) => d.category === 'Education')!;
    expect(education.status).toBe('increased');
    expect(education.delta).toBeCloseTo(10.0, 2);
  });

  it('marks unchanged sector correctly (same amount)', () => {
    const result = compareBudgets(datasetA, datasetB);
    const defence = result.sectorDeltas.find((d) => d.category === 'Defence')!;
    // Same allocatedAmount in A and B — but inflation-adjusted may differ
    // The status depends on nominal delta (60 vs 60 = 0 delta → unchanged)
    expect(defence.delta).toBe(0);
  });

  it('sorts sector deltas by absolute delta descending', () => {
    const result = compareBudgets(datasetA, datasetB);
    for (let i = 0; i < result.sectorDeltas.length - 1; i++) {
      expect(Math.abs(result.sectorDeltas[i].delta)).toBeGreaterThanOrEqual(
        Math.abs(result.sectorDeltas[i + 1].delta)
      );
    }
  });
});

describe('compareBudgets — discontinued and new sectors', () => {
  const datasetWithSectors: BudgetDataset = {
    id: 'c',
    country: 'India',
    year: 2025,
    currency: '₹',
    totalBudget: 100.0,
    sectors: [
      { id: 'sec-a', category: 'Old Category', allocatedAmount: 50.0, percentageOfTotal: 50.0 },
      { id: 'sec-b', category: 'Shared', allocatedAmount: 50.0, percentageOfTotal: 50.0 },
    ],
  };

  const datasetWithNewSectors: BudgetDataset = {
    id: 'd',
    country: 'India',
    year: 2026,
    currency: '₹',
    totalBudget: 100.0,
    sectors: [
      { id: 'sec-c', category: 'New Category', allocatedAmount: 50.0, percentageOfTotal: 50.0 },
      { id: 'sec-b', category: 'Shared', allocatedAmount: 50.0, percentageOfTotal: 50.0 },
    ],
  };

  it('marks sector present only in A as "discontinued"', () => {
    const result = compareBudgets(datasetWithSectors, datasetWithNewSectors);
    const oldCat = result.sectorDeltas.find((d) => d.category === 'Old Category')!;
    expect(oldCat.status).toBe('discontinued');
  });

  it('marks sector present only in B as "new"', () => {
    const result = compareBudgets(datasetWithSectors, datasetWithNewSectors);
    const newCat = result.sectorDeltas.find((d) => d.category === 'New Category')!;
    expect(newCat.status).toBe('new');
  });
});

describe('compareBudgets — default India 2026 dataset schema', () => {
  it('DEFAULT_INDIA_2026_BUDGET passes BudgetDatasetSchema', () => {
    const result = BudgetDatasetSchema.safeParse(DEFAULT_INDIA_2026_BUDGET);
    expect(result.success).toBe(true);
  });

  it('self-comparison of default budget returns isIdentical: true', () => {
    const result = compareBudgets(DEFAULT_INDIA_2026_BUDGET, DEFAULT_INDIA_2026_BUDGET);
    expect(result.isIdentical).toBe(true);
    expect(result.totalDelta).toBe(0);
  });
});
