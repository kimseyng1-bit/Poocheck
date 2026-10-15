import { NextRequest, NextResponse } from "next/server";
import { CLIENT_EVENTS, recordStat, type StatField } from "@/lib/usage";

export const runtime = "nodejs";

// Counts a few client-side actions (vet map clicks, summary shares).
// Only allow-listed names are recorded; the body is just { "name": "..." }.
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!CLIENT_EVENTS.includes(name as StatField)) {
      return NextResponse.json({ error: "unknown event" }, { status: 400 });
    }
    await recordStat(name as StatField);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
