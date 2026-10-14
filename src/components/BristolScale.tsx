import type { BristolScore } from "@/types";
import { BRISTOL_LABELS, levelForBristol } from "@/lib/verdict";

const STEP_COLOR = { green: "bg-green-400", yellow: "bg-yellow-400", red: "bg-red-400" };

export default function BristolScale({ score }: { score: BristolScore }) {
  return (
    <div className="bg-white/60 rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-stone-400 font-medium">브리스톨 척도</p>
        <p className="text-sm font-semibold text-stone-700">
          {score}단계 · {BRISTOL_LABELS[score]}
        </p>
      </div>
      <div className="flex gap-1">
        {([1, 2, 3, 4, 5, 6, 7] as const).map((step) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={[
                "w-full h-2 rounded-full",
                STEP_COLOR[levelForBristol(step)],
                step === score ? "ring-2 ring-offset-1 ring-stone-700" : "opacity-30",
              ].join(" ")}
            />
            <span className={`text-[10px] ${step === score ? "font-bold text-stone-700" : "text-stone-400"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-stone-400">딱딱함 ← 2~4단계가 이상적 → 묽음</p>
    </div>
  );
}
