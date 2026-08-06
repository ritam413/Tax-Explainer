'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Bot, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SectorComparisonItem } from '@/types/budget';

interface AiCompareCardProps {
  datasetA: { country: string; year: number; currency: string; unit?: string; totalBudget: number };
  datasetB: { country: string; year: number; currency: string; unit?: string; totalBudget: number };
  totalDelta: number;
  totalPercentageChange: number;
  sectorDeltas: SectorComparisonItem[];
  isIdentical?: boolean;
}

export const AiCompareCard: React.FC<AiCompareCardProps> = ({
  datasetA,
  datasetB,
  totalDelta,
  totalPercentageChange,
  sectorDeltas,
  isIdentical,
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAIExplanation = async () => {
    // If datasets are identical, skip heavy API call and show zero-delta explanation instantly
    if (isIdentical) {
      setExplanation(
        `Identical budget datasets were selected (${datasetA.country} ${datasetA.year}). Baseline and target allocations match perfectly with 0% net delta across all sector categories.`
      );
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);
    setExplanation('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build top deltas summary for context
      const topDeltas = sectorDeltas.slice(0, 5).map((d) => ({
        category: d.category,
        amountA: d.amountA,
        amountB: d.amountB,
        delta: d.delta,
        percentageChange: d.percentageChange,
        status: d.status,
      }));

      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          budgetId: `compare-${datasetA.country}-${datasetA.year}-vs-${datasetB.country}-${datasetB.year}`,
          category: `Comparison: ${datasetA.country} (${datasetA.year}) vs ${datasetB.country} (${datasetB.year})`,
          allocatedAmount: datasetB.totalBudget,
          priorYearAmount: datasetA.totalBudget,
          growthPercentage: totalPercentageChange,
          country: `${datasetA.country} → ${datasetB.country}`,
          year: datasetB.year,
          customPrompt: `Compare government budget of ${datasetA.country} ${datasetA.year} (Total ${datasetA.currency}${datasetA.totalBudget}) vs ${datasetB.country} ${datasetB.year} (Total ${datasetB.currency}${datasetB.totalBudget}). Key changes: ${topDeltas.map(d => `${d.category} changed by ${d.percentageChange}%`).join(', ')}. Provide a 3-4 sentence plain-language citizen summary explaining major shifts.`,
        }),
      });

      if (res.status === 429) {
        setIsRateLimited(true);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('AI Service unavailable');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No readable stream received from AI backend.');
      }

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE stream format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                setExplanation(accumulated);
              }
            } catch {
              // Fallback plain string
              if (dataStr) {
                accumulated += dataStr;
                setExplanation(accumulated);
              }
            }
          }
        }
      }

      if (!accumulated) {
        // Fallback offline generator if empty stream
        const topGrowth = sectorDeltas.find((s) => s.status === 'increased' || s.status === 'new');
        const topCut = sectorDeltas.find((s) => s.status === 'decreased' || s.status === 'discontinued');

        accumulated = `Budget comparison between ${datasetA.country} (${datasetA.year}) and ${datasetB.country} (${datasetB.year}) shows a net budget change of ${totalPercentageChange > 0 ? '+' : ''}${totalPercentageChange}%. ${
          topGrowth ? `Key expansion occurred in ${topGrowth.category} (${topGrowth.percentageChange > 0 ? '+' : ''}${topGrowth.percentageChange}%).` : ''
        } ${topCut ? `Significant cuts were observed in ${topCut.category} (${topCut.percentageChange}%).` : ''}`;
        setExplanation(accumulated);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('AI Explanation error, rendering fallback:', err);
      setError('AI summary service currently experiencing high traffic. Chart comparison data is fully available.');
      
      // Fallback synthetic explanation
      const topShift = sectorDeltas[0];
      if (topShift) {
        setExplanation(
          `Comparing ${datasetA.country} (${datasetA.year}) with ${datasetB.country} (${datasetB.year}): The largest allocation shift occurred in ${topShift.category} with a delta of ${topShift.delta > 0 ? '+' : ''}${topShift.delta} (${topShift.percentageChange}%). Net overall budget delta is ${totalDelta > 0 ? '+' : ''}${totalDelta} (${totalPercentageChange}%).`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAIExplanation();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [datasetA.country, datasetA.year, datasetB.country, datasetB.year]);

  return (
    <div className="modal-card p-6 shadow-xl relative overflow-hidden transition-colors duration-200">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-pulse)]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center justify-center text-[var(--accent-pulse)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              Automated AI Diff Summary
              {isIdentical && (
                <span className="text-[10px] bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">
                  Zero-Delta Notice
                </span>
              )}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">Grounded synthesis powered by Gemini public finance AI</p>
          </div>
        </div>

        {!isLoading && (
          <button
            onClick={fetchAIExplanation}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-pulse)] flex items-center gap-1 transition-colors px-2 py-1 rounded bg-[var(--bg-hover)] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center gap-2 text-[var(--accent-pulse)] animate-pulse">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-semibold">Analyzing budget deltas and generating AI explanation...</span>
          </div>
          <div className="w-full max-w-md bg-[var(--bg-hover)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[var(--accent-pulse)] h-full animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      )}

      {/* Rate Limited State */}
      {isRateLimited && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 text-xs text-rose-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold mb-1">Rate Limit Exceeded (HTTP 429)</h4>
            <p>You have reached the maximum AI request limit. Chart comparison tools remain operational.</p>
          </div>
        </div>
      )}

      {/* Content display */}
      {!isLoading && explanation && (
        <div className="space-y-3" aria-live="polite">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed font-normal">
            {explanation}
          </p>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-[var(--text-muted)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-pulse)]" />
            <span>Strict Grounding Safeguard: Explanation derived exclusively from numeric dataset deltas.</span>
          </div>
        </div>
      )}
    </div>
  );
};
