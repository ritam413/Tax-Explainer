/**
 * Cache Warmup Module
 * -------------------
 * Pre-generates Groq AI explanations for every sector in the default India 2026 budget
 * and stores them in Redis with a 7-day TTL.
 *
 * Called once at server startup via instrumentation.ts, or manually via /api/cache-warmup.
 *
 * Strategy:
 *   - Check each cache key first; only call Groq for cache misses.
 *   - Throttle to 1 request/sec to stay within rate limits on cold starts.
 *   - Safe to call multiple times: no-ops on warm keys.
 */

import { getAIExplanationCache, setAIExplanationCache } from '@/lib/redis/client';
import { buildExplanationPrompt, getGroqClient } from '@/lib/gemini/client';
import { DEFAULT_INDIA_2026_BUDGET } from '@/lib/budget/service';

const CACHE_VERSION = 'v1';
const THROTTLE_MS = 1000; // 1 s between Groq calls to stay within rate limits

export interface WarmupResult {
  total: number;
  warmed: number;
  skipped: number;
  failed: number;
  durationMs: number;
  details: Array<{
    sectorId: string;
    category: string;
    status: 'warmed' | 'skipped' | 'failed';
    error?: string;
  }>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Warm the AI explanation cache for all sectors in the default India 2026 budget.
 * Returns a detailed result object.
 */
export async function warmAIExplanationCache(): Promise<WarmupResult> {
  const startTime = Date.now();
  const result: WarmupResult = {
    total: 0,
    warmed: 0,
    skipped: 0,
    failed: 0,
    durationMs: 0,
    details: [],
  };

  const groq = getGroqClient();
  if (!groq) {
    console.warn('[cache-warmup] GROQ_API_KEY not configured — skipping warmup.');
    return result;
  }

  const sectors = DEFAULT_INDIA_2026_BUDGET.sectors;
  result.total = sectors.length;

  for (const sector of sectors) {
    const cacheKeyId = sector.id;

    // --- 1. Skip if already cached ---
    const existing = await getAIExplanationCache(cacheKeyId, CACHE_VERSION);
    if (existing) {
      result.skipped++;
      result.details.push({ sectorId: sector.id, category: sector.category, status: 'skipped' });
      continue;
    }

    // --- 2. Skip zero-allocation sectors (nothing useful to explain) ---
    if (sector.allocatedAmount === 0) {
      result.skipped++;
      result.details.push({ sectorId: sector.id, category: sector.category, status: 'skipped' });
      continue;
    }

    // --- 3. Generate via Groq ---
    const prompt = buildExplanationPrompt({
      category: sector.category,
      allocatedAmount: sector.allocatedAmount,
      priorYearAmount: sector.priorYearAmount,
      growthPercentage: sector.growthPercentage,
      country: DEFAULT_INDIA_2026_BUDGET.country,
      year: DEFAULT_INDIA_2026_BUDGET.year,
    });

    try {
      let fullText = '';
      const streamGen = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });

      for await (const chunk of streamGen) {
        fullText += chunk.choices[0]?.delta?.content || '';
      }

      if (fullText.trim()) {
        await setAIExplanationCache(cacheKeyId, CACHE_VERSION, fullText.trim());
        result.warmed++;
        result.details.push({ sectorId: sector.id, category: sector.category, status: 'warmed' });
        console.log(`[cache-warmup] ✓ Warmed: ${sector.category}`);
      } else {
        result.failed++;
        result.details.push({
          sectorId: sector.id,
          category: sector.category,
          status: 'failed',
          error: 'Empty response from Groq',
        });
        console.warn(`[cache-warmup] ✗ Empty response for: ${sector.category}`);
      }
    } catch (err: any) {
      result.failed++;
      result.details.push({
        sectorId: sector.id,
        category: sector.category,
        status: 'failed',
        error: err?.message || 'Unknown error',
      });
      console.error(`[cache-warmup] ✗ Failed: ${sector.category} —`, err?.message);
    }

    // Throttle between calls
    await sleep(THROTTLE_MS);
  }

  result.durationMs = Date.now() - startTime;
  console.log(
    `[cache-warmup] Complete — warmed: ${result.warmed}, skipped: ${result.skipped}, failed: ${result.failed}, time: ${result.durationMs}ms`
  );

  return result;
}
