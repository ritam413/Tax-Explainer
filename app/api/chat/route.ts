import { NextRequest } from 'next/server';
import { getGeminiClient, buildChatPrompt, ChatMessage } from '@/lib/gemini/client';
import { checkRateLimit } from '@/lib/redis/client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      budget_id,
      category,
      allocatedAmount,
      priorYearAmount,
      growthPercentage,
      country,
      year,
      history = [],
      followUpMessage,
      user_id,
    } = body;

    if (!category || allocatedAmount === undefined || !followUpMessage) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Category, allocatedAmount, and followUpMessage are required.',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Enforce max 3 follow-ups per session
    const userFollowUpCount = (history as ChatMessage[]).filter(
      (msg) => msg.role === 'user'
    ).length;

    if (userFollowUpCount >= 3) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'MAX_FOLLOWUPS_REACHED',
            message: 'Maximum 3 follow-up questions per session reached.',
          },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isGuest = !user_id;
    const identifier =
      user_id ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'guest_client';

    // Rate Limit check
    const rateLimit = await checkRateLimit(identifier, isGuest);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Maximum ${rateLimit.limit} requests per hour allowed.`,
          },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const gemini = getGeminiClient();
    if (!gemini) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'AI_SERVICE_UNAVAILABLE',
            message: 'AI explanation currently unavailable',
          },
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildChatPrompt(
      { category, allocatedAmount, priorYearAmount, growthPercentage, country, year },
      history,
      followUpMessage
    );

    const encoder = new TextEncoder();

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          let responseStreamGen;
          try {
            responseStreamGen = await gemini.models.generateContentStream({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
          } catch (modelErr) {
            console.warn('gemini-2.5-flash fail in chat, falling back to gemini-1.5-flash', modelErr);
            responseStreamGen = await gemini.models.generateContentStream({
              model: 'gemini-1.5-flash',
              contents: prompt,
            });
          }

          for await (const chunk of responseStreamGen) {
            if (req.signal.aborted) {
              controller.close();
              return;
            }

            const chunkText = chunk.text || '';
            if (chunkText) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`)
              );
            }
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          console.error('Gemini Chat SSE streaming error:', err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'AI explanation currently unavailable' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('POST /api/chat error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected server error occurred.',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
