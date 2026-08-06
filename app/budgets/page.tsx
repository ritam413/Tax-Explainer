"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DebouncedSearch } from "@/components/budgets/DebouncedSearch";
import { DisassembleVisualizer } from "@/components/budgets/DisassembleVisualizer";
import { PieChart, TrendingUp, AlertCircle, Info, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/nav/Navbar";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileMenu } from "@/components/nav/MobileMenu";

import { AiResponseCard } from "@/components/ai/AiResponseCard";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";

interface BudgetCategory {

  id: string;
  name: string;
  value: number;
  color: string;
}

export default function BudgetsPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<BudgetCategory[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [explainedCategoryId, setExplainedCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchBudgets = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/budgets?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed to fetch budgets");
      const json = await res.json();
      setData(json.data);
      
      // Auto-select the first item if there is a search query and results exist
      if (searchQuery.trim() !== "" && json.data.length > 0) {
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
  }, []);

  // Initial load
  useEffect(() => {
    fetchBudgets("");
  }, [fetchBudgets]);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    fetchBudgets(newQuery);
  }, [fetchBudgets]);

  const activeCategory = data.find(c => c.id === activeId);

  const handleSliceClick = (id: string) => {
    setActiveId(id);
    // Note: Hovering/selecting slice disassembles pie but does NOT auto-trigger AI explanation.
    // AI explanation is only triggered when clicking the "Explain with AI" button.
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

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 mt-6 flex gap-8 flex-1">
        <Sidebar />

        <div className="flex-1 space-y-8 min-w-0">
          <header className="mb-10 pt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-lime-pulse hover:text-phosphor-white text-sm font-semibold mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold font-goga mb-4">Federal Budget Explorer</h1>
            <p className="text-gray-400 max-w-2xl mb-8">
              Search for departments or categories to see how the budget breaks down. Hover over a slice to disassemble and select it. Click "Explain with AI" to generate a plain-language explanation.
            </p>
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
                    subtitle={`Federal Budget Category • $${activeCategory.value}B Allocation`}
                    metadata={{
                      category: activeCategory.name,
                      allocatedAmount: activeCategory.value,
                      country: 'India',
                      year: 2026,
                      unit: 'Billion',
                    }}
                    showLabel
                  />
                </div>
                
                <div className="flex-1 space-y-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Total Allocation</p>
                    <p className="text-5xl font-light text-lime-pulse">${activeCategory.value}B</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium border-b border-circuit-border pb-2">Key Programs</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-lime-pulse mt-1 shrink-0" />
                        <span>Operational Funding ({Math.round(activeCategory.value * 0.4)}B)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-lime-pulse mt-1 shrink-0" />
                        <span>Grants & Subsidies ({Math.round(activeCategory.value * 0.35)}B)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-lime-pulse mt-1 shrink-0" />
                        <span>Research & Development ({Math.round(activeCategory.value * 0.25)}B)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Streaming AI Explanation Engine (only rendered when user clicks Explain with AI button) */}
              {explainedCategoryId === activeCategory.id && (
                <AiResponseCard
                  budgetId={activeCategory.id}
                  category={activeCategory.name}
                  allocatedAmount={activeCategory.value}
                  priorYearAmount={Math.round(activeCategory.value * 0.9)}
                  growthPercentage={11.1}
                  country="India"
                  year={2025}
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


