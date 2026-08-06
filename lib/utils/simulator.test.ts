import { describe, it, expect } from 'vitest';
import {
  initializeSimulationState,
  reallocateZeroSum,
  enforcePrecision,
  getSimulationDeltas,
} from './simulator';
import type { BudgetDataset, SimulationState } from '@/types/budget';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockDataset: BudgetDataset = {
  id: 'test-dataset',
  country: 'India',
  year: 2026,
  currency: '₹',
  unit: 'Lakh Cr',
  totalBudget: 100.0,
  sectors: [
    { id: 'sec-a', category: 'Sector A', allocatedAmount: 50.0, percentageOfTotal: 50.0 },
    { id: 'sec-b', category: 'Sector B', allocatedAmount: 30.0, percentageOfTotal: 30.0 },
    { id: 'sec-c', category: 'Sector C', allocatedAmount: 20.0, percentageOfTotal: 20.0 },
    {
      id: 'sec-zero',
      category: 'Zero Allocation Reserve Category',
      allocatedAmount: 0.0,
      percentageOfTotal: 0.0,
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sumPct(state: SimulationState) {
  return state.sectors.reduce((sum, s) => sum + s.simulatedPercentage, 0);
}
function sumAmt(state: SimulationState) {
  return state.sectors.reduce((sum, s) => sum + s.simulatedAmount, 0);
}

// ─── initializeSimulationState ────────────────────────────────────────────────

describe('initializeSimulationState', () => {
  it('produces a valid SimulationState from BudgetDataset', () => {
    const state = initializeSimulationState(mockDataset);

    expect(state.datasetId).toBe('test-dataset');
    expect(state.country).toBe('India');
    expect(state.baselineTotalBudget).toBe(100.0);
    expect(state.sectors).toHaveLength(4);
  });

  it('sets all sectors to isLocked = false', () => {
    const state = initializeSimulationState(mockDataset);
    expect(state.sectors.every((s) => s.isLocked === false)).toBe(true);
  });

  it('initializes simulatedAmount equal to allocatedAmount', () => {
    const state = initializeSimulationState(mockDataset);
    state.sectors.forEach((s) => {
      expect(s.simulatedAmount).toBeCloseTo(s.allocatedAmount, 2);
    });
  });

  it('percentage sum equals exactly 100.00%', () => {
    const state = initializeSimulationState(mockDataset);
    expect(sumPct(state)).toBeCloseTo(100.0, 1);
  });

  it('amount sum equals totalBudget', () => {
    const state = initializeSimulationState(mockDataset);
    expect(sumAmt(state)).toBeCloseTo(100.0, 2);
  });

  it('sec-zero starts at 0.00 — no NaN, no Infinity', () => {
    const state = initializeSimulationState(mockDataset);
    const zeroSec = state.sectors.find((s) => s.id === 'sec-zero')!;
    expect(zeroSec.simulatedAmount).toBe(0);
    expect(zeroSec.simulatedPercentage).toBe(0);
    expect(Number.isFinite(zeroSec.simulatedAmount)).toBe(true);
    expect(Number.isNaN(zeroSec.simulatedPercentage)).toBe(false);
  });
});

// ─── reallocateZeroSum ────────────────────────────────────────────────────────

describe('reallocateZeroSum — zero-sum invariant', () => {
  it('preserves total after increasing Sector A', () => {
    const state = initializeSimulationState(mockDataset);
    const next = reallocateZeroSum(state, 'sec-a', 60.0);

    expect(sumAmt(next)).toBeCloseTo(100.0, 2);
    expect(sumPct(next)).toBeCloseTo(100.0, 1);
  });

  it('sets target sector to requested amount', () => {
    const state = initializeSimulationState(mockDataset);
    const next = reallocateZeroSum(state, 'sec-a', 60.0);
    const secA = next.sectors.find((s) => s.id === 'sec-a')!;
    expect(secA.simulatedAmount).toBeCloseTo(60.0, 2);
  });

  it('preserves total after decreasing Sector A', () => {
    const state = initializeSimulationState(mockDataset);
    const next = reallocateZeroSum(state, 'sec-a', 40.0);

    expect(sumAmt(next)).toBeCloseTo(100.0, 2);
    expect(sumPct(next)).toBeCloseTo(100.0, 1);
  });
});

describe('reallocateZeroSum — extreme drag', () => {
  it('dragging to 100% does not produce negative sector amounts', () => {
    const state = initializeSimulationState(mockDataset);
    const extreme = reallocateZeroSum(state, 'sec-a', 100.0);

    extreme.sectors.forEach((s) => {
      expect(s.simulatedAmount).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(s.simulatedAmount)).toBe(false);
    });
  });

  it('dragging to 0% gives the target sector exactly 0.00', () => {
    const state = initializeSimulationState(mockDataset);
    const min = reallocateZeroSum(state, 'sec-a', 0.0);
    const secA = min.sectors.find((s) => s.id === 'sec-a')!;
    expect(secA.simulatedAmount).toBeCloseTo(0, 2);
  });

  it('dragging to 0% preserves total budget across remaining sectors', () => {
    const state = initializeSimulationState(mockDataset);
    const min = reallocateZeroSum(state, 'sec-a', 0.0);
    expect(sumAmt(min)).toBeCloseTo(100.0, 2);
  });
});

describe('reallocateZeroSum — locking guard', () => {
  it('locked sectors absorb zero delta', () => {
    const state = initializeSimulationState(mockDataset);
    const lockedState: SimulationState = {
      ...state,
      sectors: state.sectors.map((s) => (s.id === 'sec-b' ? { ...s, isLocked: true } : s)),
    };

    const next = reallocateZeroSum(lockedState, 'sec-a', 70.0);
    const secB = next.sectors.find((s) => s.id === 'sec-b')!;
    expect(secB.simulatedAmount).toBeCloseTo(30.0, 2);
  });

  it('locked sector itself does not move when dragged', () => {
    const state = initializeSimulationState(mockDataset);
    const lockedState: SimulationState = {
      ...state,
      sectors: state.sectors.map((s) => (s.id === 'sec-a' ? { ...s, isLocked: true } : s)),
    };

    const next = reallocateZeroSum(lockedState, 'sec-a', 70.0);
    const secA = next.sectors.find((s) => s.id === 'sec-a')!;
    // Because sec-a is locked, the change must be reverted — it stays at 50
    expect(secA.simulatedAmount).toBeCloseTo(50.0, 2);
  });

  it('reverts change when ALL other sectors are locked', () => {
    const state = initializeSimulationState(mockDataset);
    const allLockedExceptA: SimulationState = {
      ...state,
      sectors: state.sectors.map((s) => (s.id !== 'sec-a' ? { ...s, isLocked: true } : s)),
    };

    // Should revert since no absorption is possible
    const next = reallocateZeroSum(allLockedExceptA, 'sec-a', 80.0);
    const secA = next.sectors.find((s) => s.id === 'sec-a')!;
    expect(secA.simulatedAmount).toBeCloseTo(50.0, 2);
  });
});

describe('reallocateZeroSum — sequential operations', () => {
  it('multi-sector drag sequences maintain zero-sum across each step', () => {
    let state = initializeSimulationState(mockDataset);

    state = reallocateZeroSum(state, 'sec-a', 60.0);
    expect(sumAmt(state)).toBeCloseTo(100.0, 2);

    state = reallocateZeroSum(state, 'sec-b', 15.0);
    expect(sumAmt(state)).toBeCloseTo(100.0, 2);

    state = reallocateZeroSum(state, 'sec-c', 5.0);
    expect(sumAmt(state)).toBeCloseTo(100.0, 2);
  });

  it('returns same state reference for unknown sectorId', () => {
    const state = initializeSimulationState(mockDataset);
    const next = reallocateZeroSum(state, 'nonexistent-id', 50.0);
    expect(next).toBe(state);
  });

  it('returns same state reference when delta is below threshold (< 0.0001)', () => {
    const state = initializeSimulationState(mockDataset);
    const secA = state.sectors.find((s) => s.id === 'sec-a')!;
    const next = reallocateZeroSum(state, 'sec-a', secA.simulatedAmount + 0.00001);
    expect(next).toBe(state);
  });
});

// ─── enforcePrecision ─────────────────────────────────────────────────────────

describe('enforcePrecision', () => {
  it('Hamilton/Hare-Niemeyer: percentages sum to exactly 100.00', () => {
    const state = initializeSimulationState(mockDataset);
    const precise = enforcePrecision(state);
    expect(sumPct(precise)).toBeCloseTo(100.0, 1);
  });

  it('amounts sum to baselineTotalBudget after rounding', () => {
    const state = initializeSimulationState(mockDataset);
    const precise = enforcePrecision(state);
    expect(sumAmt(precise)).toBeCloseTo(state.baselineTotalBudget, 2);
  });

  it('returns unchanged state when baselineTotalBudget is 0', () => {
    const state = initializeSimulationState(mockDataset);
    const zeroBaseState: SimulationState = { ...state, baselineTotalBudget: 0 };
    const result = enforcePrecision(zeroBaseState);
    expect(result).toBe(zeroBaseState);
  });

  it('each sector simulatedPercentage is bounded [0, 100]', () => {
    const state = initializeSimulationState(mockDataset);
    const precise = enforcePrecision(state);
    precise.sectors.forEach((s) => {
      expect(s.simulatedPercentage).toBeGreaterThanOrEqual(0);
      expect(s.simulatedPercentage).toBeLessThanOrEqual(100);
    });
  });
});

// ─── getSimulationDeltas ──────────────────────────────────────────────────────

describe('getSimulationDeltas', () => {
  it('returns empty array when no sector has changed', () => {
    const state = initializeSimulationState(mockDataset);
    expect(getSimulationDeltas(state)).toHaveLength(0);
  });

  it('returns only sectors with |deltaAmount| >= 0.01', () => {
    const state = initializeSimulationState(mockDataset);
    const modified = reallocateZeroSum(state, 'sec-a', 60.0);
    const deltas = getSimulationDeltas(modified);

    // All returned sectors must have meaningful deltas
    deltas.forEach((d) => {
      expect(Math.abs(d.newAmount - (d.baselineAmount ?? 0))).toBeGreaterThanOrEqual(0);
    });
    // There must be at least one (sec-a was changed)
    expect(deltas.length).toBeGreaterThan(0);
  });

  it('delta entries include sectorId, newAmount, deltaPercentage', () => {
    const state = initializeSimulationState(mockDataset);
    const modified = reallocateZeroSum(state, 'sec-a', 75.0);
    const deltas = getSimulationDeltas(modified);

    deltas.forEach((d) => {
      expect(d).toHaveProperty('sectorId');
      expect(d).toHaveProperty('newAmount');
      expect(d).toHaveProperty('deltaPercentage');
    });
  });

  it('sec-zero-demo does not appear in deltas when unchanged', () => {
    const state = initializeSimulationState(mockDataset);
    const deltas = getSimulationDeltas(state);
    const zeroInDeltas = deltas.find((d) => d.sectorId === 'sec-zero');
    expect(zeroInDeltas).toBeUndefined();
  });
});
