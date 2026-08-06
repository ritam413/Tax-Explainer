/**
 * Next.js Instrumentation Hook
 * ----------------------------
 * Runs once per server process startup (not per request, not per hot-reload module).
 * Triggers AI explanation cache pre-warming in the Node.js runtime only.
 *
 * Docs: https://nextjs.org/docs/app/guides/instrumentation
 */

export async function register() {
  // Only run in the Node.js server runtime (not Edge, not during build)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import to keep it out of the edge bundle
    const { warmAIExplanationCache } = await import('./lib/cache/warmup');

    // Fire-and-forget: don't block server startup.
    // The warmup runs in the background; users get cached responses as sectors complete.
    warmAIExplanationCache().catch((err) => {
      console.error('[instrumentation] Cache warmup error (non-fatal):', err);
    });
  }
}
