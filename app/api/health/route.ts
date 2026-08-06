import { NextResponse } from 'next/server';
import { getAIExplanationCache } from '@/lib/redis/client';
import { DEFAULT_INDIA_2026_BUDGET } from '@/lib/budget/service';

export async function GET() {
  const isConfigured = (val?: string) => {
    if (!val) return false;
    const lower = val.toLowerCase();
    return !lower.includes('placeholder') && !lower.includes('your-');
  };

  const supabaseConfigured = isConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL) && 
    isConfigured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const geminiConfigured = isConfigured(process.env.GEMINI_API_KEY);
  const redisConfigured = isConfigured(process.env.UPSTASH_REDIS_REST_URL) && 
    isConfigured(process.env.UPSTASH_REDIS_REST_TOKEN);

  // Check how many AI explanation sectors are pre-warmed in Redis
  let cacheWarmup = { warm: 0, total: 0, status: 'unknown' as string };
  if (redisConfigured) {
    try {
      const sectors = DEFAULT_INDIA_2026_BUDGET.sectors;
      const warmChecks = await Promise.all(
        sectors.map((s) => getAIExplanationCache(s.id, 'v1'))
      );
      const warm = warmChecks.filter(Boolean).length;
      cacheWarmup = {
        warm,
        total: sectors.length,
        status: warm === sectors.length ? 'fully_warm' : warm === 0 ? 'cold' : 'partial',
      };
    } catch {
      cacheWarmup.status = 'error';
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: supabaseConfigured ? 'configured' : 'placeholder / pending key',
      gemini: geminiConfigured ? 'configured' : 'placeholder / pending key',
      redis: redisConfigured ? 'configured' : 'placeholder / pending key',
    },
    cacheWarmup,
    version: '0.1.0'
  });
}

