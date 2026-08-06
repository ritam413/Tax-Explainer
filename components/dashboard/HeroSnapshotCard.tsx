'use client';

import React from 'react';
import { BudgetDataset } from '@/types/budget';
import { Zap, Clock, ShieldCheck, TrendingUp, Calendar, Globe } from 'lucide-react';

interface HeroSnapshotCardProps {
  dataset: BudgetDataset | null;
  cached: boolean;
  loadTimeMs: number;
  loading: boolean;
  onRefreshCache?: () => void;
}

export const HeroSnapshotCard: React.FC<HeroSnapshotCardProps> = ({
  dataset,
  cached,
  loadTimeMs,
  loading,
  onRefreshCache,
}) => {
  const totalDisplay = dataset ? `${dataset.currency}${dataset.totalBudget.toFixed(2)} Lakh Cr` : '₹50.65 Lakh Cr';
  const country = dataset?.country || 'India';
  const year = dataset?.year || 2026;

  return (
    <section className="w-full modal-card p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors duration-200">
      {/* Background Accent Halo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-pulse)]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          {/* Eyebrow Label Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-[12px] font-semibold tracking-[0.6px] uppercase">
            <Globe className="w-3.5 h-3.5 text-[var(--accent-pulse)]" />
            {country} Union Budget
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[12px] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            FY {year}-{year + 1 - 2000}
          </span>
        </div>

        {/* Cold vs Warm Cache Benchmark Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${
              cached
                ? 'bg-[var(--badge-bg)] text-[var(--accent-pulse)] border-[var(--badge-border)]'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${cached ? 'text-[var(--accent-pulse)]' : 'text-amber-400'}`} />
            <span>{cached ? 'WARM CACHE (REDIS)' : 'COLD FETCH'}</span>
            <span className="opacity-40">•</span>
            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
            <span>{loadTimeMs > 0 ? `${loadTimeMs}ms` : '<50ms'}</span>
          </div>

          {onRefreshCache && (
            <button
              onClick={onRefreshCache}
              disabled={loading}
              className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline transition-colors cursor-pointer"
            >
              {loading ? 'Refreshing...' : 'Re-benchmark'}
            </button>
          )}
        </div>
      </div>

      {/* Main Headline & Display Numeral */}
      <div className="mb-6">
        <h1 className="text-[12px] uppercase font-bold tracking-[0.6px] text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
          <span>Total Government Expenditure Baseline</span>
          <ShieldCheck className="w-4 h-4 text-[var(--accent-pulse)]" />
        </h1>

        {/* Hero Snapshot Numeral: Manrope 200 Font Weight */}
        <div className="flex flex-wrap items-baseline gap-4">
          <span className="font-manrope font-extralight text-[3.25rem] sm:text-[4.75rem] md:text-[5rem] leading-none text-[var(--text-primary)] tracking-tight">
            {loading ? (
              <span className="animate-pulse opacity-40">₹50.65 Lakh Cr</span>
            ) : (
              totalDisplay
            )}
          </span>

          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--accent-pulse)] text-[13px] font-semibold">
            <TrendingUp className="w-4 h-4 text-[var(--accent-pulse)]" />
            <span>+8.24% YoY Growth</span>
          </div>
        </div>
      </div>

      {/* Subtext Paragraph */}
      <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)] max-w-[680px] leading-relaxed">
        Official government snapshot for the <span className="font-semibold text-[var(--text-primary)]">2026 Union Budget</span>. Highlighting strategic spending across defence modernization, transport corridors, energy transition, and deep-tech initiatives.
      </p>
    </section>
  );
};
