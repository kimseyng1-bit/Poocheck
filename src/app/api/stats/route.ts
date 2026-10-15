import { NextRequest, NextResponse } from "next/server";
import { storeKind } from "@/lib/store";
import { LIMITS, readStats } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Daily usage counters for the owner. Requires STATS_TOKEN, passed as
// "Authorization: Bearer <token>" or ?token=<token>. Hidden (404) when unset.
export async function GET(req: NextRequest) {
  const expected = process.env.STATS_TOKEN;
  if (!expected) return new NextResponse(null, { status: 404 });

  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : req.nextUrl.searchParams.get("token");
  if (token !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 14));
  try {
    return NextResponse.json({ store: storeKind, limits: LIMITS, days: await readStats(days) });
  } catch (err) {
    console.error("[/api/stats]", err);
    return NextResponse.json({ store: storeKind, error: "stats store unavailable" }, { status: 503 });
  }
}
