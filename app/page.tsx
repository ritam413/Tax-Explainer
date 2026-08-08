'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/nav/Navbar';
import { Sidebar } from '@/components/nav/Sidebar';
import { MobileMenu } from '@/components/nav/MobileMenu';
import { useAuth } from '@/components/providers/AuthProvider';
import { BudgetDataset } from '@/types/budget';
import { Sparkles, ShieldCheck } from 'lucide-react';

const HeroSnapshotCard = dynamic(
  () => import('@/components/dashboard/HeroSnapshotCard').then((mod) => mod.HeroSnapshotCard),
  {
    loading: () => (
      <div className="modal-card p-6 min-h-[160px] animate-pulse flex items-center justify-center text-xs text-[var(--text-secondary)]">
        Loading snapshot telemetry...
      </div>
    ),
  }
);

const OverviewCards = dynamic(
  () => import('@/components/dashboard/OverviewCards').then((mod) => mod.OverviewCards),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 modal-card animate-pulse rounded-xl" />
        ))}
      </div>
    ),
  }
);

const SectorBreakdownList = dynamic(
  () => import('@/components/dashboard/SectorBreakdownList').then((mod) => mod.SectorBreakdownList),
  {
    loading: () => (
      <div className="modal-card p-6 min-h-[300px] animate-pulse flex items-center justify-center text-xs text-[var(--text-secondary)]">
        Loading sector allocation breakdown...
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const [dataset, setDataset] = useState<BudgetDataset | null>(null);
  const [cached, setCached] = useState<boolean>(false);
  const [loadTimeMs, setLoadTimeMs] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const getTargetCountryAndYear = () => {
    let country = 'India';
    let year = 2026;

    if (isLoggedIn && user?.country) {
      country = user.country;
    } else {
      try {
        const savedGuest = localStorage.getItem('fiscalquant_guest_profile');
        if (savedGuest) {
          const parsed = JSON.parse(savedGuest);
          if (parsed.country) {
            country = parsed.country;
          }
        }
      } catch {}
    }

    return { country, year };
  };

  const fetchDashboardData = async (customCountry?: string, customYear?: number) => {
    setLoading(true);
    const start = performance.now();
    const target = getTargetCountryAndYear();
    const country = customCountry || target.country;
    const year = customYear || target.year;

    try {
      const res = await fetch(`/api/dashboard?country=${encodeURIComponent(country)}&year=${year}`);
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
  }, [user?.country, isLoggedIn]);

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
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-2 flex gap-8 flex-1">
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
                  {dataset?.country || 'India'} Budget {dataset?.year || 2026} Snapshot Active
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
