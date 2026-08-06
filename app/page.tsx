'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/nav/Navbar';
import { Sidebar } from '@/components/nav/Sidebar';
import { MobileMenu } from '@/components/nav/MobileMenu';
import { HeroSnapshotCard } from '@/components/dashboard/HeroSnapshotCard';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { SectorBreakdownList } from '@/components/dashboard/SectorBreakdownList';
import { BudgetDataset } from '@/types/budget';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [dataset, setDataset] = useState<BudgetDataset | null>(null);
  const [cached, setCached] = useState<boolean>(false);
  const [loadTimeMs, setLoadTimeMs] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/dashboard?country=India&year=2026');
      const data = await res.json();
      const duration = Math.round(performance.now() - start);

      if (data && data.data) {
        setDataset(data.data);
        setCached(Boolean(data.cached));
        setLoadTimeMs(data.loadTimeMs || duration);
      }
    } catch (err) {
      console.error('Failed to load dashboard budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-inter-variable antialiased pb-16 transition-colors duration-200">
      {/* Global Navigation Shell */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Page Layout Shell (1280px max-width) */}
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 mt-6 flex gap-8 flex-1">
        {/* Left Desktop Sidebar (Hidden on mobile) */}
        <Sidebar />

        {/* Right Content Area */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* Top Banner Notice */}
          <div className="modal-card p-4 flex items-center justify-between gap-4 shadow-md transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[6px] bg-[var(--badge-bg)] text-[var(--accent-pulse)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  Phase 1 Baseline: Union Budget 2026 Snapshot Active
                </span>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Rendered under 2s target limit with Redis caching layer enabled.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--accent-pulse)] text-[12px] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-pulse)]" />
              <span>Verified Dataset</span>
            </div>
          </div>

          {/* Hero Snapshot Card */}
          <HeroSnapshotCard
            dataset={dataset}
            cached={cached}
            loadTimeMs={loadTimeMs}
            loading={loading}
            onRefreshCache={fetchDashboardData}
          />

          {/* Overview Metric Cards */}
          <OverviewCards dataset={dataset} />

          {/* Detailed Sector Breakdown List */}
          <SectorBreakdownList dataset={dataset} loading={loading} />
        </div>
      </main>
    </div>
  );
}
