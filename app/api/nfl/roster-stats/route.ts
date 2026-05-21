import { NextResponse } from "next/server";
import { buildDemoRosterStats, type ScoringFormat } from "@/lib/sleeper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3456",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const season = Number(searchParams.get("season") ?? "2025");
  const throughWeek = Number(searchParams.get("throughWeek") ?? "10");
  const scoring = (searchParams.get("scoring") ?? process.env.DEFAULT_SCORING_FORMAT ?? "ppr") as ScoringFormat;

  try {
    const result = await buildDemoRosterStats({
      season: Number.isFinite(season) ? season : 2025,
      throughWeek: Number.isFinite(throughWeek) ? throughWeek : 10,
      scoring: scoring === "half_ppr" || scoring === "std" ? scoring : "ppr",
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 502, headers: corsHeaders });
    }

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown roster stats error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders },
    );
  }
}
