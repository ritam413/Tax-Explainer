import { NextRequest } from 'next/server';
import { getGroqClient, getGeminiClient, buildExplanationPrompt, buildTradeoffPrompt } from '@/lib/gemini/client';
import { checkRateLimit, getAIExplanationCache, setAIExplanationCache } from '@/lib/redis/client';

export const runtime = 'nodejs';

/**
 * Generates a deterministic, rule-based fallback trade-off or sector explanation
 * when external LLM APIs (Groq / Gemini) are offline or missing environment API keys.
 */
function generateRuleBasedFallback(body: any, prompt: string): string {
  const { isSimulationTradeoff, simulationDelta, category, allocatedAmount, priorYearAmount, growthPercentage, country, year, currency = '₹', unit = 'Lakh Cr' } = body;

  if (isSimulationTradeoff && Array.isArray(simulationDelta) && simulationDelta.length > 0) {
    const increases = simulationDelta.filter((d: any) => d.deltaPercentage > 0);
    const cuts = simulationDelta.filter((d: any) => d.deltaPercentage < 0);

    const incSummary = increases.map((d: any) => `${d.category || d.sectorId} (+${d.deltaPercentage > 0 ? '+' : ''}${d.deltaPercentage}%)`).join(', ') || 'none';
    const cutSummary = cuts.map((d: any) => `${d.category || d.sectorId} (${d.deltaPercentage}%)`).join(', ') || 'none';

    return `This hypothetical budget reallocation for ${country || 'India'} ${year || 2026} maintains exact zero-sum fiscal neutrality across the total baseline of ${currency}${body.baselineTotalBudget || 50.65} ${unit}. Funding increases directed towards ${incSummary} enhance strategic service capacity. Conversely, corresponding budget reductions in ${cutSummary} require efficiency gains to prevent operational disruption while balancing fiscal priorities.`;
  }

  const growthText = growthPercentage !== undefined && growthPercentage !== 0
    ? ` showing a ${growthPercentage > 0 ? '+' : ''}${growthPercentage}% change compared to the prior year`
    : '';

  return `The ${country || 'India'} ${year || 2026} budget allocates ${currency}${allocatedAmount || 0} ${unit} to ${category || 'this sector'}${growthText}. This allocation supports essential public operations, infrastructure grants, and regional development initiatives under official fiscal policy targets.`;
}

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
      : budget_id || `${(category || 'sector').toLowerCase().replace(/\s+/g, '_')}_${year || 2026}`;

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

    // Build structured prompt payload
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
          currency,
          unit,
        });

    const encoder = new TextEncoder();

    // Helper to stream chunks safely
    const createSSEStream = (fetchChunks: () => AsyncGenerator<string, void, unknown>) => {
      return new ReadableStream({
        async start(controller) {
          let fullText = '';
          try {
            for await (const chunkText of fetchChunks()) {
              if (req.signal.aborted) {
                controller.close();
                return;
              }
              if (chunkText) {
                fullText += chunkText;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
              }
            }

            if (fullText && cacheKeyId) {
              await setAIExplanationCache(cacheKeyId, version, fullText);
            }

            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (err: any) {
            console.warn('Streaming error, falling back to rule-based analysis:', err);
            const fallbackText = generateRuleBasedFallback({ ...body, isSimulationTradeoff }, prompt);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          }
        },
      });
    };

    // 3. Tier 1: Try Groq AI (Llama 3.3 70B)
    const groq = getGroqClient();
    if (groq) {
      const groqGenerator = async function* () {
        const responseStreamGen = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        });

        for await (const chunk of responseStreamGen) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) yield content;
        }
      };

      return new Response(createSSEStream(groqGenerator), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // 4. Tier 2: Try Google Gemini API
    const gemini = getGeminiClient();
    if (gemini) {
      const geminiGenerator = async function* () {
        const responseStreamGen = await gemini.models.generateContentStream({
          model: 'gemini-2.0-flash-lite',
          contents: prompt,
        });

        for await (const chunk of responseStreamGen) {
          const content = chunk.text || '';
          if (content) yield content;
        }
      };

      return new Response(createSSEStream(geminiGenerator), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // 5. Tier 3: Deterministic Rule-Based Fallback Stream (Keys offline / unconfigured)
    const fallbackText = generateRuleBasedFallback({ ...body, isSimulationTradeoff }, prompt);
    const fallbackStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(fallbackStream, {
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
