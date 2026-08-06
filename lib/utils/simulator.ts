import { BudgetDataset, SimulatedSector, SimulationDelta, SimulationState } from '@/types/budget';

/**
 * Initializes a SimulationState from a baseline BudgetDataset.
 */
export function initializeSimulationState(dataset: BudgetDataset): SimulationState {
  const safeTotal = dataset.totalBudget > 0 ? dataset.totalBudget : 1;

  const sectors: SimulatedSector[] = dataset.sectors.map((s) => {
    const allocated = Math.max(0, s.allocatedAmount || 0);
    const pct = Number(((allocated / safeTotal) * 100).toFixed(2));
    return {
      ...s,
      allocatedAmount: allocated,
      simulatedAmount: allocated,
      simulatedPercentage: pct,
      deltaAmount: 0,
      deltaPercentage: 0,
      isLocked: false,
    };
  });

  return enforcePrecision({
    datasetId: dataset.id,
    country: dataset.country,
    year: dataset.year,
    currency: dataset.currency || '₹',
    unit: dataset.unit || 'Lakh Cr',
    baselineTotalBudget: dataset.totalBudget,
    simulatedTotalBudget: dataset.totalBudget,
    sectors,
  });
}

/**
 * Performs real-time zero-sum reallocation on budget sectors.
 *
 * Given a modified sector and target new amount:
 * 1. Delta Δ = targetAmount - currentAmount
 * 2. Δ is redistributed inversely across all un-locked sectors (excluding modified sector).
 * 3. Sectors hitting 0.0 floor are clamped and remaining residual Δ is re-distributed.
 * 4. Hamilton/Hare-Niemeyer rounding ensures sum of percentages equals exactly 100.00%.
 */
export function reallocateZeroSum(
  currentState: SimulationState,
  targetSectorId: string,
  targetNewAmount: number
): SimulationState {
  const targetSectorIndex = currentState.sectors.findIndex((s) => s.id === targetSectorId);
  if (targetSectorIndex === -1) return currentState;

  const targetSector = currentState.sectors[targetSectorIndex];
  if (targetSector.isLocked) return currentState;

  const baselineTotal = currentState.baselineTotalBudget;
  const clampedTargetAmount = Math.max(0, Math.min(baselineTotal, targetNewAmount));
  const amountDelta = clampedTargetAmount - targetSector.simulatedAmount;

  if (Math.abs(amountDelta) < 0.0001) return currentState;

  // Clone sectors to avoid mutating state directly
  const updatedSectors: SimulatedSector[] = currentState.sectors.map((s) => ({ ...s }));

  // Set new target amount for modified sector
  updatedSectors[targetSectorIndex].simulatedAmount = clampedTargetAmount;

  // Sectors available for absorbing the delta (unlocked & not target)
  let eligibleIndices = updatedSectors
    .map((s, idx) => (idx !== targetSectorIndex && !s.isLocked ? idx : -1))
    .filter((idx) => idx !== -1);

  if (eligibleIndices.length === 0) {
    // If all other sectors are locked, revert change
    return currentState;
  }

  // Iteratively redistribute remaining delta to enforce floor >= 0.0
  let deltaToAbsorb = amountDelta;

  while (Math.abs(deltaToAbsorb) > 0.0001 && eligibleIndices.length > 0) {
    const totalEligibleAmount = eligibleIndices.reduce(
      (sum, idx) => sum + updatedSectors[idx].simulatedAmount,
      0
    );

    let excessDelta = 0;
    const nextEligible: number[] = [];

    if (totalEligibleAmount <= 0.0001 && deltaToAbsorb > 0) {
      // All eligible sectors are 0, split remaining delta equally
      const equalShare = deltaToAbsorb / eligibleIndices.length;
      for (const idx of eligibleIndices) {
        updatedSectors[idx].simulatedAmount += equalShare;
      }
      deltaToAbsorb = 0;
      break;
    }

    for (const idx of eligibleIndices) {
      const sector = updatedSectors[idx];
      const weight =
        totalEligibleAmount > 0
          ? sector.simulatedAmount / totalEligibleAmount
          : 1 / eligibleIndices.length;

      const adjustment = deltaToAbsorb * weight;
      const proposed = sector.simulatedAmount - adjustment;

      if (proposed < 0) {
        // Sector hit 0 floor: absorb what it can and collect excess delta
        excessDelta += proposed; // proposed is negative, so adding accumulates overflow
        updatedSectors[idx].simulatedAmount = 0;
      } else {
        updatedSectors[idx].simulatedAmount = proposed;
        nextEligible.push(idx);
      }
    }

    // Next iteration absorbs excess negative overflow among remaining eligible sectors
    deltaToAbsorb = excessDelta;
    eligibleIndices = nextEligible;
  }

  // Calculate sector deltas from baseline
  for (const s of updatedSectors) {
    s.deltaAmount = Number((s.simulatedAmount - s.allocatedAmount).toFixed(4));
    s.deltaPercentage =
      s.allocatedAmount > 0
        ? Number(((s.deltaAmount / s.allocatedAmount) * 100).toFixed(2))
        : s.simulatedAmount > 0
        ? 100
        : 0;
  }

  const newState: SimulationState = {
    ...currentState,
    sectors: updatedSectors,
  };

  return enforcePrecision(newState);
}

/**
 * Enforces exact floating-point rounding using Hamilton/Hare-Niemeyer largest remainder method.
 * Guarantees sum of sector percentages === 100.00% and total budget equals baseline total.
 */
export function enforcePrecision(state: SimulationState): SimulationState {
  const baselineTotal = state.baselineTotalBudget;
  if (baselineTotal <= 0) return state;

  const sectors = state.sectors.map((s) => ({ ...s }));
  const rawPcts = sectors.map((s) => (s.simulatedAmount / baselineTotal) * 100);

  const floorPcts = rawPcts.map((pct) => Math.floor(pct * 100) / 100);
  const remainders = rawPcts.map((pct, idx) => ({
    idx,
    rem: pct * 100 - Math.floor(pct * 100),
  }));

  const totalAssignedFloor = floorPcts.reduce((sum, p) => sum + p, 0);
  let unitsToDistribute = Math.round((100.0 - totalAssignedFloor) * 100);

  // Sort remainders descending to distribute fractional cents/hundredths
  remainders.sort((a, b) => b.rem - a.rem);

  for (let i = 0; i < remainders.length && unitsToDistribute > 0; i++) {
    const targetIdx = remainders[i].idx;
    floorPcts[targetIdx] += 0.01;
    unitsToDistribute--;
  }

  let totalSimulated = 0;
  for (let i = 0; i < sectors.length; i++) {
    const s = sectors[i];
    s.simulatedPercentage = Number(floorPcts[i].toFixed(2));
    s.simulatedAmount = Number(((s.simulatedPercentage / 100) * baselineTotal).toFixed(2));
    s.deltaAmount = Number((s.simulatedAmount - s.allocatedAmount).toFixed(2));
    totalSimulated += s.simulatedAmount;
  }

  return {
    ...state,
    simulatedTotalBudget: Number(totalSimulated.toFixed(2)),
    sectors,
  };
}

/**
 * Extracts list of modified simulation deltas for AI explanation payloads.
 */
export function getSimulationDeltas(state: SimulationState): SimulationDelta[] {
  return state.sectors
    .filter((s) => Math.abs(s.deltaAmount) >= 0.01)
    .map((s) => ({
      sectorId: s.id,
      category: s.category,
      baselineAmount: s.allocatedAmount,
      newAmount: s.simulatedAmount,
      deltaPercentage: s.deltaPercentage,
    }));
}
