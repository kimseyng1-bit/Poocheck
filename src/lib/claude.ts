import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisFindings, AnalysisResult, BristolScore, PetProfile } from "@/types";
import { computeVerdict, FINDING_KEYS, FINDINGS } from "@/lib/verdict";
import { recordUsage } from "@/lib/usage";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Thrown when the photo can't be analyzed (not stool, too blurry, etc.).
// The API route turns this into a 422 so the client can ask for a retake.
export class InvalidImageError extends Error {
  constructor(
    public readonly code: "not_stool" | "unclear",
    message: string
  ) {
    super(message);
    this.name = "InvalidImageError";
  }
}

const INVALID_IMAGE_MESSAGES = {
  not_stool: "강아지 배변 사진이 아닌 것 같아요. 배변이 화면 가운데에 잘 보이도록 다시 찍어주세요.",
  unclear: "사진이 흐리거나 어둡거나 너무 멀어서 판단하기 어려워요. 밝은 곳에서 가까이 다시 찍어주세요.",
} as const;

// Structured output schema — guarantees parseable JSON with exactly these fields.
const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "image_check",
    "bristol_score",
    "findings",
    "confidence",
    "confidence_reason",
    "summary",
    "details",
    "advice",
  ],
  properties: {
    image_check: { type: "string", enum: ["ok", "not_stool", "unclear"] },
    bristol_score: { type: "integer", enum: [1, 2, 3, 4, 5, 6, 7] },
    findings: {
      type: "object",
      additionalProperties: false,
      required: FINDING_KEYS,
      properties: Object.fromEntries(FINDING_KEYS.map((k) => [k, { type: "boolean" }])),
    },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    confidence_reason: { type: "string" },
    summary: { type: "string" },
    details: {
      type: "object",
      additionalProperties: false,
      required: ["color", "shape", "foreign_objects"],
      properties: {
        color: { type: "string" },
        shape: { type: "string" },
        foreign_objects: { type: "string" },
      },
    },
    advice: { type: "string" },
  },
};

interface RawOutput extends Omit<AnalysisResult, "level" | "bristol_score" | "confidence" | "confidence_reason"> {
  image_check: "ok" | "not_stool" | "unclear";
  bristol_score: BristolScore;
  findings: AnalysisFindings;
  confidence: "high" | "medium" | "low";
  confidence_reason: string;
}

const FINDINGS_TEXT = FINDING_KEYS.map(
  (k) => `- ${k}: ${FINDINGS[k].prompt} [${FINDINGS[k].level === "red" ? "위험" : "주의"} 소견]`
).join("\n");

function buildPrompt(pet: PetProfile): string {
  const petDesc = `강아지 이름: ${pet.name || "미상"}, 나이: ${pet.age ? `${pet.age}살` : "미상"}, 품종: ${pet.breed || "미상"}`;

  return `당신은 반려견 건강 전문 수의사 AI입니다. 아래 사진을 보고 강아지 배변 상태를 분석해주세요.

반려견 정보: ${petDesc}

## 1단계: 사진 확인 (image_check)
- "ok": 강아지 배변이 판단 가능할 만큼 선명하게 보임
- "not_stool": 배변이 아닌 사진 (사람, 음식, 풍경, 다른 물체 등)
- "unclear": 배변으로 보이지만 흐림·어두움·너무 멀어서 색과 형태를 판단할 수 없음
not_stool 또는 unclear이면 나머지 필드는 형식만 맞춰 간단히 채우세요 (bristol_score는 4, findings는 모두 false, confidence는 "low").

## 2단계: 브리스톨 척도 (bristol_score)
1: 따로 떨어진 딱딱한 덩어리 / 2: 울퉁불퉁한 소시지형 / 3: 표면에 금이 간 소시지형 /
4: 매끄럽고 부드러운 소시지형 / 5: 경계가 뚜렷한 부드러운 덩어리 / 6: 경계가 불분명한 죽 같은 변 / 7: 형태 없는 물설사
사진에 여러 덩어리가 있으면 가장 대표적인 형태를 기준으로 하세요.

## 3단계: 관찰 소견 (findings) — 사진에서 분명히 보일 때만 true
${FINDINGS_TEXT}

## 판정 규칙 (참고)
최종 판정(정상/주의/위험)은 앱이 아래 규칙으로 계산합니다. summary와 advice는 이 규칙에 따른 판정과 어긋나지 않게 쓰세요.
- 위험: 브리스톨 7 또는 위험 소견이 하나라도 true
- 주의: 브리스톨 1·5·6 또는 주의 소견이 하나라도 true
- 정상: 그 외 (브리스톨 2~4이고 소견이 모두 false) — 이 경우 summary와 advice에서 건강한 배변으로 안내하세요.

## 4단계: 신뢰도 (confidence)
사진 품질(조명, 초점, 거리, 각도)과 판단의 확실성을 기준으로 high/medium/low를 고르고,
confidence_reason에 이유를 한 문장으로 쓰세요 (예: "조명이 밝고 형태가 선명해 판단이 확실합니다.").

## 작성 규칙
- summary: 한 문장으로 된 종합 판정
- details.color / shape / foreign_objects: 각각 관찰 결과와 의미
- advice: 보호자가 취해야 할 다음 행동 (1~2문장)
- 배변 후 바깥에서 닿은 물체(변에 꽂힌 막대·깃발, 얹힌 나뭇잎·흙, 주변 바닥·표지판 등)는 이물질로 판단하지 말고, details.foreign_objects에도 "배변 속 이물은 없음"으로 쓰세요. 필요하면 바깥 물체가 있다는 점만 짧게 덧붙이세요.
- 모든 문장은 한국어 존댓말로 쓰세요.`;
}

export async function analyzePoopImage(
  imageBase64: string,
  mediaType: string,
  pet: PetProfile
): Promise<AnalysisResult> {
  const validMediaTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ] as const;
  type ValidMediaType = (typeof validMediaTypes)[number];

  const safeMediaType: ValidMediaType = validMediaTypes.includes(
    mediaType as ValidMediaType
  )
    ? (mediaType as ValidMediaType)
    : "image/jpeg";

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5", // keep MODEL_PRICE_PER_MTOK in usage.ts in sync
    max_tokens: 2048,
    // Same photo → same verdict as far as possible.
    temperature: 0,
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: safeMediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: buildPrompt(pet),
          },
        ],
      },
    ],
  });

  await recordUsage(message.usage);

  if (message.stop_reason === "refusal") {
    throw new Error("이 사진은 분석할 수 없어요. 다른 사진으로 다시 시도해주세요.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new Error("분석 응답이 잘렸어요. 잠시 후 다시 시도해주세요.");
  }

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude로부터 텍스트 응답을 받지 못했습니다.");
  }

  let parsed: RawOutput;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw new Error(`응답 파싱 실패: ${textBlock.text}`);
  }

  if (parsed.image_check !== "ok") {
    throw new InvalidImageError(parsed.image_check, INVALID_IMAGE_MESSAGES[parsed.image_check]);
  }

  const { level, reasons } = computeVerdict(parsed.bristol_score, parsed.findings);

  return {
    level,
    level_reasons: reasons,
    bristol_score: parsed.bristol_score,
    confidence: parsed.confidence,
    confidence_reason: parsed.confidence_reason,
    summary: parsed.summary,
    details: parsed.details,
    advice: parsed.advice,
  };
}
