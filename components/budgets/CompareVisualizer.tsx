'use client';

import React from 'react';
import { SectorComparisonItem } from '@/types/budget';
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertCircle, PlusCircle, XCircle } from 'lucide-react';

interface CompareVisualizerProps {
  datasetA: { country: string; year: number; currency: string; unit?: string; totalBudget: number };
  datasetB: { country: string; year: number; currency: string; unit?: string; totalBudget: number };
  sectorDeltas: SectorComparisonItem[];
  isIdentical?: boolean;
}

export const CompareVisualizer: React.FC<CompareVisualizerProps> = ({
  datasetA,
  datasetB,
  sectorDeltas,
  isIdentical,
}) => {
  // Find maximum allocated amount across both datasets for proportional bar scaling
  const maxAmount = Math.max(
    1,
    ...sectorDeltas.map((s) => Math.max(s.amountA, s.amountB))
  );

  const unitA = datasetA.unit || (datasetA.country.toLowerCase().includes('india') ? 'Lakh Cr' : 'Billion');
  const unitB = datasetB.unit || (datasetB.country.toLowerCase().includes('india') ? 'Lakh Cr' : 'Billion');
  const isDifferentCurrency = datasetA.currency !== datasetB.currency || unitA !== unitB;

  return (
    <div className="w-full space-y-6">
      {/* Header Summary Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dataset A Card */}
        <div className="modal-card p-5 shadow-lg relative overflow-hidden transition-colors duration-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-secondary)]">
              Baseline Dataset A
            </span>
            <span className="bg-[var(--badge-bg)] text-[var(--text-secondary)] border border-[var(--badge-border)] px-2 py-0.5 rounded text-[12px] font-mono">
              {datasetA.year}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{datasetA.country}</h3>
          <p className="text-2xl sm:text-3xl font-light text-[var(--accent-pulse)] font-mono flex items-baseline gap-1.5 flex-wrap">
            <span>{datasetA.currency}{datasetA.totalBudget.toLocaleString()}</span>
            <span className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{unitA} Total</span>
          </p>
        </div>

        {/* Dataset B Card */}
        <div className="modal-card p-5 shadow-lg relative overflow-hidden transition-colors duration-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-secondary)]">
              Target Dataset B
            </span>
            <span className="bg-[var(--badge-bg)] text-[var(--text-secondary)] border border-[var(--badge-border)] px-2 py-0.5 rounded text-[12px] font-mono">
              {datasetB.year}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{datasetB.country}</h3>
          <p className="text-2xl sm:text-3xl font-light text-[var(--accent-pulse)] font-mono flex items-baseline gap-1.5 flex-wrap">
            <span>{datasetB.currency}{datasetB.totalBudget.toLocaleString()}</span>
            <span className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{unitB} Total</span>
          </p>
        </div>
      </div>

      {/* Cross-Currency Scale Notice Pill */}
      {isDifferentCurrency && (
        <div className="bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-lg p-3 text-xs text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent-pulse)] shrink-0" />
          <span>
            <strong>Unit & Scale Clarification:</strong> {datasetA.country} is reported in <strong>{datasetA.currency} {unitA}</strong> while {datasetB.country} is reported in <strong>{datasetB.currency} {unitB}</strong>.
          </span>
        </div>
      )}

      {/* Side-by-Side Sector Breakdown */}
      <div className="modal-card p-6 shadow-xl space-y-6 transition-colors duration-200">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Sector Spending Comparison</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Comparing allocations from {datasetA.country} ({datasetA.year}) to {datasetB.country} ({datasetB.year})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <span className="w-3 h-3 rounded-full bg-[var(--text-muted)]" />
              <span>{datasetA.year} Baseline</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--accent-pulse)]">
              <span className="w-3 h-3 rounded-full bg-[var(--accent-pulse)]" />
              <span>{datasetB.year} Target</span>
            </div>
          </div>
        </div>

        {/* Sectors List */}
        <div className="space-y-6">
          {sectorDeltas.map((sector) => {
            const widthA = Math.min(100, Math.max(2, (sector.amountA / maxAmount) * 100));
            const widthB = Math.min(100, Math.max(2, (sector.amountB / maxAmount) * 100));

            // Format percentage spike safely for >1000%
            const rawChange = sector.percentageChange;
            const isExtremeSpike = Math.abs(rawChange) >= 1000;
            const formattedChange = isExtremeSpike
              ? `${rawChange > 0 ? '+' : ''}${rawChange.toLocaleString()}%`
              : `${rawChange > 0 ? '+' : ''}${rawChange}%`;

            return (
              <div
                key={sector.id || sector.category}
                className="bg-[var(--bg-hover)]/60 border border-[var(--border-color)] rounded-lg p-4 transition-all hover:border-[var(--accent-pulse)]/50"
              >
                {/* Sector Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{sector.category}</h4>

                    {/* Status Badges */}
                    {sector.status === 'increased' && (
                      <span className="inline-flex items-center gap-1 bg-[var(--badge-bg)] text-[var(--accent-pulse)] border border-[var(--badge-border)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{sector.delta} ({formattedChange})</span>
                      </span>
                    )}

                    {sector.status === 'decreased' && (
                      <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <TrendingDown className="w-3 h-3" />
                        <span>{sector.delta} ({formattedChange})</span>
                      </span>
                    )}

                    {sector.status === 'unchanged' && (
                      <span className="inline-flex items-center gap-1 bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Minus className="w-3 h-3" />
                        <span>Unchanged (0%)</span>
                      </span>
                    )}

                    {sector.status === 'new' && (
                      <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <PlusCircle className="w-3 h-3" />
                        <span>New Sector (+{sector.amountB})</span>
                      </span>
                    )}

                    {sector.status === 'discontinued' && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" />
                        <span>Discontinued ({sector.amountA})</span>
                      </span>
                    )}

                    {/* Extreme Spike Alert Indicator */}
                    {isExtremeSpike && (
                      <span
                        className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        title="Extreme percentage spike detected (>1000% growth)"
                      >
                        ⚡ Growth Spike
                      </span>
                    )}
                  </div>

                  {/* Amounts Summary */}
                  <div className="text-xs font-mono text-[var(--text-secondary)]">
                    <span>{datasetA.currency}{sector.amountA} {unitA}</span>
                    <span className="mx-1 text-[var(--text-muted)]">→</span>
                    <span className="font-bold text-[var(--accent-pulse)]">{datasetB.currency}{sector.amountB} {unitB}</span>
                  </div>
                </div>

                {/* Proportional Bars */}
                <div className="space-y-2 max-w-full overflow-hidden">
                  {/* Bar A */}
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-[10px] font-mono text-[var(--text-muted)] text-right shrink-0">
                      {datasetA.year}
                    </span>
                    <div className="flex-1 bg-[var(--bg-hover)] h-3 rounded-full overflow-hidden relative border border-[var(--border-subtle)]">
                      <div
                        className="bg-[var(--text-muted)] h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthA}%` }}
                      />
                    </div>
                  </div>

                  {/* Bar B */}
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-[10px] font-mono text-[var(--accent-pulse)] text-right shrink-0">
                      {datasetB.year}
                    </span>
                    <div className="flex-1 bg-[var(--bg-hover)] h-3 rounded-full overflow-hidden relative border border-[var(--border-subtle)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          sector.status === 'decreased'
                            ? 'bg-rose-500'
                            : sector.status === 'discontinued'
                            ? 'bg-amber-500'
                            : 'bg-[var(--accent-pulse)]'
                        }`}
                        style={{ width: `${widthB}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
