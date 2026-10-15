import type { AnalysisFindings, AnalysisLevel, BristolScore } from "@/types";

// Single source of truth for the green/yellow/red verdict. Claude only reports
// what it sees (Bristol score + yes/no findings); the level is computed here so
// the same observations always produce the same verdict.

// `guide` is the /guide/[slug] page the result screen links to for that finding.
export const FINDINGS: Record<
  keyof AnalysisFindings,
  { label: string; level: AnalysisLevel; prompt: string; guide: string }
> = {
  blood: { label: "혈액", level: "red", prompt: "선홍색 피가 묻어 있거나 섞여 있음", guide: "blood" },
  black_tarry: { label: "검은 타르변", level: "red", prompt: "검고 끈적한 타르 같은 변 (소화기 출혈 의심)", guide: "black-stool" },
  parasites: { label: "기생충", level: "red", prompt: "쌀알·실·국수 모양 등 기생충으로 보이는 것", guide: "worms" },
  foreign_body: { label: "이물", level: "red", prompt: "플라스틱·천·끈·뼛조각 등 삼켰다가 변 속에 섞여 나온 이물이 보임. 변 위에 꽂히거나 얹힌 막대·깃발·나뭇잎·흙처럼 배변 후 바깥에서 닿은 물체와 주변 바닥·표지판은 해당하지 않음", guide: "foreign-object" },
  pale: { label: "회백색 변", level: "red", prompt: "회색·흰색에 가까운 창백한 변", guide: "white-gray-stool" },
  mucus: { label: "점액", level: "yellow", prompt: "투명하거나 젤리 같은 점액이 덮여 있거나 섞여 있음", guide: "mucus" },
  abnormal_color: { label: "비정상 색", level: "yellow", prompt: "노랑·주황·초록 등 갈색 계열이 아닌 색 (검정·회백색은 위 항목으로)", guide: "stool-color" },
  undigested_food: { label: "소화 안 된 음식", level: "yellow", prompt: "소화되지 않은 음식물이 많이 보임", guide: "undigested-food" },
};

export const FINDING_KEYS = Object.keys(FINDINGS) as Array<keyof AnalysisFindings>;

export function levelForBristol(score: BristolScore): AnalysisLevel {
  if (score === 7) return "red";
  if (score === 1 || score === 5 || score === 6) return "yellow";
  return "green";
}

// Guide page for a level reason as produced by computeVerdict (also works for
// reasons stored in older history entries).
export function guideForReason(reason: string): string | undefined {
  const bristol = reason.match(/^브리스톨 (\d)단계/);
  if (bristol) return Number(bristol[1]) === 1 ? "constipation" : "diarrhea";
  return FINDING_KEYS.map((k) => FINDINGS[k]).find((f) => f.label === reason)?.guide;
}

export const NORMAL_GUIDE = "normal-stool";

const RANK: Record<AnalysisLevel, number> = { green: 0, yellow: 1, red: 2 };

export const BRISTOL_LABELS: Record<BristolScore, string> = {
  1: "딱딱한 덩어리",
  2: "울퉁불퉁한 소시지형",
  3: "금이 간 소시지형",
  4: "부드러운 소시지형",
  5: "부드러운 덩어리",
  6: "죽 같은 변",
  7: "물설사",
};

// Returns the verdict plus the reasons that set it (empty for green).
export function computeVerdict(
  bristol: BristolScore,
  findings: AnalysisFindings
): { level: AnalysisLevel; reasons: string[] } {
  const candidates: Array<{ level: AnalysisLevel; label: string }> = [
    { level: levelForBristol(bristol), label: `브리스톨 ${bristol}단계(${BRISTOL_LABELS[bristol]})` },
    ...FINDING_KEYS.filter((k) => findings[k]).map((k) => ({ level: FINDINGS[k].level, label: FINDINGS[k].label })),
  ];
  const level = candidates.reduce<AnalysisLevel>(
    (worst, c) => (RANK[c.level] > RANK[worst] ? c.level : worst),
    "green"
  );
  const reasons = level === "green" ? [] : candidates.filter((c) => c.level === level).map((c) => c.label);
  return { level, reasons };
}
