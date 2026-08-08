import { NextRequest, NextResponse } from 'next/server';
import { checkAuthRateLimit } from '@/lib/redis/client';

export const runtime = 'nodejs';

/**
 * POST /api/auth
 * Handles authentication attempts (login / signup) with rate limiting (5 retries per 15 minutes).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, email, password } = body;

    const clientIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'anonymous';

    const identifier = email ? `${email.toLowerCase()}_${clientIp}` : clientIp;

    // Enforce 5 retries per 15 minutes auth rate limit
    const rateLimit = await checkAuthRateLimit(identifier);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please try again after 15 minutes.',
          },
        },
        { status: 429 }
      );
    }

    if (action === 'login' || action === 'signup') {
      return NextResponse.json({
        success: true,
        message: `Authentication attempt processed successfully for ${email || 'guest'}.`,
      });
    }

    return NextResponse.json(
      { error: { code: 'INVALID_ACTION', message: 'Action must be login or signup.' } },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'An unexpected server error occurred.' } },
      { status: 500 }
    );
  }
}
