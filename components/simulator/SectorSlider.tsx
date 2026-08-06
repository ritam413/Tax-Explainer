'use client';

import React from 'react';
import { SimulatedSector } from '@/types/budget';
import { Lock, Unlock, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface SectorSliderProps {
  sector: SimulatedSector;
  currency: string;
  unit: string;
  maxBudget: number;
  onAmountChange: (sectorId: string, newAmount: number) => void;
  onLockToggle: (sectorId: string) => void;
  isHighlighted?: boolean;
  onSelect?: () => void;
}

export const SectorSlider: React.FC<SectorSliderProps> = ({
  sector,
  currency,
  unit,
  maxBudget,
  onAmountChange,
  onLockToggle,
  isHighlighted,
  onSelect,
}) => {
  const isIncreased = sector.deltaAmount > 0.001;
  const isDecreased = sector.deltaAmount < -0.001;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onAmountChange(sector.id, val);
    }
  };

  return (
    <div
      id={`sector-slider-${sector.id}`}
      className={`p-3 rounded-xl border transition-all duration-300 ${
        isHighlighted
          ? 'ring-2 ring-[var(--accent-pulse)] border-[var(--accent-pulse)] bg-[var(--badge-bg)] shadow-[0_0_20px_rgba(127,238,100,0.25)]'
          : sector.isLocked
          ? 'bg-[var(--bg-hover)]/60 border-[var(--border-color)]/40 opacity-80'
          : 'modal-card border-[var(--border-color)] hover:border-[var(--accent-pulse)]/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => onLockToggle(sector.id)}
            title={sector.isLocked ? 'Unlock budget sector' : 'Lock budget sector'}
            aria-label={sector.isLocked ? `Unlock ${sector.category} budget` : `Lock ${sector.category} budget`}
            aria-pressed={sector.isLocked}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              sector.isLocked
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            {sector.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <span
            onClick={onSelect}
            className="font-semibold text-xs text-[var(--text-primary)] truncate font-goga cursor-pointer hover:text-[var(--accent-pulse)] transition-colors"
            title="Click to select/pin active control"
          >
            {sector.category}
          </span>
          {isHighlighted && (
            <span
              onClick={onSelect}
              className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--accent-pulse)] text-[var(--accent-text)] animate-pulse shrink-0 cursor-pointer"
            >
              Active Control
            </span>
          )}
        </div>

        {/* Delta indicator badge */}
        <div className="flex items-center gap-1.5 text-[11px] shrink-0 font-mono">
          {isIncreased && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--accent-pulse)] border border-[var(--badge-border)] font-medium">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +{sector.deltaAmount.toFixed(2)} ({sector.deltaPercentage > 0 ? `+${sector.deltaPercentage}%` : `${sector.deltaPercentage}%`})
            </span>
          )}
          {isDecreased && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium">
              <ArrowDownRight className="w-2.5 h-2.5" />
              {sector.deltaAmount.toFixed(2)} ({sector.deltaPercentage}%)
            </span>
          )}
          {!isIncreased && !isDecreased && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border-color)] font-medium">
              <Minus className="w-2.5 h-2.5" />
              0.00
            </span>
          )}
        </div>
      </div>

      {/* Amount readouts */}
      <div className="flex items-baseline justify-between text-[11px] mb-1.5 font-mono">
        <span className="text-[var(--text-muted)]">
          Base: {currency}
          {sector.allocatedAmount.toFixed(2)} {unit}
        </span>
        <span className="text-[var(--accent-pulse)] font-bold text-xs">
          {currency}
          {sector.simulatedAmount.toFixed(2)} {unit} ({sector.simulatedPercentage.toFixed(2)}%)
        </span>
      </div>

      {/* Slider input */}
      <div className="relative flex items-center">
        <input
          type="range"
          id={`slider-${sector.id}`}
          min="0"
          max={maxBudget}
          step="0.01"
          disabled={sector.isLocked}
          value={sector.simulatedAmount}
          onChange={handleSliderChange}
          aria-label={`${sector.category} budget allocation`}
          aria-valuemin={0}
          aria-valuemax={maxBudget}
          aria-valuenow={sector.simulatedAmount}
          aria-valuetext={`${currency}${sector.simulatedAmount.toFixed(2)} ${unit} — ${sector.simulatedPercentage.toFixed(2)}% of total budget`}
          aria-disabled={sector.isLocked}
          className="w-full h-1.5 bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-pulse)] disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>

  );
};
