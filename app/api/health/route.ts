import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = (val?: string) => {
    if (!val) return false;
    const lower = val.toLowerCase();
    return !lower.includes('placeholder') && !lower.includes('your-');
  };

  const supabaseConfigured = isConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL) && 
    isConfigured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const geminiConfigured = isConfigured(process.env.GEMINI_API_KEY);
  const redisConfigured = isConfigured(process.env.UPSTASH_REDIS_REST_URL) && 
    isConfigured(process.env.UPSTASH_REDIS_REST_TOKEN);

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: supabaseConfigured ? 'configured' : 'placeholder / pending key',
      gemini: geminiConfigured ? 'configured' : 'placeholder / pending key',
      redis: redisConfigured ? 'configured' : 'placeholder / pending key',
    },
    version: '0.1.0'
  });
}
