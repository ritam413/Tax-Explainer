import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis if environment variables are present, else we skip caching
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Mock database data
const MOCK_BUDGET_DATA = [
  { id: "1", name: "Defense", value: 842, color: "#485346" },
  { id: "2", name: "Social Security", value: 1215, color: "#677d64" },
  { id: "3", name: "Health & Human Services", value: 1600, color: "#8cab87" },
  { id: "4", name: "Education", value: 238, color: "#9cbf93" },
  { id: "5", name: "Veterans Affairs", value: 300, color: "#aed2a4" },
  { id: "6", name: "Transportation", value: 140, color: "#859984" },
  { id: "7", name: "Energy", value: 45, color: "#697368" },
  { id: "8", name: "Agriculture", value: 200, color: "#3e4a3c" },
];

// Helper to escape regex special characters for safety (in case we used real regex, but we'll use simple JS filtering)
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("query") || "";
    const query = escapeRegExp(rawQuery.toLowerCase());
    
    // We can add filters like year, department type, etc. later
    const filters = searchParams.get("filters") || "none";

    const cacheKey = `search:${query}:${filters}`;

    // 1. Try Cache First
    if (redis) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return NextResponse.json({
          data: cachedData,
          source: "cache",
          query: rawQuery
        });
      }
    }

    // 2. Perform Search (Mocked DB)
    let results = MOCK_BUDGET_DATA;
    if (query.trim() !== "") {
      results = MOCK_BUDGET_DATA.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    // 3. Store in Cache (TTL 3600s = 1 hour)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(results), { ex: 3600 });
    }

    // Simulate DB delay (e.g. 200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({
      data: results,
      source: "db",
      query: rawQuery
    });
  } catch (error) {
    console.error("Error in /api/budgets:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
