import { NextRequest } from 'next/server';
import { getUserProfile, updateUserProfile } from '@/lib/user/service';

export const runtime = 'nodejs';

/**
 * GET /api/profile?user_id=xxx
 * Retrieves current user's profile details.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required to fetch profile.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const profile = await getUserProfile(userId);

    return new Response(
      JSON.stringify({
        success: true,
        profile,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('GET /api/profile error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while fetching user profile.',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PATCH /api/profile
 * Updates user profile fields (name, country, profession, theme_preference).
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, name, country, profession, prof, theme_preference } = body;

    if (!user_id) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User ID is required to update profile.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const effectiveProfession = profession !== undefined ? profession : prof;

    // Validate theme_preference if provided
    if (theme_preference && theme_preference !== 'light' && theme_preference !== 'dark') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'theme_preference must be either "light" or "dark".',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updatedProfile = await updateUserProfile(user_id, {
      ...(name !== undefined && { name }),
      ...(country !== undefined && { country }),
      ...(effectiveProfession !== undefined && { profession: effectiveProfession }),
      ...(theme_preference !== undefined && { theme_preference }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        profile: updatedProfile,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('PATCH /api/profile error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating profile.',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
