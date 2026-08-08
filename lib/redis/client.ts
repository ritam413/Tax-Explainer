import { Redis } from '@upstash/redis';
import { BudgetDataset } from '@/types/budget';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = (url && token && !url.includes('placeholder'))
  ? new Redis({ url, token })
  : null;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.warn(`Redis get cache error for key ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.warn(`Redis set cache error for key ${key}:`, error);
    return false;
  }
}

/**
 * Get dashboard budget dataset from Redis cache with key `dashboard:{country}:{year}`
 */
export async function getDashboardBudgetCache(country: string, year: number): Promise<BudgetDataset | null> {
  const key = `dashboard:${country.toLowerCase()}:${year}`;
  return getCache<BudgetDataset>(key);
}

/**
 * Set dashboard budget dataset in Redis cache with 24-hour TTL (86400s)
 */
export async function setDashboardBudgetCache(country: string, year: number, data: BudgetDataset): Promise<boolean> {
  const key = `dashboard:${country.toLowerCase()}:${year}`;
  return setCache<BudgetDataset>(key, data, 86400);
}

/**
 * Get cached AI explanation text with key `ai_explain:{budget_id}:{version}`
 */
export async function getAIExplanationCache(budgetId: string, version: string = 'v1'): Promise<string | null> {
  const key = `ai_explain:${budgetId}:${version}`;
  return getCache<string>(key);
}

/**
 * Set AI explanation in Redis cache with 7-day TTL (604800s)
 */
export async function setAIExplanationCache(budgetId: string, version: string = 'v1', text: string): Promise<boolean> {
  const key = `ai_explain:${budgetId}:${version}`;
  return setCache<string>(key, text, 604800);
}

// In-memory fallback rate limit store for when Redis is unconfigured/offline
const memoryRateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

/**
 * Enforce rate limiting for AI endpoints: strict limit of 5 requests per hour per client/user.
 */
export async function checkRateLimit(identifier: string, isGuest: boolean): Promise<RateLimitResult> {
  const limit = 5; // Strict 5 requests per hour limit for any single AI endpoint
  const hourWindow = Math.floor(Date.now() / (1000 * 60 * 60));
  const key = `ratelimit:ai:${identifier}:${hourWindow}`;

  if (redis) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, 3600);
      }
      const allowed = current <= limit;
      return {
        allowed,
        remaining: Math.max(0, limit - current),
        limit,
      };
    } catch (error) {
      console.warn('Redis rate limit error, falling back to memory:', error);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memoryRateLimitMap.get(key);

  if (!entry || entry.expiresAt < now) {
    memoryRateLimitMap.set(key, { count: 1, expiresAt: now + 3600 * 1000 });
    return { allowed: true, remaining: limit - 1, limit };
  }

  entry.count += 1;
  const allowed = entry.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    limit,
  };
}

/**
 * Enforce rate limiting for Auth routes (login / sign up): 5 retries per 15 minutes window.
 */
export async function checkAuthRateLimit(identifier: string): Promise<RateLimitResult> {
  const limit = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const windowBucket = Math.floor(Date.now() / windowMs);
  const key = `ratelimit:auth:${identifier}:${windowBucket}`;

  if (redis) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, 900); // 15 minutes in seconds
      }
      const allowed = current <= limit;
      return {
        allowed,
        remaining: Math.max(0, limit - current),
        limit,
      };
    } catch (error) {
      console.warn('Redis auth rate limit error, falling back to memory:', error);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memoryRateLimitMap.get(key);

  if (!entry || entry.expiresAt < now) {
    memoryRateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, limit };
  }

  entry.count += 1;
  const allowed = entry.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    limit,
  };
}

