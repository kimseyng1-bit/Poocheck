import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, PetProfile } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPrompt(pet: PetProfile): string {
  const petDesc = `강아지 이름: ${pet.name || "미상"}, 나이: ${pet.age ? `${pet.age}살` : "미상"}, 품종: ${pet.breed || "미상"}`;

  return `당신은 반려견 건강 전문 수의사 AI입니다. 아래 강아지의 배변 사진을 분석해주세요.

반려견 정보: ${petDesc}

다음 항목을 면밀히 분석하세요:
1. **색상(color)**: 갈색, 검정, 노랑, 빨강, 흰색, 녹색 등 색상과 의미
2. **형태(shape)**: 굳기(정상/묽음/딱딱함), 형태(소시지형/덩어리/물설사 등)
3. **이물질(foreign_objects)**: 혈액, 점액, 기생충, 음식물 잔여 등 이상 물질 여부

분석 후, 건강 상태를 다음 3단계 중 하나로 판정하세요:
- **green**: 정상 — 건강한 배변, 별도 조치 불필요
- **yellow**: 주의 — 일시적 이상 가능, 2-3일 경과 관찰 필요
- **red**: 위험 — 즉시 또는 빠른 시일 내 수의사 상담 필요

반드시 다음 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트를 포함하지 마세요:
{
  "level": "green" | "yellow" | "red",
  "summary": "한 문장으로 된 종합 판정 (예: '전반적으로 건강한 배변입니다.')",
  "details": {
    "color": "색상 분석 결과",
    "shape": "형태 분석 결과",
    "foreign_objects": "이물질 분석 결과"
  },
  "advice": "보호자가 취해야 할 다음 행동 (1-2문장)"
}`;
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
    max_tokens: 1024,
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

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude로부터 텍스트 응답을 받지 못했습니다.");
  }

  const raw = textBlock.text.trim();
  // Strip markdown code fences if present
  const jsonString = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error(`응답 파싱 실패: ${raw}`);
  }

  if (!["green", "yellow", "red"].includes(parsed.level)) {
    throw new Error(`유효하지 않은 level 값: ${parsed.level}`);
  }

  return parsed;
}
