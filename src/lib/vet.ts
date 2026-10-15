import type { AnalysisResult, HistoryEntry, PetProfile } from "@/types";
import { BRISTOL_LABELS } from "@/lib/verdict";

// Map search links. The map app/site uses the viewer's own location, so this
// app never reads or sends the user's position.
// Kakao format: https://apis.map.kakao.com/web/guide/ ("/link/search/검색어")
export function kakaoMapSearch(query: string) {
  return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
}

export function naverMapSearch(query: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

const LEVEL_TEXT = { green: "정상", yellow: "주의", red: "위험" } as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Plain-text summary an owner can show or send to a vet.
export function buildVetSummary(
  result: AnalysisResult,
  pet: PetProfile,
  analyzedAt: string,
  history: HistoryEntry[]
): string {
  const petInfo = [pet.name, pet.age ? `${pet.age}살` : "", pet.breed].filter(Boolean).join(" / ");
  const lines: Array<string | undefined> = [
    "[포푸체크 배변 분석 요약]",
    petInfo ? `반려견: ${petInfo}` : undefined,
    `분석 시각: ${formatDate(analyzedAt)}`,
    `판정: ${LEVEL_TEXT[result.level]}${result.level_reasons?.length ? ` (${result.level_reasons.join(", ")})` : ""}`,
    result.bristol_score
      ? `브리스톨 척도: ${result.bristol_score}단계 (${BRISTOL_LABELS[result.bristol_score]})`
      : undefined,
    `색상: ${result.details.color}`,
    `형태: ${result.details.shape}`,
    `이물질: ${result.details.foreign_objects}`,
  ];

  const recent = history
    .filter((e) => !pet.name || e.petName === pet.name)
    .slice(0, 7);
  if (recent.length > 1) {
    lines.push("", "최근 기록:");
    for (const e of recent) {
      const bristol = e.result.bristol_score ? `, 브리스톨 ${e.result.bristol_score}` : "";
      lines.push(`- ${formatDate(e.createdAt)}: ${LEVEL_TEXT[e.result.level]}${bristol}`);
    }
  }

  lines.push("", "※ AI 사진 분석 결과로, 수의사 진단을 대체하지 않습니다.");
  // Drop optional lines that were left out; "" entries are intentional blank lines.
  return lines.filter((l): l is string => typeof l === "string").join("\n");
}
