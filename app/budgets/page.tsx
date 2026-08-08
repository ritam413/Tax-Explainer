"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DebouncedSearch } from "@/components/budgets/DebouncedSearch";
import { PieChart, TrendingUp, AlertCircle, Info, ArrowLeft, Sparkles } from "lucide-react";
import { Navbar } from "@/components/nav/Navbar";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileMenu } from "@/components/nav/MobileMenu";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";
import { useAuth } from "@/components/providers/AuthProvider";

const DisassembleVisualizer = dynamic(
  () => import("@/components/budgets/DisassembleVisualizer").then((mod) => mod.DisassembleVisualizer),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center p-8 text-xs text-gray-400 animate-pulse">
        Loading interactive budget breakdown pie visualizer...
      </div>
    ),
  }
);

const AiResponseCard = dynamic(
  () => import("@/components/ai/AiResponseCard").then((mod) => mod.AiResponseCard),
  {
    loading: () => (
      <div className="modal-card p-6 animate-pulse text-xs text-[var(--accent-pulse)] flex items-center justify-center">
        Initializing AI explanation engine...
      </div>
    ),
  }
);

interface BudgetCategory {
  id: string;
  name: string;
  value: number;
  priorYearAmount?: number;
  growthPercentage?: number;
  percentageOfTotal?: number;
  description?: string;
  color: string;
}

export default function BudgetsPage() {
  const { user, isLoggedIn } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("India");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [currency, setCurrency] = useState<string>("₹");
  const [unit, setUnit] = useState<string>("Lakh Cr");

  const [data, setData] = useState<BudgetCategory[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [explainedCategoryId, setExplainedCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize country from user profile or guest storage
  useEffect(() => {
    if (isLoggedIn && user?.country) {
      setSelectedCountry(user.country);
    } else {
      try {
        const savedGuest = localStorage.getItem('fiscalquant_guest_profile');
        if (savedGuest) {
          const parsed = JSON.parse(savedGuest);
          if (parsed.country) {
            setSelectedCountry(parsed.country);
          }
        }
      } catch {}
    }
  }, [isLoggedIn, user?.country]);

  const fetchBudgets = useCallback(async (searchQuery: string, countryParam?: string, yearParam?: number) => {
    setIsLoading(true);
    setError(null);
    const targetCountry = countryParam || selectedCountry;
    const targetYear = yearParam || selectedYear;

    try {
      const res = await fetch(`/api/budgets?query=${encodeURIComponent(searchQuery)}&country=${encodeURIComponent(targetCountry)}&year=${targetYear}`);
      if (!res.ok) throw new Error("Failed to fetch budgets");
      const json = await res.json();
      
      setData(json.data || []);
      if (json.currency) setCurrency(json.currency);
      if (json.unit) setUnit(json.unit);
      
      // Auto-select the first item if results exist
      if (json.data && json.data.length > 0) {
        setActiveId(json.data[0].id);
      } else {
        setActiveId(null);
      }
      setExplainedCategoryId(null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry, selectedYear]);

  // Refetch when country, year, or search query changes
  useEffect(() => {
    fetchBudgets(query, selectedCountry, selectedYear);
  }, [selectedCountry, selectedYear, fetchBudgets]);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    fetchBudgets(newQuery, selectedCountry, selectedYear);
  }, [fetchBudgets, selectedCountry, selectedYear]);

  const activeCategory = data.find(c => c.id === activeId);

  const handleSliceClick = (id: string) => {
    setActiveId(id);
  };

  const handleExplainClick = () => {
    if (activeCategory) {
      setExplainedCategoryId(activeCategory.id);
    }
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
          <header className="mb-8 pt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-lime-pulse hover:text-phosphor-white text-sm font-semibold mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold font-goga tracking-tight">Federal Budget Explorer</h1>
                <p className="text-gray-400 text-sm max-w-xl mt-1">
                  Dissect expenditure allocations for <span className="font-semibold text-lime-pulse">{selectedCountry} ({selectedYear})</span>.
                </p>
              </div>

              {/* Dynamic Country & Year Selectors */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-pulse)] cursor-pointer"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Japan">Japan</option>
                  <option value="Russia">Russia</option>
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-pulse)] cursor-pointer"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
            </div>

            <DebouncedSearch onSearch={handleSearch} isLoading={isLoading} />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visualizer Section */}
        <div className="lg:col-span-7 xl:col-span-8 bg-ground-iron border border-circuit-border rounded-xl p-6 relative flex flex-col items-center justify-center min-h-[500px]">
          {error && (
            <div className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          
          {!error && data.length > 0 && (
            <DisassembleVisualizer 
              data={data} 
              activeId={activeId}
              currency={currency}
              unit={unit}
              onSliceClick={handleSliceClick} 
              onExplainClick={handleExplainClick}
            />
          )}

          {/* Empty State */}
          {!error && data.length === 0 && !isLoading && (
            <div className="text-center flex flex-col items-center justify-center space-y-4 max-w-md">
              <PieChart className="w-16 h-16 text-gray-500 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-300">No results found for "{query}"</h3>
              <p className="text-gray-500 text-sm">
                We couldn't find any budget categories matching your search. Try searching for popular sectors instead:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Defense", "Health", "Education", "Energy"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="px-3 py-1 bg-carbon-veil border border-circuit-border rounded-full text-sm hover:border-lime-pulse hover:text-lime-pulse transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details Panel Section */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          {activeCategory ? (
            <div className="flex flex-col gap-6">
              <div className="bg-ground-iron border border-circuit-border rounded-xl p-6 flex-1 flex flex-col shadow-lg ring-1 ring-lime-pulse/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeCategory.color }} />
                    <h2 className="text-2xl font-bold font-goga">{activeCategory.name}</h2>
                  </div>
                  <BookmarkButton
                    itemType="sector"
                    itemId={activeCategory.id}
                    title={activeCategory.name}
                    subtitle={`${selectedCountry} ${selectedYear} Budget • ${currency}${activeCategory.value} ${unit}`}
                    metadata={{
                      category: activeCategory.name,
                      allocatedAmount: activeCategory.value,
                      priorYearAmount: activeCategory.priorYearAmount,
                      growthPercentage: activeCategory.growthPercentage,
                      percentageOfTotal: activeCategory.percentageOfTotal,
                      country: selectedCountry,
                      year: selectedYear,
                      currency: currency,
                      unit: unit,
                      description: activeCategory.description,
                    }}
                    showLabel
                  />
                </div>
                
                <div className="flex-1 space-y-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Total Allocation</p>
                    <p className="text-5xl font-light text-lime-pulse">{currency}{activeCategory.value} <span className="text-xl font-medium">{unit}</span></p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium border-b border-circuit-border pb-2">Key Programs Breakdown</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-lime-pulse mt-1 shrink-0" />
                        <span>Operational &amp; Infrastructure Funding ({currency}{(activeCategory.value * 0.4).toFixed(2)} {unit})</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-lime-pulse mt-1 shrink-0" />
                        <span>Grants &amp; Citizen Subsidies ({currency}{(activeCategory.value * 0.35).toFixed(2)} {unit})</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-lime-pulse mt-1 shrink-0" />
                        <span>R&amp;D &amp; Modernization ({currency}{(activeCategory.value * 0.25).toFixed(2)} {unit})</span>
                      </li>
                    </ul>

                    {explainedCategoryId !== activeCategory.id && (
                      <button
                        onClick={handleExplainClick}
                        className="lime-pill-cta flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold cursor-pointer shadow-md mt-4"
                      >
                        <Sparkles className="w-4 h-4 text-[var(--accent-text)]" />
                        <span>Explain with AI</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Streaming AI Explanation Engine */}
              {explainedCategoryId === activeCategory.id && (
                <AiResponseCard
                  budgetId={activeCategory.id}
                  category={activeCategory.name}
                  allocatedAmount={activeCategory.value}
                  priorYearAmount={activeCategory.priorYearAmount || Math.round(activeCategory.value * 0.9)}
                  growthPercentage={activeCategory.growthPercentage || 8.2}
                  country={selectedCountry}
                  year={selectedYear}
                  autoFetch={true}
                />
              )}
            </div>
          ) : (
            <div className="bg-ground-iron border border-circuit-border rounded-xl p-6 flex-1 flex flex-col items-center justify-center text-center text-gray-500 opacity-60 border-dashed">
              <Info className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a budget slice or search for a category to view detailed expenditure breakdowns here.</p>
            </div>
          )}
        </div>

          </div>
        </div>
      </main>
    </div>
  );
}
