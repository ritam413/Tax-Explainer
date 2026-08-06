'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Navbar } from '@/components/nav/Navbar';
import { Sidebar } from '@/components/nav/Sidebar';
import { MobileMenu } from '@/components/nav/MobileMenu';
import { BookmarkButton } from '@/components/bookmarks/BookmarkButton';
import { ComparisonResponse } from '@/types/budget';

const CompareVisualizer = dynamic(
  () => import('@/components/budgets/CompareVisualizer').then((mod) => mod.CompareVisualizer),
  {
    loading: () => (
      <div className="modal-card p-8 text-center text-xs text-[var(--text-secondary)] animate-pulse flex items-center justify-center min-h-[300px]">
        Loading budget comparison visualizer...
      </div>
    ),
  }
);

const AiCompareCard = dynamic(
  () => import('@/components/ai/AiCompareCard').then((mod) => mod.AiCompareCard),
  {
    loading: () => (
      <div className="modal-card p-6 text-center text-xs text-[var(--accent-pulse)] animate-pulse flex items-center justify-center">
        Loading AI difference comparison card...
      </div>
    ),
  }
);


const AVAILABLE_COUNTRIES = ['India', 'United States', 'Japan', 'Russia'];
const AVAILABLE_YEARS = [2026, 2025, 2024];

export default function ComparePage() {
  const [countryA, setCountryA] = useState<string>('India');
  const [yearA, setYearA] = useState<number>(2026);
  const [countryB, setCountryB] = useState<string>('India');
  const [yearB, setYearB] = useState<number>(2025);
  const [inflationRate, setInflationRate] = useState<number>(5.0);

  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const isIdentical =
    countryA.toLowerCase().trim() === countryB.toLowerCase().trim() && yearA === yearB;

  const fetchComparison = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryA,
          yearA,
          countryB,
          yearB,
          inflationRate,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to compute comparison data.');
      }

      const json: ComparisonResponse = await res.json();
      setComparisonData(json);
    } catch (err: any) {
      console.error('Error fetching comparison:', err);
      setError(err.message || 'Failed to load budget comparison data.');
    } finally {
      setIsLoading(false);
    }
  }, [countryA, yearA, countryB, yearB, inflationRate]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  const handleSwap = () => {
    setCountryA(countryB);
    setYearA(yearB);
    setCountryB(countryA);
    setYearB(yearA);
  };

  const applyPreset = (cA: string, yA: number, cB: string, yB: number) => {
    setCountryA(cA);
    setYearA(yA);
    setCountryB(cB);
    setYearB(yB);
  };

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

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-2 flex gap-8 flex-1">
        <Sidebar />

        <div className="flex-1 space-y-8 min-w-0">
          {/* Header section */}
          <header className="pt-4">
            <Link
              href="/budgets"
              className="inline-flex items-center gap-2 text-[var(--accent-pulse)] hover:text-[var(--text-primary)] text-sm font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Budget Explorer
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-3 font-goga">
              Country &amp; Year Budget Comparison
            </h1>

            <p className="text-sm text-[var(--text-secondary)] max-w-3xl">
              Side-by-side analysis of government budget datasets. Select baseline and target datasets to compute category deltas, percentage changes, inflation adjustments, and automated AI diff summaries.
            </p>

            {/* Selectors Bar */}
            <div className="mt-6 modal-card p-5 shadow-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* Dataset A Selector */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Baseline Dataset (A)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryA}
                      onChange={(e) => setCountryA(e.target.value)}
                      className="flex-1 bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-pulse)]"
                    >
                      {AVAILABLE_COUNTRIES.map((c) => (
                        <option key={`a-${c}`} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      value={yearA}
                      onChange={(e) => setYearA(Number(e.target.value))}
                      className="w-28 bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-pulse)]"
                    >
                      {AVAILABLE_YEARS.map((y) => (
                        <option key={`ay-${y}`} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="md:col-span-1 flex justify-center pt-4 md:pt-6">
                  <button
                    onClick={handleSwap}
                    className="p-2.5 rounded-full bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-pulse)] hover:border-[var(--accent-pulse)] transition-all cursor-pointer"
                    title="Swap Datasets"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Dataset B Selector */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Target Dataset (B)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryB}
                      onChange={(e) => setCountryB(e.target.value)}
                      className="flex-1 bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-pulse)]"
                    >
                      {AVAILABLE_COUNTRIES.map((c) => (
                        <option key={`b-${c}`} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      value={yearB}
                      onChange={(e) => setYearB(Number(e.target.value))}
                      className="w-28 bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-pulse)]"
                    >
                      {AVAILABLE_YEARS.map((y) => (
                        <option key={`by-${y}`} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Presets & Inflation Rate Control */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[var(--text-muted)] font-semibold">Quick Presets:</span>
                  <button
                    onClick={() => applyPreset('India', 2026, 'India', 2025)}
                    className="bg-[var(--bg-hover)] hover:bg-[var(--badge-bg)] text-[var(--text-secondary)] hover:text-[var(--accent-pulse)] px-2.5 py-1 rounded border border-[var(--border-color)] transition-colors cursor-pointer"
                  >
                    India (2026 vs 2025)
                  </button>
                  <button
                    onClick={() => applyPreset('India', 2026, 'United States', 2026)}
                    className="bg-[var(--bg-hover)] hover:bg-[var(--badge-bg)] text-[var(--text-secondary)] hover:text-[var(--accent-pulse)] px-2.5 py-1 rounded border border-[var(--border-color)] transition-colors cursor-pointer"
                  >
                    India vs US (2026)
                  </button>
                  <button
                    onClick={() => applyPreset('India', 2026, 'India', 2026)}
                    className="bg-[var(--bg-hover)] hover:bg-[var(--badge-bg)] text-[var(--text-secondary)] hover:text-[var(--accent-pulse)] px-2.5 py-1 rounded border border-[var(--border-color)] transition-colors cursor-pointer"
                  >
                    Identical Test (2026 vs 2026)
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <label htmlFor="inflation">Est. Inflation Rate:</label>
                  <input
                    id="inflation"
                    type="number"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-16 bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs px-2 py-1 rounded text-center"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </header>

          {/* Identical Dataset Edge-Case Alert Banner */}
          {isIdentical && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-400">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-300">Identical Datasets Selected</h4>
                <p>
                  You are comparing {countryA} ({yearA}) against itself. All category deltas and percentage changes are 0%.
                </p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="modal-card p-12 text-center flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-[var(--accent-pulse)] animate-spin" />
              <p className="text-sm text-[var(--text-secondary)]">Fetching datasets and calculating category deltas...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-lg font-bold text-rose-400">Failed to load comparison</h3>
              <p className="text-xs text-[#8cab87] max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchComparison}
                className="bg-[#7fee64] text-[#181818] font-semibold text-xs px-4 py-2 rounded-lg hover:bg-[#9bf387] transition-all"
              >
                Retry Request
              </button>
            </div>
          )}

          {/* Comparison Results */}
          {!isLoading && !error && comparisonData && (
            <div className="space-y-8">
              {/* Header Bar with Bookmark Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#181818] border border-[#485346] rounded-xl">
                <div>
                  <h3 className="font-manrope font-bold text-lg text-white">
                    {comparisonData.datasetA.country} ({comparisonData.datasetA.year}) vs {comparisonData.datasetB.country} ({comparisonData.datasetB.year})
                  </h3>
                  <p className="text-xs text-[#8cab87]">
                    Total budget delta: {comparisonData.totalDelta >= 0 ? '+' : ''}{comparisonData.totalDelta.toFixed(2)} Lakh Cr ({comparisonData.totalPercentageChange >= 0 ? '+' : ''}{comparisonData.totalPercentageChange.toFixed(2)}%)
                  </p>
                </div>
                <BookmarkButton
                  itemType="comparison"
                  itemId={`compare-${comparisonData.datasetA.country.toLowerCase()}-${comparisonData.datasetA.year}-${comparisonData.datasetB.country.toLowerCase()}-${comparisonData.datasetB.year}`}
                  title={`${comparisonData.datasetA.country} ${comparisonData.datasetA.year} vs ${comparisonData.datasetB.country} ${comparisonData.datasetB.year}`}
                  subtitle={`Budget Comparison • ${comparisonData.totalPercentageChange >= 0 ? '+' : ''}${comparisonData.totalPercentageChange.toFixed(1)}% Delta`}
                  metadata={{
                    countryA: comparisonData.datasetA.country,
                    yearA: comparisonData.datasetA.year,
                    countryB: comparisonData.datasetB.country,
                    yearB: comparisonData.datasetB.year,
                    totalDelta: comparisonData.totalDelta,
                    sectorCount: comparisonData.sectorDeltas.length,
                    description: `Comparison between ${comparisonData.datasetA.country} (${comparisonData.datasetA.year}) and ${comparisonData.datasetB.country} (${comparisonData.datasetB.year}).`,
                  }}
                  showLabel
                  size="md"
                />
              </div>

              {/* Automated AI Diff Summary Card */}
              <AiCompareCard
                datasetA={comparisonData.datasetA}
                datasetB={comparisonData.datasetB}
                totalDelta={comparisonData.totalDelta}
                totalPercentageChange={comparisonData.totalPercentageChange}
                sectorDeltas={comparisonData.sectorDeltas}
                isIdentical={comparisonData.isIdentical}
              />

              {/* Side-by-Side Visualizer */}
              <CompareVisualizer
                datasetA={comparisonData.datasetA}
                datasetB={comparisonData.datasetB}
                sectorDeltas={comparisonData.sectorDeltas}
                isIdentical={comparisonData.isIdentical}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
