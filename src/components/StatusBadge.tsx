import type { AnalysisLevel } from "@/types";

interface Props {
  level: AnalysisLevel;
  size?: "sm" | "lg";
}

const CONFIG = {
  green: {
    label: "정상",
    emoji: "🟢",
    bg: "bg-green-100",
    border: "border-green-400",
    text: "text-green-800",
    ring: "ring-green-300",
  },
  yellow: {
    label: "주의",
    emoji: "🟡",
    bg: "bg-yellow-100",
    border: "border-yellow-400",
    text: "text-yellow-800",
    ring: "ring-yellow-300",
  },
  red: {
    label: "위험",
    emoji: "🔴",
    bg: "bg-red-100",
    border: "border-red-400",
    text: "text-red-800",
    ring: "ring-red-300",
  },
};

export default function StatusBadge({ level, size = "sm" }: Props) {
  const c = CONFIG[level];
  const isLg = size === "lg";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-semibold rounded-full border",
        c.bg,
        c.border,
        c.text,
        isLg ? "px-5 py-2 text-lg ring-4 " + c.ring : "px-3 py-1 text-sm",
      ].join(" ")}
    >
      <span>{c.emoji}</span>
      <span>{c.label}</span>
    </span>
  );
}
