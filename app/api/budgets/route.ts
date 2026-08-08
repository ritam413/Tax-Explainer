import { NextResponse } from "next/server";
import { fetchBudgetDataset } from "@/lib/budget/service";

export const runtime = "nodejs";

const SECTOR_COLORS = [
  "#ea4335",
  "#7fee64",
  "#4285f4",
  "#fbbc05",
  "#ab47bc",
  "#00acc1",
  "#ff7043",
  "#9e9d24",
  "#ec407a",
  "#26a69a"
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("query") || "";
    const country = searchParams.get("country") || "India";
    const year = parseInt(searchParams.get("year") || "2026", 10);

    const dataset = await fetchBudgetDataset(country, year);
    const queryLower = rawQuery.toLowerCase().trim();

    let sectors = dataset.sectors;

    if (queryLower) {
      sectors = sectors.filter(
        (s) =>
          s.category.toLowerCase().includes(queryLower) ||
          (s.description || "").toLowerCase().includes(queryLower)
      );
    }

    const dataWithColors = sectors.map((s, index) => ({
      id: s.id,
      name: s.category,
      value: s.allocatedAmount,
      priorYearAmount: s.priorYearAmount,
      growthPercentage: s.growthPercentage,
      percentageOfTotal: s.percentageOfTotal,
      description: s.description,
      color: SECTOR_COLORS[index % SECTOR_COLORS.length],
    }));

    return NextResponse.json({
      country: dataset.country,
      year: dataset.year,
      currency: dataset.currency,
      unit: dataset.unit,
      totalBudget: dataset.totalBudget,
      data: dataWithColors,
      query: rawQuery,
    });
  } catch (error) {
    console.error("Error in GET /api/budgets:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
