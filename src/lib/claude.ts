import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisLevel, AnalysisResult, BristolScore, PetProfile } from "@/types";

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
    "level",
    "bristol_score",
    "confidence",
    "confidence_reason",
    "summary",
    "details",
    "advice",
  ],
  properties: {
    image_check: { type: "string", enum: ["ok", "not_stool", "unclear"] },
    level: { type: "string", enum: ["green", "yellow", "red"] },
    bristol_score: { type: "integer", enum: [1, 2, 3, 4, 5, 6, 7] },
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
} as const;

interface RawOutput extends Omit<AnalysisResult, "bristol_score" | "confidence" | "confidence_reason"> {
  image_check: "ok" | "not_stool" | "unclear";
  bristol_score: BristolScore;
  confidence: "high" | "medium" | "low";
  confidence_reason: string;
}

function buildPrompt(pet: PetProfile): string {
  const petDesc = `강아지 이름: ${pet.name || "미상"}, 나이: ${pet.age ? `${pet.age}살` : "미상"}, 품종: ${pet.breed || "미상"}`;

  return `당신은 반려견 건강 전문 수의사 AI입니다. 아래 사진을 보고 강아지 배변 상태를 분석해주세요.

반려견 정보: ${petDesc}

## 1단계: 사진 확인 (image_check)
- "ok": 강아지 배변이 판단 가능할 만큼 선명하게 보임
- "not_stool": 배변이 아닌 사진 (사람, 음식, 풍경, 다른 물체 등)
- "unclear": 배변으로 보이지만 흐림·어두움·너무 멀어서 색과 형태를 판단할 수 없음
not_stool 또는 unclear이면 나머지 필드는 형식만 맞춰 간단히 채우세요 (level은 "yellow", bristol_score는 4, confidence는 "low").

## 2단계: 브리스톨 척도 (bristol_score)
1: 따로 떨어진 딱딱한 덩어리 / 2: 울퉁불퉁한 소시지형 / 3: 표면에 금이 간 소시지형 /
4: 매끄럽고 부드러운 소시지형 / 5: 경계가 뚜렷한 부드러운 덩어리 / 6: 경계가 불분명한 죽 같은 변 / 7: 형태 없는 물설사
사진에 여러 덩어리가 있으면 가장 대표적인 형태를 기준으로 하세요.

## 3단계: 판정 기준 (level) — 아래 규칙을 그대로 적용하세요
- red: 혈액(선홍색 피 또는 검고 끈적한 타르변), 기생충, 플라스틱·천 등 이물, 회백색 변, 또는 브리스톨 7
- yellow: 브리스톨 1·5·6, 점액, 노랑·주황·초록 등 비정상 색, 소화되지 않은 음식물이 많이 보임
- green: 브리스톨 2~4이고 갈색 계열이며 위 이상 소견이 없음
여러 항목에 해당하면 더 심각한 쪽을 고르세요.

## 4단계: 신뢰도 (confidence)
사진 품질(조명, 초점, 거리, 각도)과 판단의 확실성을 기준으로 high/medium/low를 고르고,
confidence_reason에 이유를 한 문장으로 쓰세요 (예: "조명이 밝고 형태가 선명해 판단이 확실합니다.").

## 작성 규칙
- summary: 한 문장으로 된 종합 판정
- details.color / shape / foreign_objects: 각각 관찰 결과와 의미
- advice: 보호자가 취해야 할 다음 행동 (1~2문장)
- 사진 속 배변과 관계없는 물체(표지판, 바닥 등)는 이물질로 판단하지 마세요.
- 모든 문장은 한국어 존댓말로 쓰세요.`;
}

const LEVEL_RANK: Record<AnalysisLevel, number> = { green: 0, yellow: 1, red: 2 };

// Deterministic floor so the same Bristol score never yields a milder verdict
// than the rules in the prompt allow.
function minLevelForBristol(score: BristolScore): AnalysisLevel {
  if (score === 7) return "red";
  if (score === 1 || score === 5 || score === 6) return "yellow";
  return "green";
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
    model: "claude-opus-4-5",
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

  const floor = minLevelForBristol(parsed.bristol_score);
  const level = LEVEL_RANK[parsed.level] >= LEVEL_RANK[floor] ? parsed.level : floor;

  return {
    level,
    bristol_score: parsed.bristol_score,
    confidence: parsed.confidence,
    confidence_reason: parsed.confidence_reason,
    summary: parsed.summary,
    details: parsed.details,
    advice: parsed.advice,
  };
}
