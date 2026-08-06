import { NextRequest } from 'next/server';
import { getGeminiClient, buildExplanationPrompt, buildTradeoffPrompt } from '@/lib/gemini/client';
import { checkRateLimit, getAIExplanationCache, setAIExplanationCache } from '@/lib/redis/client';

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
      user_id,
      simulationDelta,
      unit,
      currency,
      baselineTotalBudget,
    } = body;

    const isSimulationTradeoff = Array.isArray(simulationDelta) && simulationDelta.length > 0;

    if (!isSimulationTradeoff && (!category || allocatedAmount === undefined)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Category and allocatedAmount (or simulationDelta) are required.',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isGuest = !user_id;
    const identifier =
      user_id ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'guest_client';

    // 1. Rate Limiting Check (20/hr logged in, 5/hr guest)
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

    // 2. Cache Check: Skip cache for simulation tradeoffs (dynamic per user input)
    const version = 'v1';
    const cacheKeyId = isSimulationTradeoff
      ? null
      : budget_id || `${category.toLowerCase().replace(/\s+/g, '_')}_${year || 2025}`;

    if (cacheKeyId) {
      const cachedText = await getAIExplanationCache(cacheKeyId, version);
      if (cachedText) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: cachedText, cached: true })}\n\n`)
            );
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
          },
        });
      }
    }

    // 3. Gemini API Integration
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

    const prompt = isSimulationTradeoff
      ? buildTradeoffPrompt({
          country: country || 'India',
          year: year || 2026,
          currency: currency || '₹',
          unit: unit || 'Lakh Cr',
          baselineTotalBudget: baselineTotalBudget || 50.65,
          deltas: simulationDelta,
        })
      : buildExplanationPrompt({
          category,
          allocatedAmount,
          priorYearAmount,
          growthPercentage,
          country,
          year,
        });

    const encoder = new TextEncoder();

    // 4. SSE Streaming with AbortSignal stream interruption handling
    const responseStream = new ReadableStream({
      async start(controller) {
        let fullText = '';
        try {
          let responseStreamGen;
          try {
            responseStreamGen = await gemini.models.generateContentStream({
              model: 'gemini-2.0-flash-lite',
              contents: prompt,
            });
          } catch (modelErr) {
            console.warn('gemini-2.0-flash-lite fail, falling back to gemini-1.5-flash', modelErr);
            responseStreamGen = await gemini.models.generateContentStream({
              model: 'gemini-1.5-flash',
              contents: prompt,
            });
          }

          for await (const chunk of responseStreamGen) {
            if (req.signal.aborted) {
              console.log('Stream aborted by client navigation or network disconnect');
              controller.close();
              return;
            }

            const chunkText = chunk.text || '';
            if (chunkText) {
              fullText += chunkText;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`)
              );
            }
          }

          if (fullText) {
            await setAIExplanationCache(cacheKeyId, version, fullText);
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          console.error('Gemini SSE streaming error:', err);
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
    console.error('POST /api/ai/explain error:', error);
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
