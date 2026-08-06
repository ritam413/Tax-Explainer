'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BudgetDataset, SimulationState } from '@/types/budget';
import {
  initializeSimulationState,
  reallocateZeroSum,
  enforcePrecision,
} from '@/lib/utils/simulator';
import { SectorSlider } from '@/components/simulator/SectorSlider';
import { SimulatorChart } from '@/components/simulator/SimulatorChart';
import { AiTradeoffCard } from '@/components/simulator/AiTradeoffCard';
import { Navbar } from '@/components/nav/Navbar';
import { Sidebar } from '@/components/nav/Sidebar';
import { MobileMenu } from '@/components/nav/MobileMenu';
import { RefreshCw, RotateCcw, Sliders, Info, Lock } from 'lucide-react';

export default function SimulatorPage() {
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [rawDataset, setRawDataset] = useState<BudgetDataset | null>(null);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const slidersContainerRef = useRef<HTMLDivElement | null>(null);

  // Load dataset baseline via API
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setSelectedCategory(null);
      try {
        const res = await fetch(`/api/dashboard?country=${encodeURIComponent(selectedCountry)}&year=${selectedYear}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setRawDataset(json.data);
            setSimState(initializeSimulationState(json.data));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch dataset from API:', err);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedCountry, selectedYear]);

  const handleAmountChange = (sectorId: string, newAmount: number) => {
    if (!simState) return;
    const nextState = reallocateZeroSum(simState, sectorId, newAmount);
    setSimState(nextState);
  };

  const handleLockToggle = (sectorId: string) => {
    if (!simState) return;
    const updatedSectors = simState.sectors.map((s) =>
      s.id === sectorId ? { ...s, isLocked: !s.isLocked } : s
    );
    setSimState({ ...simState, sectors: updatedSectors });
  };

  const handleReset = () => {
    if (!rawDataset) return;
    setSimState(initializeSimulationState(rawDataset));
    setSelectedCategory(null);
  };

  const handleSectorSelect = (category: string) => {
    setSelectedCategory((prev) => (prev?.toLowerCase() === category.toLowerCase() ? null : category));
    if (slidersContainerRef.current) {
      slidersContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reorder sectors for display so selected sector is pulled up to the very top
  const displayedSectors = React.useMemo(() => {
    if (!simState) return [];
    if (!selectedCategory) return simState.sectors;

    const target = simState.sectors.find(
      (s) => s.category.toLowerCase() === selectedCategory.toLowerCase()
    );
    if (!target) return simState.sectors;

    const others = simState.sectors.filter((s) => s.id !== target.id);
    return [target, ...others];
  }, [simState, selectedCategory]);

  const activeLocks = simState?.sectors.filter((s) => s.isLocked).length || 0;

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

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 mt-6 flex gap-8 flex-1">
        <Sidebar />

        <div className="flex-1 space-y-8 min-w-0">
          {loading || !simState ? (
            <div className="modal-card p-12 text-center flex items-center justify-center gap-3 text-[var(--accent-pulse)] font-mono">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading Budget Reallocation Simulator...
            </div>
          ) : (
            <>

      {/* Header & Controls with Flush Inline Readouts */}
      <header className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sliders className="w-5 h-5 text-[var(--accent-pulse)]" />
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-goga">
                Budget Reallocation Simulator
              </h1>

              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--badge-bg)] text-[var(--accent-pulse)] border border-[var(--badge-border)]">
                Hypothetical
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Drag sector sliders to explore real-time zero-sum fiscal tradeoffs across government allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dataset selectors */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-pulse)] cursor-pointer"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="Japan">Japan</option>
              <option value="Russia">Russia</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-pulse)] cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>

            {/* Reset button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-colors cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Baseline
            </button>
          </div>
        </div>

        {/* Flush Inline Readout Strip Directly Under Divider */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-hover)]/40 border border-[var(--border-subtle)] rounded-lg px-4 py-2 transition-colors duration-200 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Total Baseline:</span>
            <span className="font-bold text-[var(--text-primary)]">
              {simState.currency}{simState.baselineTotalBudget.toFixed(2)} {simState.unit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Simulated Sum (Zero-Sum):</span>
            <span className="font-bold text-[var(--accent-pulse)]">
              {simState.currency}{simState.simulatedTotalBudget.toFixed(2)} {simState.unit} (100.00%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Active Sector Locks:</span>
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              {activeLocks} of {simState.sectors.length} Locked
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Column */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-goga flex items-center gap-2">
              <span>Sector Controls</span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[10px] font-sans font-normal text-[var(--accent-pulse)] hover:underline cursor-pointer"
                >
                  (Reset order)
                </button>
              )}
            </h2>
            <span className="text-xs text-[var(--text-secondary)]">Click chart bars to pull up sector</span>
          </div>

          <div
            ref={slidersContainerRef}
            className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1 scroll-smooth"
          >
            {displayedSectors.map((sector) => (
              <SectorSlider
                key={sector.id}
                sector={sector}
                currency={simState.currency}
                unit={simState.unit}
                maxBudget={simState.baselineTotalBudget}
                onAmountChange={handleAmountChange}
                onLockToggle={handleLockToggle}
                isHighlighted={selectedCategory?.toLowerCase() === sector.category.toLowerCase()}
                onSelect={() => handleSectorSelect(sector.category)}
              />
            ))}
          </div>
        </div>

        {/* Chart & AI Column */}
        <div className="lg:col-span-6 space-y-6">
          <SimulatorChart
            state={simState}
            onSectorSelect={handleSectorSelect}
            selectedCategory={selectedCategory}
          />
          <AiTradeoffCard state={simState} />
        </div>
      </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

