import { BudgetDataset, SectorBudget, ComparisonResponse, SectorComparisonItem } from '@/types/budget';
import fs from 'fs';
import path from 'path';

/**
 * Default Baseline Dataset: Union Budget of India 2026 (FY 2026-27)
 */
export const DEFAULT_INDIA_2026_BUDGET: BudgetDataset = {
  id: 'ind-2026-union-budget',
  country: 'India',
  year: 2026,
  currency: '₹',
  totalBudget: 50.65,
  sectors: [
    {
      id: 'sec-interest',
      category: 'Interest Payments & Debt Servicing',
      allocatedAmount: 11.90,
      priorYearAmount: 10.80,
      growthPercentage: 10.19,
      percentageOfTotal: 23.49,
      description: 'Annual interest obligations on national accumulated borrowings and treasury debt.'
    },
    {
      id: 'sec-defence',
      category: 'Defence & Security',
      allocatedAmount: 6.22,
      priorYearAmount: 5.94,
      growthPercentage: 4.71,
      percentageOfTotal: 12.28,
      description: 'Capital acquisitions, modern army infrastructure, border security, and defense pensions.'
    },
    {
      id: 'sec-transport',
      category: 'Transport & Infrastructure',
      allocatedAmount: 5.45,
      priorYearAmount: 4.96,
      growthPercentage: 9.88,
      percentageOfTotal: 10.76,
      description: 'National Highways Authority expansion, Indian Railways modernization, and port corridors.'
    },
    {
      id: 'sec-rural',
      category: 'Rural Development & Agriculture',
      allocatedAmount: 4.60,
      priorYearAmount: 4.25,
      growthPercentage: 8.24,
      percentageOfTotal: 9.08,
      description: 'PM-KISAN direct transfers, MGNREGA employment guarantee, and rural irrigation networks.'
    },
    {
      id: 'sec-energy',
      category: 'Energy, Solar & Clean Tech',
      allocatedAmount: 3.15,
      priorYearAmount: 2.70,
      growthPercentage: 16.67,
      percentageOfTotal: 6.22,
      description: 'National Green Hydrogen Mission, solar grid subsidies, and EV infrastructure grants.'
    },
    {
      "id": "sec-education",
      "category": "Education & Skill Building",
      "allocatedAmount": 1.48,
      "priorYearAmount": 1.35,
      "growthPercentage": 9.63,
      "percentageOfTotal": 2.92,
      "description": "Higher education research grants, digital university ecosystem, and IIT/IIM expansion."
    },
    {
      id: 'sec-health',
      category: 'Healthcare & Sanitation',
      allocatedAmount: 1.22,
      priorYearAmount: 1.10,
      growthPercentage: 10.91,
      percentageOfTotal: 2.41,
      description: 'Ayushman Bharat insurance coverage, rural primary health centers, and medical colleges.'
    },
    {
      id: 'sec-tech',
      category: 'Semiconductors & Deep Tech',
      allocatedAmount: 0.95,
      priorYearAmount: 0.05,
      growthPercentage: 1800.00,
      percentageOfTotal: 1.88,
      description: 'India Semiconductor Mission incentives, AI compute capacity subsidies, and space exploration.'
    },
    {
      id: 'sec-zero-demo',
      category: 'Zero Allocation Reserve Category',
      allocatedAmount: 0.00,
      priorYearAmount: 0.00,
      growthPercentage: 0.00,
      percentageOfTotal: 0.00,
      description: 'Demonstration category for zero budget allocation edge-case handling.'
    }
  ]
};

/**
 * Sanitizes budget dataset to ensure zero-division errors are avoided and missing properties have valid defaults.
 */
export function sanitizeBudgetDataset(dataset: BudgetDataset): BudgetDataset {
  const safeTotal = dataset.totalBudget > 0 ? dataset.totalBudget : 0;
  const countryLower = (dataset.country || 'India').toLowerCase();

  const defaultCurrency = countryLower.includes('india') || countryLower === 'ind'
    ? '₹'
    : countryLower.includes('united') || countryLower.includes('us')
    ? '$'
    : countryLower.includes('japan') || countryLower === 'jpn'
    ? '¥'
    : countryLower.includes('russia') || countryLower === 'rus'
    ? '₽'
    : '₹';
  
  const defaultUnit = countryLower.includes('india') || countryLower === 'ind'
    ? 'Lakh Cr'
    : countryLower.includes('united') || countryLower.includes('us')
    ? 'Billion'
    : 'Trillion';

  const currency = dataset.currency || defaultCurrency;
  const unit = dataset.unit || defaultUnit;

  const sanitizedSectors = (dataset.sectors || []).map((sec, index) => {
    const allocated = typeof sec.allocatedAmount === 'number' && !isNaN(sec.allocatedAmount) ? sec.allocatedAmount : 0;
    const prior = typeof sec.priorYearAmount === 'number' && !isNaN(sec.priorYearAmount) ? sec.priorYearAmount : 0;
    
    // Division-by-zero protection for percentage of total calculation
    const calculatedPercentage = safeTotal > 0 ? Number(((allocated / safeTotal) * 100).toFixed(2)) : 0;
    
    // Growth calculation guard
    let calculatedGrowth = sec.growthPercentage;
    if (calculatedGrowth === undefined && prior > 0) {
      calculatedGrowth = Number((((allocated - prior) / prior) * 100).toFixed(2));
    } else if (calculatedGrowth === undefined) {
      calculatedGrowth = 0;
    }

    return {
      id: sec.id || `sector-${index}`,
      category: sec.category || 'Unspecified Category',
      allocatedAmount: Number(allocated.toFixed(2)),
      priorYearAmount: Number(prior.toFixed(2)),
      growthPercentage: Number((calculatedGrowth || 0).toFixed(2)),
      percentageOfTotal: calculatedPercentage,
      description: sec.description || 'No detailed description available for this budget allocation.'
    };
  });

  return {
    ...dataset,
    currency,
    unit,
    totalBudget: Number(safeTotal.toFixed(2)),
    sectors: sanitizedSectors
  };
}

/**
 * Retrieves budget dataset by country and year from Docs/budgets/*.json or fallback defaults.
 */
export async function fetchBudgetDataset(country = 'India', year = 2026): Promise<BudgetDataset> {
  const normalizedCountry = country.toLowerCase().trim();
  const countrySlug = normalizedCountry.includes('india') || normalizedCountry === 'ind' ? 'india'
    : normalizedCountry.includes('united states') || normalizedCountry.includes('us') ? 'us'
    : normalizedCountry.includes('japan') || normalizedCountry === 'jpn' ? 'japan'
    : normalizedCountry.includes('russia') || normalizedCountry === 'rus' ? 'russia'
    : 'india';

  const fileName = `${countrySlug}-${year}.json`;
  const filePath = path.join(process.cwd(), 'Docs', 'budgets', fileName);

  try {
    if (typeof window === 'undefined' && fs.existsSync) {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(fileContent);
        return sanitizeBudgetDataset(json as BudgetDataset);
      }
    }
  } catch (err) {
    console.warn(`Could not read dataset file ${filePath}, falling back to defaults:`, err);
  }

  // Fallback if file read fails or doesn't exist
  if (countrySlug === 'india' && year === 2026) {
    return sanitizeBudgetDataset(DEFAULT_INDIA_2026_BUDGET);
  }

  return sanitizeBudgetDataset({
    ...DEFAULT_INDIA_2026_BUDGET,
    country,
    year
  });
}

/**
 * Computes side-by-side budget comparison between Dataset A and Dataset B.
 * Handles Edge Cases:
 * 1. Mismatched Sector Schemas (Full outer join by category name)
 * 2. Identical Dataset Comparison (zero-delta notice, isIdentical flag)
 * 3. Extreme Percentage Spikes (safely handles division by zero & massive spikes)
 */
export function compareBudgets(
  datasetA: BudgetDataset,
  datasetB: BudgetDataset,
  inflationRate = 5.0
): ComparisonResponse {
  const isIdentical =
    datasetA.country.toLowerCase().trim() === datasetB.country.toLowerCase().trim() &&
    datasetA.year === datasetB.year;

  // 1. Calculate Total Deltas
  const totalDelta = Number((datasetB.totalBudget - datasetA.totalBudget).toFixed(2));
  const totalPercentageChange = datasetA.totalBudget > 0
    ? Number((((datasetB.totalBudget - datasetA.totalBudget) / datasetA.totalBudget) * 100).toFixed(2))
    : 0;

  // 2. Build Category Map for Full Outer Join (Mismatched Sector Schemas)
  const categoryMap = new Map<string, { secA?: SectorBudget; secB?: SectorBudget; originalName: string }>();

  (datasetA.sectors || []).forEach((sec) => {
    const key = sec.category.toLowerCase().trim();
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { secA: sec, originalName: sec.category });
    } else {
      categoryMap.get(key)!.secA = sec;
    }
  });

  (datasetB.sectors || []).forEach((sec) => {
    const key = sec.category.toLowerCase().trim();
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { secB: sec, originalName: sec.category });
    } else {
      categoryMap.get(key)!.secB = sec;
    }
  });

  // Inflation Multiplier
  const yearsDiff = Math.abs(datasetB.year - datasetA.year);
  const inflationMultiplier = Math.pow(1 + inflationRate / 100, Math.max(1, yearsDiff));

  // 3. Compute Sector Deltas
  const sectorDeltas: SectorComparisonItem[] = [];

  categoryMap.forEach(({ secA, secB, originalName }, key) => {
    const amountA = secA ? Number((secA.allocatedAmount || 0).toFixed(2)) : 0;
    const amountB = secB ? Number((secB.allocatedAmount || 0).toFixed(2)) : 0;
    const delta = Number((amountB - amountA).toFixed(2));

    // Inflation Adjusted Delta
    const inflationAdjustedA = amountA * (isIdentical ? 1 : inflationMultiplier);
    const inflationAdjustedDelta = Number((amountB - inflationAdjustedA).toFixed(2));

    // Determine status & percentage change
    let status: 'increased' | 'decreased' | 'unchanged' | 'new' | 'discontinued' = 'unchanged';
    let percentageChange = 0;

    if (isIdentical) {
      status = 'unchanged';
      percentageChange = 0;
    } else if (secA && !secB) {
      status = 'discontinued';
      percentageChange = -100;
    } else if (!secA && secB) {
      status = 'new';
      percentageChange = 100;
    } else if (amountA === 0 && amountB > 0) {
      status = 'new';
      percentageChange = 100;
    } else if (amountA > 0) {
      percentageChange = Number((((amountB - amountA) / amountA) * 100).toFixed(2));
      status = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'unchanged';
    }

    sectorDeltas.push({
      id: secB?.id || secA?.id || `cmp-${key}`,
      category: originalName,
      amountA,
      amountB,
      delta,
      percentageChange,
      inflationAdjustedDelta,
      status
    });
  });

  // Sort sector deltas by absolute delta size descending
  sectorDeltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    datasetA: {
      country: datasetA.country,
      year: datasetA.year,
      currency: datasetA.currency,
      unit: datasetA.unit || 'Lakh Cr',
      totalBudget: datasetA.totalBudget
    },
    datasetB: {
      country: datasetB.country,
      year: datasetB.year,
      currency: datasetB.currency,
      unit: datasetB.unit || 'Billion',
      totalBudget: datasetB.totalBudget
    },
    isIdentical,
    zeroDeltaNotice: isIdentical
      ? `Identical datasets selected (${datasetA.country} ${datasetA.year}). All category deltas are 0%.`
      : undefined,
    totalDelta,
    totalPercentageChange,
    inflationRate,
    sectorDeltas
  };
}
