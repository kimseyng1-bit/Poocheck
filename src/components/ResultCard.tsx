import Link from "next/link";
import { guideForReason, NORMAL_GUIDE } from "@/lib/verdict";
import type { AnalysisResult } from "@/types";
import StatusBadge from "./StatusBadge";
import BristolScale from "./BristolScale";

interface Props {
  result: AnalysisResult;
  petName?: string;
}

const LEVEL_BG = {
  green: "from-green-50 to-emerald-50 border-green-200",
  yellow: "from-yellow-50 to-amber-50 border-yellow-200",
  red: "from-red-50 to-rose-50 border-red-200",
};

const DETAIL_ICONS: Record<string, string> = {
  color: "🎨",
  shape: "📏",
  foreign_objects: "🔍",
};

const DETAIL_LABELS: Record<string, string> = {
  color: "색상",
  shape: "형태",
  foreign_objects: "이물질",
};

const CONFIDENCE = {
  high: { label: "높음", className: "bg-green-100 text-green-800" },
  medium: { label: "보통", className: "bg-yellow-100 text-yellow-800" },
  low: { label: "낮음", className: "bg-red-100 text-red-800" },
};

export default function ResultCard({ result, petName }: Props) {
  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-b ${LEVEL_BG[result.level]} p-5 space-y-5 shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">분석 결과</p>
          {petName && (
            <p className="text-base font-semibold text-stone-700 mt-0.5">{petName}의 건강 상태</p>
          )}
        </div>
        <StatusBadge level={result.level} size="lg" />
      </div>

      {/* Summary */}
      <p className="text-stone-800 font-medium leading-relaxed">{result.summary}</p>

      {/* Why this level */}
      {result.level_reasons && (
        <p className="text-xs text-stone-500">
          <span className="font-semibold text-stone-600">판정 근거</span>{" "}
          {result.level_reasons.length > 0
            ? result.level_reasons.join(" · ")
            : "브리스톨 2~4단계, 이상 소견 없음"}
        </p>
      )}
      {result.level_reasons && <GuideLinks reasons={result.level_reasons} />}

      {/* Bristol scale */}
      {result.bristol_score && <BristolScale score={result.bristol_score} />}

      {/* Details */}
      <div className="space-y-2">
        {(Object.keys(result.details) as Array<keyof typeof result.details>).map((key) => (
          <div key={key} className="flex gap-3 bg-white/60 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0">{DETAIL_ICONS[key]}</span>
            <div>
              <p className="text-xs text-stone-400 font-medium">{DETAIL_LABELS[key]}</p>
              <p className="text-sm text-stone-700 mt-0.5">{result.details[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Confidence */}
      {result.confidence && (
        <div className="flex gap-3 items-start text-xs text-stone-500">
          <span className={`shrink-0 px-2 py-0.5 rounded-full font-semibold ${CONFIDENCE[result.confidence].className}`}>
            신뢰도 {CONFIDENCE[result.confidence].label}
          </span>
          {result.confidence_reason && <p className="leading-relaxed">{result.confidence_reason}</p>}
        </div>
      )}

      {/* Advice */}
      <div className="bg-white/70 rounded-xl px-4 py-3 border border-stone-100">
        <p className="text-xs text-stone-400 font-medium mb-1">권고 사항</p>
        <p className="text-sm text-stone-700 leading-relaxed">{result.advice}</p>
      </div>
    </div>
  );
}

// One link per distinct guide behind the verdict; green links to the normal-stool guide.
function GuideLinks({ reasons }: { reasons: string[] }) {
  const links =
    reasons.length === 0
      ? [{ slug: NORMAL_GUIDE, label: "건강한 변 기준" }]
      : reasons.flatMap((label) => {
          const slug = guideForReason(label);
          return slug ? [{ slug, label: label.replace(/\(.*\)$/, "") }] : [];
        });
  const unique = links.filter((l, i) => links.findIndex((x) => x.slug === l.slug) === i);
  if (unique.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 -mt-2">
      {unique.map((l) => (
        <Link
          key={l.slug}
          href={`/guide/${l.slug}`}
          className="text-xs font-medium text-amber-800 bg-white/80 border border-amber-200 rounded-full px-3 py-1 hover:bg-amber-50 transition"
        >
          📖 {l.label} 알아보기 ›
        </Link>
      ))}
    </div>
  );
}
