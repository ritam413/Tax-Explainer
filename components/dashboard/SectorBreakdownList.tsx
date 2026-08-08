'use client';

import React, { useState } from 'react';
import { BudgetDataset, SectorBudget } from '@/types/budget';
import { Search, TrendingUp, TrendingDown, Info, ShieldAlert } from 'lucide-react';
import { BookmarkButton } from '@/components/bookmarks/BookmarkButton';

interface SectorBreakdownListProps {
  dataset: BudgetDataset | null;
  loading: boolean;
}


export const SectorBreakdownList: React.FC<SectorBreakdownListProps> = ({ dataset, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high-growth' | 'zero'>('all');

  const currency = dataset?.currency || '₹';
  const totalBudget = dataset?.totalBudget && dataset.totalBudget > 0 ? dataset.totalBudget : 1;
  const sectors: SectorBudget[] = dataset?.sectors || [];

  // Filter sectors
  const filteredSectors = sectors.filter((sector) => {
    const matchesSearch =
      (sector.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sector.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'high-growth') {
      return (sector.growthPercentage || 0) >= 10;
    }
    if (selectedFilter === 'zero') {
      return (sector.allocatedAmount || 0) === 0;
    }
    return true;
  });

  return (
    <section id="sectors" className="w-full modal-card p-6 sm:p-8 shadow-xl transition-colors duration-200">
      {/* Section Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[var(--text-secondary)]">
            Detailed Allocations
          </span>
          <h2 className="font-manrope text-[24px] sm:text-[28px] font-bold text-[var(--text-primary)]">
            Top Budget Sectors Breakdown
          </h2>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search sector or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[14px] bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-[8px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pulse)] transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-[var(--bg-hover)] p-1 rounded-[8px] text-[12px] font-medium text-[var(--text-primary)] border border-[var(--border-color)]">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-[6px] transition-colors cursor-pointer ${
                selectedFilter === 'all' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All ({sectors.length})
            </button>
            <button
              onClick={() => setSelectedFilter('high-growth')}
              className={`px-3 py-1 rounded-[6px] transition-colors cursor-pointer ${
                selectedFilter === 'high-growth' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              High Growth (&gt;10%)
            </button>
            <button
              onClick={() => setSelectedFilter('zero')}
              className={`px-3 py-1 rounded-[6px] transition-colors cursor-pointer ${
                selectedFilter === 'zero' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              $0 / ₹0 Allocations
            </button>
          </div>
        </div>
      </div>

      {/* Sector Items List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[var(--bg-hover)] rounded-[8px] animate-pulse" />
          ))}
        </div>
      ) : filteredSectors.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-[var(--bg-hover)]/60 rounded-[8px] my-4 border border-[var(--border-color)]">
          <ShieldAlert className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
          <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">No matching budget sectors found</h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
            Try adjusting your search criteria or switching filter options to view available sector allocations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSectors.map((sector) => {
            const amount = typeof sector.allocatedAmount === 'number' && !isNaN(sector.allocatedAmount) ? sector.allocatedAmount : 0;
            
            // Safe division-by-zero protection for percentage
            const percentage = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
            const safePercentageStr = isNaN(percentage) || !isFinite(percentage) ? '0.0' : percentage.toFixed(1);
            
            const isZeroAllocation = amount === 0;
            const growth = sector.growthPercentage || 0;

            return (
              <div
                key={sector.id}
                className="group bg-[var(--bg-hover)]/60 rounded-[8px] border border-[var(--border-color)] p-4 sm:p-5 hover:border-[var(--accent-pulse)]/50 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-[2px] bg-[var(--accent-pulse)] group-hover:shadow-[0_0_10px_rgba(127,238,100,0.6)] transition-all" />
                    <h3 className="font-manrope font-bold text-[16px] sm:text-[18px] text-[var(--text-primary)]">
                      {sector.category || 'Unassigned Sector'}
                    </h3>

                    <BookmarkButton
                      itemType="sector"
                      itemId={sector.id}
                      title={sector.category}
                      subtitle={`${dataset?.country || 'India'} ${dataset?.year || 2026} Budget • ${safePercentageStr}% of Total`}
                      metadata={{
                        category: sector.category,
                        allocatedAmount: amount,
                        priorYearAmount: sector.priorYearAmount,
                        growthPercentage: growth,
                        percentageOfTotal: Number(safePercentageStr),
                        country: dataset?.country || 'India',
                        year: dataset?.year || 2026,
                        currency: currency,
                        unit: dataset?.unit || 'Lakh Cr',
                        description: sector.description,
                      }}
                      size="sm"
                    />

                    {/* Zero Allocation Badge Guard */}
                    {isZeroAllocation && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold tracking-wide">
                        Zero Allocation ({currency}0)
                      </span>
                    )}
                  </div>

                  {/* Right Amount & YoY */}
                  <div className="flex items-center gap-3">
                    <span className="font-manrope font-bold text-[18px] text-[var(--text-primary)]">
                      {currency}{amount.toFixed(2)} {dataset?.unit || 'Lakh Cr'}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-full border ${
                        growth >= 0
                          ? 'bg-[var(--badge-bg)] text-[var(--accent-pulse)] border-[var(--badge-border)]'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {growth >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-[var(--accent-pulse)]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      )}
                      <span>{growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-[var(--border-subtle)] h-2.5 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isZeroAllocation ? 'w-0' : 'bg-[var(--accent-pulse)] shadow-[0_0_8px_rgba(127,238,100,0.4)]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                  />
                </div>

                {/* Description & Percentage Label */}
                <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                  <p className="flex items-center gap-1 max-w-xl truncate">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                    <span>{sector.description || 'Sector description placeholder.'}</span>
                  </p>

                  <span className="font-semibold text-[var(--text-primary)]">
                    {safePercentageStr}% of total budget
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
