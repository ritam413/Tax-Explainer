import { NextRequest, NextResponse } from 'next/server';
import { fetchBudgetDataset } from '@/lib/budget/service';
import { getDashboardBudgetCache, setDashboardBudgetCache } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country') || 'India';
  const year = parseInt(searchParams.get('year') || '2026', 10);

  let cached = false;
  let budgetData = await getDashboardBudgetCache(country, year);

  if (budgetData) {
    cached = true;
  } else {
    // Cold fetch from database/service
    budgetData = await fetchBudgetDataset(country, year);
    // Populate Redis cache asynchronously (24h TTL)
    setDashboardBudgetCache(country, year, budgetData).catch((err) => {
      console.warn('Failed to populate Redis cache:', err);
    });
  }

  const endTime = performance.now();
  const loadTimeMs = Math.round(endTime - startTime);

  const response = NextResponse.json({
    data: budgetData,
    cached,
    loadTimeMs,
    timestamp: new Date().toISOString()
  });

  response.headers.set('x-cache', cached ? 'HIT' : 'MISS');
  response.headers.set('x-response-time', `${loadTimeMs}ms`);

  return response;
}
