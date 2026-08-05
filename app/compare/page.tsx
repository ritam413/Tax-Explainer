'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Navbar } from '@/components/nav/Navbar';
import { Sidebar } from '@/components/nav/Sidebar';
import { MobileMenu } from '@/components/nav/MobileMenu';
import { CompareVisualizer } from '@/components/budgets/CompareVisualizer';
import { AiCompareCard } from '@/components/ai/AiCompareCard';
import { ComparisonResponse } from '@/types/budget';

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
    <div className="min-h-screen bg-[#000000] text-[#ddffdc] flex flex-col font-inter-variable antialiased pb-16">
      {/* Global Navigation Shell */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 mt-6 flex gap-8 flex-1">
        <Sidebar />

        <div className="flex-1 space-y-8 min-w-0">
          {/* Header section */}
          <header className="pt-4">
            <Link
              href="/budgets"
              className="inline-flex items-center gap-2 text-[#7fee64] hover:text-[#ddffdc] text-sm font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Budget Explorer
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#ddffdc] mb-3">
              Country & Year Budget Comparison
            </h1>
            <p className="text-sm text-[#8cab87] max-w-3xl">
              Side-by-side analysis of government budget datasets. Select baseline and target datasets to compute category deltas, percentage changes, inflation adjustments, and automated AI diff summaries.
            </p>

            {/* Selectors Bar */}
            <div className="mt-6 bg-[#181818] border border-[#485346] rounded-xl p-5 shadow-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* Dataset A Selector */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#9cbf93]">
                    Baseline Dataset (A)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryA}
                      onChange={(e) => setCountryA(e.target.value)}
                      className="flex-1 bg-[#212525] border border-[#485346] text-[#ddffdc] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#7fee64]"
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
                      className="w-28 bg-[#212525] border border-[#485346] text-[#ddffdc] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#7fee64]"
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
                    className="p-2.5 rounded-full bg-[#212525] border border-[#485346] text-[#8cab87] hover:text-[#7fee64] hover:border-[#7fee64] transition-all"
                    title="Swap Datasets"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Dataset B Selector */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#9cbf93]">
                    Target Dataset (B)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryB}
                      onChange={(e) => setCountryB(e.target.value)}
                      className="flex-1 bg-[#212525] border border-[#485346] text-[#ddffdc] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#7fee64]"
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
                      className="w-28 bg-[#212525] border border-[#485346] text-[#ddffdc] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#7fee64]"
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
              <div className="pt-3 border-t border-[#2a3628] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#677d64] font-semibold">Quick Presets:</span>
                  <button
                    onClick={() => applyPreset('India', 2026, 'India', 2025)}
                    className="bg-[#212525] hover:bg-[#2e3737] text-[#8cab87] hover:text-[#7fee64] px-2.5 py-1 rounded border border-[#485346] transition-colors"
                  >
                    India (2026 vs 2025)
                  </button>
                  <button
                    onClick={() => applyPreset('India', 2026, 'United States', 2026)}
                    className="bg-[#212525] hover:bg-[#2e3737] text-[#8cab87] hover:text-[#7fee64] px-2.5 py-1 rounded border border-[#485346] transition-colors"
                  >
                    India vs US (2026)
                  </button>
                  <button
                    onClick={() => applyPreset('India', 2026, 'India', 2026)}
                    className="bg-[#212525] hover:bg-[#2e3737] text-[#8cab87] hover:text-[#7fee64] px-2.5 py-1 rounded border border-[#485346] transition-colors"
                  >
                    Identical Test (2026 vs 2026)
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[#8cab87]">
                  <label htmlFor="inflation">Est. Inflation Rate:</label>
                  <input
                    id="inflation"
                    type="number"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-16 bg-[#212525] border border-[#485346] text-[#ddffdc] text-xs px-2 py-1 rounded text-center"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </header>

          {/* Identical Dataset Edge-Case Alert Banner */}
          {isIdentical && (
            <div className="bg-[#25231c] border border-[#fb923c]/40 rounded-xl p-4 flex items-start gap-3 text-xs text-[#fb923c]">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-[#ffedd5]">Identical Datasets Selected</h4>
                <p>
                  You are comparing {countryA} ({yearA}) against itself. All category deltas and percentage changes are 0%.
                </p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="bg-[#181818] border border-[#485346] rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-[#7fee64] animate-spin" />
              <p className="text-sm text-[#8cab87]">Fetching datasets and calculating category deltas...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-[#251f1f] border border-[#ff6b6b]/40 rounded-xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-[#ff6b6b] mx-auto" />
              <h3 className="text-lg font-bold text-[#ff6b6b]">Failed to load comparison</h3>
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
