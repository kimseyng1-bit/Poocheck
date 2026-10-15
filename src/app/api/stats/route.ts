import { NextRequest, NextResponse } from "next/server";
import { storeKind } from "@/lib/store";
import { LIMITS, MODEL_PRICE_PER_MTOK, readStats } from "@/lib/usage";

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
    const rows = await readStats(days);
    return NextResponse.json({ store: storeKind, limits: LIMITS, per_call: perCall(rows), days: rows });
  } catch (err) {
    console.error("[/api/stats]", err);
    return NextResponse.json({ store: storeKind, error: "stats store unavailable" }, { status: 503 });
  }
}

// Average tokens and estimated cost of one Claude call over the period.
function perCall(rows: Awaited<ReturnType<typeof readStats>>) {
  const sum = (f: "claude_calls" | "input_tokens" | "output_tokens") => rows.reduce((n, r) => n + (r[f] ?? 0), 0);
  const calls = sum("claude_calls");
  if (!calls) return null;
  const input = sum("input_tokens") / calls;
  const output = sum("output_tokens") / calls;
  const usd = (input * MODEL_PRICE_PER_MTOK.input + output * MODEL_PRICE_PER_MTOK.output) / 1_000_000;
  return {
    calls,
    avg_input_tokens: Math.round(input),
    avg_output_tokens: Math.round(output),
    est_usd: Number(usd.toFixed(4)),
  };
}
