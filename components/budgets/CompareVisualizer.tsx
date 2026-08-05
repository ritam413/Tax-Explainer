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
        <div className="bg-[#181818] border border-[#485346] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#9cbf93]">
              Baseline Dataset A
            </span>
            <span className="bg-[#212525] text-[#8cab87] border border-[#485346] px-2 py-0.5 rounded text-[12px] font-mono">
              {datasetA.year}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#ddffdc] mb-1">{datasetA.country}</h3>
          <p className="text-2xl sm:text-3xl font-light text-[#7fee64] font-mono flex items-baseline gap-1.5 flex-wrap">
            <span>{datasetA.currency}{datasetA.totalBudget.toLocaleString()}</span>
            <span className="text-sm font-semibold text-[#8cab87] uppercase tracking-wide">{unitA} Total</span>
          </p>
        </div>

        {/* Dataset B Card */}
        <div className="bg-[#181818] border border-[#485346] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#9cbf93]">
              Target Dataset B
            </span>
            <span className="bg-[#212525] text-[#8cab87] border border-[#485346] px-2 py-0.5 rounded text-[12px] font-mono">
              {datasetB.year}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#ddffdc] mb-1">{datasetB.country}</h3>
          <p className="text-2xl sm:text-3xl font-light text-[#7fee64] font-mono flex items-baseline gap-1.5 flex-wrap">
            <span>{datasetB.currency}{datasetB.totalBudget.toLocaleString()}</span>
            <span className="text-sm font-semibold text-[#8cab87] uppercase tracking-wide">{unitB} Total</span>
          </p>
        </div>
      </div>

      {/* Cross-Currency Scale Notice Pill */}
      {isDifferentCurrency && (
        <div className="bg-[#212525] border border-[#7fee64]/30 rounded-lg p-3 text-xs text-[#ddffdc] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#7fee64] shrink-0" />
          <span>
            <strong>Unit & Scale Clarification:</strong> {datasetA.country} is reported in <strong>{datasetA.currency} {unitA}</strong> while {datasetB.country} is reported in <strong>{datasetB.currency} {unitB}</strong>.
          </span>
        </div>
      )}

      {/* Side-by-Side Sector Breakdown */}
      <div className="bg-[#181818] border border-[#485346] rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#2a3628] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#ddffdc]">Sector Spending Comparison</h3>
            <p className="text-xs text-[#8cab87]">
              Comparing allocations from {datasetA.country} ({datasetA.year}) to {datasetB.country} ({datasetB.year})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-[#677d64]">
              <span className="w-3 h-3 rounded-full bg-[#485346]" />
              <span>{datasetA.year} Baseline</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#7fee64]">
              <span className="w-3 h-3 rounded-full bg-[#7fee64]" />
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
                className="bg-[#212525]/60 border border-[#344032] rounded-lg p-4 transition-all hover:border-[#485346]"
              >
                {/* Sector Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[#ddffdc]">{sector.category}</h4>

                    {/* Status Badges */}
                    {sector.status === 'increased' && (
                      <span className="inline-flex items-center gap-1 bg-[#7fee64]/10 text-[#7fee64] border border-[#7fee64]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{sector.delta} ({formattedChange})</span>
                      </span>
                    )}

                    {sector.status === 'decreased' && (
                      <span className="inline-flex items-center gap-1 bg-[#ff6b6b]/10 text-[#ff6b6b] border border-[#ff6b6b]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <TrendingDown className="w-3 h-3" />
                        <span>{sector.delta} ({formattedChange})</span>
                      </span>
                    )}

                    {sector.status === 'unchanged' && (
                      <span className="inline-flex items-center gap-1 bg-[#485346]/30 text-[#8cab87] border border-[#485346] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Minus className="w-3 h-3" />
                        <span>Unchanged (0%)</span>
                      </span>
                    )}

                    {sector.status === 'new' && (
                      <span className="inline-flex items-center gap-1 bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <PlusCircle className="w-3 h-3" />
                        <span>New Sector (+{sector.amountB})</span>
                      </span>
                    )}

                    {sector.status === 'discontinued' && (
                      <span className="inline-flex items-center gap-1 bg-[#fb923c]/10 text-[#fb923c] border border-[#fb923c]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
                  <div className="text-xs font-mono text-[#8cab87]">
                    <span>{datasetA.currency}{sector.amountA} {unitA}</span>
                    <span className="mx-1 text-[#485346]">→</span>
                    <span className="font-bold text-[#7fee64]">{datasetB.currency}{sector.amountB} {unitB}</span>
                  </div>
                </div>

                {/* Proportional Bars */}
                <div className="space-y-2 max-w-full overflow-hidden">
                  {/* Bar A */}
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-[10px] font-mono text-[#677d64] text-right shrink-0">
                      {datasetA.year}
                    </span>
                    <div className="flex-1 bg-[#181818] h-3 rounded-full overflow-hidden relative">
                      <div
                        className="bg-[#485346] h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthA}%` }}
                      />
                    </div>
                  </div>

                  {/* Bar B */}
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-[10px] font-mono text-[#7fee64] text-right shrink-0">
                      {datasetB.year}
                    </span>
                    <div className="flex-1 bg-[#181818] h-3 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          sector.status === 'decreased'
                            ? 'bg-[#ff6b6b]'
                            : sector.status === 'discontinued'
                            ? 'bg-[#fb923c]'
                            : 'bg-[#7fee64]'
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
