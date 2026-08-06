import { NextRequest } from 'next/server';
import { getUserBookmarks, addBookmark, removeBookmark } from '@/lib/bookmark/service';

export const runtime = 'nodejs';

/**
 * GET /api/bookmark?user_id=xxx
 * Retrieves current user's bookmarks list.
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
            message: 'User authentication required to fetch bookmarks.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bookmarks = await getUserBookmarks(userId);

    return new Response(
      JSON.stringify({
        success: true,
        bookmarks,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('GET /api/bookmark error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while fetching bookmarks.',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/bookmark
 * Adds a new bookmark for an authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, item_type, item_id, title, subtitle, metadata } = body;

    if (!user_id) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Guest users must log in to bookmark items.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!item_type || !item_id || !title) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'item_type, item_id, and title are required.',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bookmark = await addBookmark(user_id, {
      item_type,
      item_id,
      title,
      subtitle: subtitle || '',
      metadata: metadata || {},
    });

    return new Response(
      JSON.stringify({
        success: true,
        bookmark,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('POST /api/bookmark error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while saving the bookmark.',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * DELETE /api/bookmark?user_id=xxx&id=yyy
 * Removes a bookmark.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('user_id');
    let id = searchParams.get('id') || searchParams.get('item_id');

    // Also support JSON body if passed via DELETE request
    if (!userId || !id) {
      try {
        const body = await req.json();
        userId = userId || body.user_id;
        id = id || body.id || body.item_id;
      } catch {
        // No body present, rely on query params
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required to delete bookmarks.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!id) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Bookmark ID or item_id is required.',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const removed = await removeBookmark(userId, id);

    return new Response(
      JSON.stringify({
        success: removed,
        removedId: id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('DELETE /api/bookmark error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while removing the bookmark.',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
