/**
 * Cache Warmup API Route
 * ----------------------
 * GET  /api/cache-warmup         — check current warmup status for all sectors
 * POST /api/cache-warmup         — manually trigger a warmup run (e.g., after deploy)
 *
 * The POST endpoint is protected by the WARMUP_SECRET env var to prevent abuse.
 * Set WARMUP_SECRET=your-secret in .env.local and pass it as a Bearer token:
 *   Authorization: Bearer your-secret
 *
 * Usage examples:
 *   curl https://yourapp.com/api/cache-warmup
 *   curl -X POST -H "Authorization: Bearer your-secret" https://yourapp.com/api/cache-warmup
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAIExplanationCache } from '@/lib/redis/client';
import { DEFAULT_INDIA_2026_BUDGET } from '@/lib/budget/service';

export const runtime = 'nodejs';

const CACHE_VERSION = 'v1';

// ── GET: check cache status per sector ───────────────────────────────────────
export async function GET() {
  const sectors = DEFAULT_INDIA_2026_BUDGET.sectors;

  const statusChecks = await Promise.all(
    sectors.map(async (sector) => {
      const cached = await getAIExplanationCache(sector.id, CACHE_VERSION);
      return {
        sectorId: sector.id,
        category: sector.category,
        allocatedAmount: sector.allocatedAmount,
        cached: Boolean(cached),
        cacheKey: `ai_explain:${sector.id}:${CACHE_VERSION}`,
      };
    })
  );

  const totalSectors = statusChecks.length;
  const warmSectors = statusChecks.filter((s) => s.cached).length;
  const coldSectors = totalSectors - warmSectors;

  return NextResponse.json({
    status: coldSectors === 0 ? 'fully_warm' : warmSectors === 0 ? 'cold' : 'partially_warm',
    summary: {
      total: totalSectors,
      warm: warmSectors,
      cold: coldSectors,
      coveragePercent: Math.round((warmSectors / totalSectors) * 100),
    },
    sectors: statusChecks,
    timestamp: new Date().toISOString(),
  });
}

// ── POST: trigger a warmup run ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const warmupSecret = process.env.WARMUP_SECRET;

  // Require secret in production
  if (process.env.NODE_ENV === 'production' && warmupSecret) {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '').trim();
    if (token !== warmupSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide a valid Authorization: Bearer <WARMUP_SECRET> header.' },
        { status: 401 }
      );
    }
  }

  // Dynamically import to avoid pulling this into the Edge bundle
  const { warmAIExplanationCache } = await import('@/lib/cache/warmup');

  try {
    const result = await warmAIExplanationCache();
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[cache-warmup route] Warmup failed:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Warmup failed unexpectedly.' },
      { status: 500 }
    );
  }
}
