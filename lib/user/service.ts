import { UserProfile, ThemePreference } from '@/types/user';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCache, setCache } from '@/lib/redis/client';

// Memory store for user profiles when offline or using demo mode
const memoryUserStore = new Map<string, UserProfile>();

// Seed default profile for demo user
const DEMO_USER_PROFILE: UserProfile = {
  id: 'demo_user_2026',
  name: 'Demo Budget Analyst',
  email: 'demo.analyst@txexpliner.org',
  country: 'India',
  profession: 'Senior Economic Analyst',
  theme_preference: 'dark',
  created_at: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  updated_at: new Date().toISOString(),
};

memoryUserStore.set('demo_user_2026', DEMO_USER_PROFILE);

/**
 * Retrieves a user profile by user_id from Redis cache, Supabase DB, or local memory store fallback.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  if (!userId) {
    throw new Error('User ID is required to fetch profile');
  }

  // 1. Try Redis cache
  try {
    const cachedProfile = await getCache<UserProfile>(`user_profile:${userId}`);
    if (cachedProfile && cachedProfile.id) {
      return cachedProfile;
    }
  } catch {
    // Redis unavailable fallback
  }

  // 2. Try Supabase DB
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, country, prof, theme_preference, created_at')
      .eq('id', userId)
      .single();

    if (!error && data) {
      const profile: UserProfile = {
        id: data.id,
        name: data.name || 'Budget Explorer',
        email: data.email || '',
        country: data.country || 'India',
        profession: data.prof || 'Policy Researcher',
        theme_preference: (data.theme_preference === 'light' || data.theme_preference === 'dark') ? data.theme_preference : 'dark',
        created_at: data.created_at,
        updated_at: new Date().toISOString(),
      };

      // Save to memory store and Redis cache
      memoryUserStore.set(userId, profile);
      try {
        await setCache(`user_profile:${userId}`, profile, 86400 * 7); // 7 days TTL
      } catch {}

      return profile;
    }
  } catch {
    // Supabase unavailable fallback
  }

  // 3. Fallback to memory store or return generated default profile
  const existingMemory = memoryUserStore.get(userId);
  if (existingMemory) {
    return existingMemory;
  }

  const defaultProfile: UserProfile = {
    id: userId,
    name: 'Budget Explorer',
    email: `${userId}@txexpliner.org`,
    country: 'India',
    profession: 'Citizen / Researcher',
    theme_preference: 'dark',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryUserStore.set(userId, defaultProfile);
  return defaultProfile;
}

/**
 * Updates a user profile in Supabase DB, Redis cache, and memory store.
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email'>>
): Promise<UserProfile> {
  if (!userId) {
    throw new Error('User ID is required to update profile');
  }

  const currentProfile = await getUserProfile(userId);

  const updatedProfile: UserProfile = {
    ...currentProfile,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // 1. Update memory store
  memoryUserStore.set(userId, updatedProfile);

  // 2. Update Redis cache
  try {
    await setCache(`user_profile:${userId}`, updatedProfile, 86400 * 7);
  } catch {}

  // 3. Update Supabase DB if available
  try {
    const supabase = getSupabaseServerClient();
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.profession !== undefined) dbUpdates.prof = updates.profession;
    if (updates.theme_preference !== undefined) dbUpdates.theme_preference = updates.theme_preference;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId);
    }
  } catch {
    // Supabase offline fallback
  }

  return updatedProfile;
}
