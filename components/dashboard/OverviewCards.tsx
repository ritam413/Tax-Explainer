'use client';

import React from 'react';
import { BudgetDataset } from '@/types/budget';
import { Landmark, Award, TrendingUp, Layers } from 'lucide-react';

interface OverviewCardsProps {
  dataset: BudgetDataset | null;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ dataset }) => {
  const currency = dataset?.currency || '₹';
  const unit = dataset?.unit || 'Lakh Cr';
  const total = dataset?.totalBudget || 50.65;
  const sectors = dataset?.sectors || [];
  
  // Find top sector
  const topSector = [...sectors].sort((a, b) => b.allocatedAmount - a.allocatedAmount)[0];
  const activeSectorsCount = sectors.length;
  
  // Calculate average growth
  const validGrowths = sectors.filter(s => typeof s.growthPercentage === 'number');
  const avgGrowth = validGrowths.length > 0 
    ? (validGrowths.reduce((acc, curr) => acc + (curr.growthPercentage || 0), 0) / validGrowths.length).toFixed(1)
    : '8.2';

  const cardClass = "modal-card p-5 shadow-md hover:border-[var(--accent-pulse)]/50 transition-all duration-200";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Card 1: Total Allocated */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[var(--text-secondary)]">
            Total Allocation
          </span>
          <div className="p-2 rounded-[6px] bg-[var(--badge-bg)] text-[var(--accent-pulse)]">
            <Landmark className="w-4 h-4" />
          </div>
        </div>
        <div className="font-manrope font-semibold text-[24px] text-[var(--text-primary)]">
          {currency}{total.toFixed(2)} {unit}
        </div>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">100% of fiscal budget</p>
      </div>

      {/* Card 2: Highest Sector Allocation */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[var(--text-secondary)]">
            Top Spending Sector
          </span>
          <div className="p-2 rounded-[6px] bg-[var(--badge-bg)] text-amber-500">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="font-manrope font-semibold text-[20px] text-[var(--text-primary)] truncate">
          {topSector ? topSector.category.split('&')[0] : 'Interest Payments'}
        </div>
        <p className="text-[12px] text-[var(--accent-pulse)] font-semibold mt-1">
          {topSector ? `${currency}${topSector.allocatedAmount} ${unit} (${topSector.percentageOfTotal.toFixed(1)}%)` : '23.5% of total'}
        </p>
      </div>

      {/* Card 3: YoY Growth */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[var(--text-secondary)]">
            Avg Sector Growth
          </span>
          <div className="p-2 rounded-[6px] bg-[var(--badge-bg)] text-[var(--accent-pulse)]">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="font-manrope font-semibold text-[24px] text-[var(--text-primary)]">
          +{avgGrowth}%
        </div>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">Compared to FY 2025</p>
      </div>

      {/* Card 4: Active Sectors */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[var(--text-secondary)]">
            Mapped Sectors
          </span>
          <div className="p-2 rounded-[6px] bg-[var(--badge-bg)] text-[var(--accent-pulse)]">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="font-manrope font-semibold text-[24px] text-[var(--text-primary)]">
          {activeSectorsCount} Categories
        </div>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">Parsed & sanitized</p>
      </div>
    </div>
  );
};
