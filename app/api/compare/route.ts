import { NextResponse } from 'next/server';
import { fetchBudgetDataset, compareBudgets } from '@/lib/budget/service';
import { getCache, setCache } from '@/lib/redis/client';
import { CompareRequest } from '@/types/budget';

export async function POST(request: Request) {
  try {
    const body: Partial<CompareRequest> = await request.json().catch(() => ({}));

    const countryA = body.countryA || 'India';
    const yearA = Number(body.yearA) || 2026;
    const countryB = body.countryB || 'India';
    const yearB = Number(body.yearB) || 2025;
    const inflationRate = typeof body.inflationRate === 'number' ? body.inflationRate : 5.0;

    const cacheKey = `compare:${countryA.toLowerCase().trim()}:${yearA}:${countryB.toLowerCase().trim()}:${yearB}:${inflationRate}`;

    // 1. Check Redis cache first
    const cachedResult = await getCache<any>(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    // 2. Fetch Datasets A and B
    const [datasetA, datasetB] = await Promise.all([
      fetchBudgetDataset(countryA, yearA),
      fetchBudgetDataset(countryB, yearB),
    ]);

    // 3. Compute Comparison
    const comparisonResult = compareBudgets(datasetA, datasetB, inflationRate);

    // 4. Save to Redis Cache (24-hour TTL)
    await setCache(cacheKey, comparisonResult, 86400);

    return NextResponse.json({
      ...comparisonResult,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error in /api/compare POST:', error);
    return NextResponse.json(
      { error: 'Failed to generate budget comparison.', details: error.message },
      { status: 500 }
    );
  }
}
