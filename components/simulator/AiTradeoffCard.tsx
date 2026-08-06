'use client';

import React, { useState } from 'react';
import { SimulationState } from '@/types/budget';
import { getSimulationDeltas } from '@/lib/utils/simulator';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface AiTradeoffCardProps {
  state: SimulationState;
}

export const AiTradeoffCard: React.FC<AiTradeoffCardProps> = ({ state }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deltas = getSimulationDeltas(state);
  const hasChanges = deltas.length > 0;

  const handleFetchTradeoff = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: state.country,
          year: state.year,
          currency: state.currency,
          unit: state.unit,
          baselineTotalBudget: state.baselineTotalBudget,
          simulationDelta: deltas,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.replace('data: ', '').trim();
              if (jsonStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setExplanation(accumulatedText);
                }
                if (parsed.error) {
                  setError(parsed.error);
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to explain tradeoff:', err);
      // Isolated error handling: active slider state is unaffected
      setError('AI Tradeoff Explanation unavailable. Your slider state remains intact.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-card p-5 shadow-xl transition-colors duration-200">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--accent-pulse)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] font-goga">AI Tradeoff Analysis</h3>
        </div>

        <button
          onClick={handleFetchTradeoff}
          disabled={isLoading || !hasChanges}
          aria-label={isLoading ? 'Analyzing budget tradeoffs, please wait' : 'Ask AI to explain budget reallocation tradeoffs'}
          aria-busy={isLoading}
          className="lime-pill-cta flex items-center gap-2 px-4 py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Analyzing Tradeoffs...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              Ask AI to Explain Tradeoff
            </>
          )}
        </button>
      </div>

      {!hasChanges && !explanation && (
        <p className="text-xs text-[var(--text-secondary)] italic">
          Drag any sector slider above to modify the baseline budget, then request an AI tradeoff analysis.
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {explanation && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="false"
          aria-busy={isLoading}
          aria-label="AI tradeoff analysis result"
          className="p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] leading-relaxed"
        >
          {explanation}
        </div>
      )}
    </div>
  );
};
