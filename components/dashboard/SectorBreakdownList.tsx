'use client';

import React, { useState } from 'react';
import { BudgetDataset, SectorBudget } from '@/types/budget';
import { Search, TrendingUp, TrendingDown, Info, ShieldAlert } from 'lucide-react';

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
    <section id="sectors" className="w-full bg-[#181818] rounded-[8px] border border-[#485346] p-6 sm:p-8 shadow-xl">
      {/* Section Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#1f2a33]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#9cbf93]">
            Detailed Allocations
          </span>
          <h2 className="font-manrope text-[24px] sm:text-[28px] font-bold text-[#ddffdc]">
            Top Budget Sectors Breakdown
          </h2>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#677d64]" />
            <input
              type="text"
              placeholder="Search sector or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[14px] bg-[#212525] border border-[#485346] rounded-[8px] text-[#ddffdc] placeholder-[#677d64] focus:outline-none focus:ring-2 focus:ring-[#7fee64] transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-[#212525] p-1 rounded-[8px] text-[12px] font-medium text-[#ddffdc] border border-[#485346]">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-[6px] transition-colors ${
                selectedFilter === 'all' ? 'bg-[#7fee64] text-[#181818] font-bold' : 'text-[#8cab87] hover:text-[#ddffdc]'
              }`}
            >
              All ({sectors.length})
            </button>
            <button
              onClick={() => setSelectedFilter('high-growth')}
              className={`px-3 py-1 rounded-[6px] transition-colors ${
                selectedFilter === 'high-growth' ? 'bg-[#7fee64] text-[#181818] font-bold' : 'text-[#8cab87] hover:text-[#ddffdc]'
              }`}
            >
              High Growth (&gt;10%)
            </button>
            <button
              onClick={() => setSelectedFilter('zero')}
              className={`px-3 py-1 rounded-[6px] transition-colors ${
                selectedFilter === 'zero' ? 'bg-[#7fee64] text-[#181818] font-bold' : 'text-[#8cab87] hover:text-[#ddffdc]'
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
            <div key={i} className="h-20 bg-[#212525] rounded-[8px] animate-pulse" />
          ))}
        </div>
      ) : filteredSectors.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-[#212525]/60 rounded-[8px] my-4 border border-[#485346]">
          <ShieldAlert className="w-8 h-8 text-[#677d64] mx-auto mb-2" />
          <h3 className="text-[16px] font-semibold text-[#ddffdc]">No matching budget sectors found</h3>
          <p className="text-[13px] text-[#8cab87] mt-1 max-w-md mx-auto">
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
                className="group bg-[#212525]/60 rounded-[8px] border border-[#485346] p-4 sm:p-5 hover:border-[#7fee64]/50 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-[2px] bg-[#7fee64] group-hover:shadow-[0_0_10px_rgba(127,238,100,0.6)] transition-all" />
                    <h3 className="font-manrope font-bold text-[16px] sm:text-[18px] text-[#ddffdc]">
                      {sector.category || 'Unassigned Sector'}
                    </h3>

                    {/* Zero Allocation Badge Guard */}
                    {isZeroAllocation && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ffa130]/10 border border-[#ffa130]/30 text-[#ffa130] text-[11px] font-semibold tracking-wide">
                        Zero Allocation ({currency}0)
                      </span>
                    )}
                  </div>

                  {/* Right Amount & YoY */}
                  <div className="flex items-center gap-3">
                    <span className="font-manrope font-bold text-[18px] text-[#ddffdc]">
                      {currency}{amount.toFixed(2)} Lakh Cr
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-full border ${
                        growth >= 0
                          ? 'bg-[#7fee64]/10 text-[#7fee64] border-[#7fee64]/30'
                          : 'bg-[#ff4940]/10 text-[#ff4940] border-[#ff4940]/30'
                      }`}
                    >
                      {growth >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-[#7fee64]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-[#ff4940]" />
                      )}
                      <span>{growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-[#1f2a33] h-2.5 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isZeroAllocation ? 'w-0' : 'bg-[#7fee64] shadow-[0_0_8px_rgba(127,238,100,0.4)]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                  />
                </div>

                {/* Description & Percentage Label */}
                <div className="flex items-center justify-between text-[12px] text-[#8cab87]">
                  <p className="flex items-center gap-1 max-w-xl truncate">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 text-[#677d64]" />
                    <span>{sector.description || 'Sector description placeholder.'}</span>
                  </p>

                  <span className="font-semibold text-[#ddffdc]">
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
