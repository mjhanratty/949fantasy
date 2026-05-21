import { NextResponse } from "next/server";
import { fetchRapidApiNflTeams } from "@/lib/rapidapi";

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

export async function GET() {
  try {
    const result = await fetchRapidApiNflTeams();

    if (!result.ok) {
      return NextResponse.json(result, { status: 502, headers: corsHeaders });
    }

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown NFL data error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
