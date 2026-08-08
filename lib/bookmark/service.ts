import { BookmarkItem, BookmarkItemType, BookmarkItemMetadata } from '@/types/budget';
import { fetchBudgetDataset } from '@/lib/budget/service';
import { getCache, setCache } from '@/lib/redis/client';

// In-memory fallback cache for bookmarks when Redis is offline
const memoryBookmarkStore = new Map<string, BookmarkItem[]>();

// Pre-seeded demo bookmarks for demo_user_2026
const DEMO_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'bm-sector-sec-defence',
    user_id: 'demo_user_2026',
    item_type: 'sector',
    item_id: 'sec-defence',
    title: 'Defence & Security',
    subtitle: 'India Union Budget 2026 • 12.28% of Total',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    metadata: {
      category: 'Defence & Security',
      allocatedAmount: 6.22,
      priorYearAmount: 5.94,
      growthPercentage: 4.71,
      percentageOfTotal: 12.28,
      country: 'India',
      year: 2026,
      currency: '₹',
      unit: 'Lakh Cr',
      description: 'Includes modern equipment procurement, border infrastructure, and personnel pensions.',
    },
  },
  {
    id: 'bm-sector-sec-transport',
    user_id: 'demo_user_2026',
    item_type: 'sector',
    item_id: 'sec-transport',
    title: 'Transport & Infrastructure',
    subtitle: 'India Union Budget 2026 • 10.76% of Total',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    metadata: {
      category: 'Transport & Infrastructure',
      allocatedAmount: 5.45,
      priorYearAmount: 4.90,
      growthPercentage: 11.22,
      percentageOfTotal: 10.76,
      country: 'India',
      year: 2026,
      currency: '₹',
      unit: 'Lakh Cr',
      description: 'National Highways Authority expansion, Indian Railways modernization, and port corridors.',
    },
  },
  {
    id: 'bm-comparison-compare-2025-2026',
    user_id: 'demo_user_2026',
    item_type: 'comparison',
    item_id: 'compare-india-2025-2026',
    title: 'India 2025 vs India 2026 Budget Comparison',
    subtitle: 'Year-over-Year Delta Analysis • Inflation Adjusted (5%)',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    metadata: {
      countryA: 'India',
      yearA: 2025,
      countryB: 'India',
      yearB: 2026,
      totalDelta: 3.0,
      sectorCount: 9,
      description: 'Comparison showing +6.29% nominal total budget expansion across primary sectors.',
    },
  },
];

// Initialize demo store
memoryBookmarkStore.set('demo_user_2026', DEMO_BOOKMARKS);

/**
 * Validates a bookmark against active budget datasets to mark orphaned/deleted items.
 */
async function enrichBookmarkWithStatus(bookmark: BookmarkItem): Promise<BookmarkItem> {
  if (bookmark.item_type === 'sector') {
    const country = bookmark.metadata.country || 'India';
    const year = bookmark.metadata.year || 2026;
    try {
      const dataset = await fetchBudgetDataset(country, year);
      const sectorExists = dataset.sectors.some((s) => s.id === bookmark.item_id || s.category === bookmark.metadata.category);
      
      if (!sectorExists) {
        return {
          ...bookmark,
          metadata: {
            ...bookmark.metadata,
            isOrphaned: true,
            statusNote: 'Underlying sector data was removed or updated in latest budget snapshot.',
          },
        };
      }
    } catch {
      // Ignore fetch errors
    }
  }

  return bookmark;
}

/**
 * Retrieves all bookmarks for a given user ID.
 */
export async function getUserBookmarks(userId: string): Promise<BookmarkItem[]> {
  if (!userId) return [];

  let bookmarks: BookmarkItem[] | null = null;

  // Try Redis first
  try {
    const redisData = await getCache<BookmarkItem[]>(`user_bookmarks:${userId}`);
    if (redisData && Array.isArray(redisData)) {
      bookmarks = redisData;
    }
  } catch {
    // Redis unavailable
  }

  // Fallback to memory store
  if (!bookmarks) {
    bookmarks = memoryBookmarkStore.get(userId) || [];
  }

  // Enrich with orphaned status check
  const enrichedBookmarks = await Promise.all(bookmarks.map(enrichBookmarkWithStatus));
  return enrichedBookmarks;
}

/**
 * Saves a new bookmark for a user. Prevents duplicates by item_id.
 */
export async function addBookmark(
  userId: string,
  data: {
    item_type: BookmarkItemType;
    item_id: string;
    title: string;
    subtitle?: string;
    metadata?: BookmarkItemMetadata;
  }
): Promise<BookmarkItem> {
  if (!userId) {
    throw new Error('User ID is required to create bookmarks');
  }

  const existingBookmarks = await getUserBookmarks(userId);

  // Duplicate check
  const existing = existingBookmarks.find(
    (bm) => bm.item_id === data.item_id && bm.item_type === data.item_type
  );
  if (existing) {
    return existing;
  }

  const newBookmark: BookmarkItem = {
    id: `bm-${data.item_type}-${data.item_id.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    user_id: userId,
    item_type: data.item_type,
    item_id: data.item_id,
    title: data.title,
    subtitle: data.subtitle || '',
    created_at: new Date().toISOString(),
    metadata: data.metadata || {},
  };

  const updatedBookmarks = [newBookmark, ...existingBookmarks];

  // Update memory store
  memoryBookmarkStore.set(userId, updatedBookmarks);

  // Update Redis cache (30-day TTL)
  try {
    await setCache(`user_bookmarks:${userId}`, updatedBookmarks, 2592000);
  } catch {
    // Redis fallback
  }

  return newBookmark;
}

/**
 * Removes a bookmark for a user.
 */
export async function removeBookmark(userId: string, bookmarkIdOrItemId: string): Promise<boolean> {
  if (!userId) return false;

  const existingBookmarks = await getUserBookmarks(userId);
  const updatedBookmarks = existingBookmarks.filter(
    (bm) => bm.id !== bookmarkIdOrItemId && bm.item_id !== bookmarkIdOrItemId
  );

  const removedCount = existingBookmarks.length - updatedBookmarks.length;

  if (removedCount > 0) {
    memoryBookmarkStore.set(userId, updatedBookmarks);
    try {
      await setCache(`user_bookmarks:${userId}`, updatedBookmarks, 2592000);
    } catch {
      // Redis fallback
    }
    return true;
  }

  return false;
}
