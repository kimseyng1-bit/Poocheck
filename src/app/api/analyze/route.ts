import { NextRequest, NextResponse } from "next/server";
import { analyzePoopImage } from "@/lib/claude";
import type { AnalyzeResponse } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = await req.json();
    const { imageBase64, mediaType, pet } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "이미지 데이터가 없습니다." }, { status: 400 });
    }
    if (!pet || typeof pet !== "object") {
      return NextResponse.json({ error: "반려견 정보가 없습니다." }, { status: 400 });
    }

    const result = await analyzePoopImage(imageBase64, mediaType ?? "image/jpeg", pet);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    console.error("[/api/analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
