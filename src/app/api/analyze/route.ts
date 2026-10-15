import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { analyzePoopImage, InvalidImageError } from "@/lib/claude";
import { consumeAnalysis, LIMITS, recordStat, type LimitReason } from "@/lib/usage";
import type { AnalyzeResponse } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LIMIT_MESSAGES: Record<LimitReason, string> = {
  device: `오늘 분석 가능 횟수(${LIMITS.perDevice}회)를 모두 사용했어요. 내일 다시 이용해주세요.`,
  ip: "같은 네트워크에서 오늘 분석 요청이 너무 많았어요. 내일 다시 이용해주세요.",
  global: "오늘 이용량이 많아 분석을 잠시 멈췄어요. 내일 다시 이용해주세요.",
};

// The client sends a JPEG with a 1024px long edge (a few hundred KB). Anything
// far larger skipped that compression and would cost more image tokens.
const MAX_IMAGE_BASE64_CHARS = 2_000_000; // ~1.5 MB decoded

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || req.headers.get("x-real-ip") || null;
}

function deviceId(req: NextRequest) {
  const id = req.headers.get("x-device-id");
  return id && /^[A-Za-z0-9-]{8,64}$/.test(id) ? id : null;
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = await req.json();
    const { imageBase64, mediaType, pet } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "이미지 데이터가 없습니다." }, { status: 400 });
    }
    if (imageBase64.length > MAX_IMAGE_BASE64_CHARS) {
      return NextResponse.json(
        { error: "사진 용량이 너무 커요. 페이지를 새로고침한 뒤 다시 올려주세요." },
        { status: 413 }
      );
    }
    if (!pet || typeof pet !== "object") {
      return NextResponse.json({ error: "반려견 정보가 없습니다." }, { status: 400 });
    }

    const quota = await consumeAnalysis(deviceId(req), clientIp(req));
    if (!quota.ok) {
      await recordStat(`limited_${quota.reason}`);
      return NextResponse.json({ error: LIMIT_MESSAGES[quota.reason], code: "rate_limited" }, { status: 429 });
    }

    const result = await analyzePoopImage(imageBase64, mediaType ?? "image/jpeg", pet);
    await Promise.all([recordStat("analyzed"), recordStat(result.level)]);
    return NextResponse.json({ result, remaining: quota.remaining });
  } catch (err) {
    if (err instanceof InvalidImageError) {
      await recordStat(err.code);
      return NextResponse.json({ error: err.message, code: err.code }, { status: 422 });
    }
    await recordStat("error");
    console.error("[/api/analyze]", err instanceof Error ? err.message : err);
    // Raw Anthropic API errors stay in the logs; our own messages are written for users.
    const message =
      err instanceof Error && !(err instanceof Anthropic.APIError)
        ? err.message
        : "분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
