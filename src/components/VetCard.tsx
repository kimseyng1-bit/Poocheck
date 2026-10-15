"use client";

import { useState } from "react";
import type { AnalysisLevel } from "@/types";
import { kakaoMapSearch, naverMapSearch } from "@/lib/vet";
import { trackEvent } from "@/lib/device";

interface Props {
  level: AnalysisLevel;
  summary: string; // text for "수의사에게 보여줄 요약"
}

const EMERGENCY_SIGNS = [
  "혈변이나 검은 변이 계속되거나 양이 많아요",
  "구토를 반복하거나 물도 잘 못 마셔요",
  "기운이 없고 축 처져 있어요",
  "배가 부풀어 오르거나 만지면 아파해요",
  "장난감·뼈 같은 이물질을 삼킨 것 같아요",
];

function MapLink({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("vet_map_click")}
      className={[
        "flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-semibold text-sm shadow-sm active:scale-95 transition",
        primary ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

// Both map apps side by side: owners usually have one or the other installed,
// and each opens its own app (or mobile web) with the viewer's location.
function MapButtons({ query, label, primary }: { query: string; label: string; primary?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className={`text-xs font-semibold ${primary ? "text-red-700" : "text-stone-500"}`}>{label}</p>
      <div className="flex gap-2">
        <MapLink href={kakaoMapSearch(query)} primary={primary}>카카오맵</MapLink>
        <MapLink href={naverMapSearch(query)} primary={primary}>네이버지도</MapLink>
      </div>
    </div>
  );
}

function ShareSummaryButton({ summary }: { summary: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    trackEvent("share_summary");
    if (navigator.share) {
      try {
        await navigator.share({ title: "포푸체크 배변 분석 요약", text: summary });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return; // user closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(summary);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full py-3 rounded-xl bg-white text-stone-700 font-semibold text-sm border border-stone-200 shadow-sm hover:bg-stone-50 active:scale-95 transition"
    >
      {copied ? "✓ 요약을 복사했어요" : "📋 수의사에게 보여줄 요약 공유하기"}
    </button>
  );
}

export default function VetCard({ level, summary }: Props) {
  if (level === "green") return null;

  if (level === "yellow") {
    return (
      <section className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-sm text-stone-600 leading-relaxed">
          2~3일 지켜봐도 계속되거나 기운이 없어 보이면 동물병원 진료를 받아보세요.
        </p>
        <MapButtons query="동물병원" label="📍 근처 동물병원 찾기" />
        <ShareSummaryButton summary={summary} />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 space-y-4 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-red-800">🏥 동물병원 진료를 권해요</h2>
        <p className="text-sm text-red-700 mt-1">아래 증상 중 하나라도 있으면 지금 바로 동물병원에 연락하세요.</p>
      </div>

      <ul className="space-y-1.5">
        {EMERGENCY_SIGNS.map((sign) => (
          <li key={sign} className="flex gap-2 text-sm text-stone-700">
            <span className="text-red-400 shrink-0">•</span>
            {sign}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <MapButtons query="24시 동물병원" label="🚨 24시 동물병원 찾기" primary />
        <MapButtons query="동물병원" label="📍 근처 동물병원 찾기" />
      </div>

      <ShareSummaryButton summary={summary} />

      <p className="text-xs text-stone-500 leading-relaxed">
        병원마다 진료 시간과 응급 진료 여부가 달라요. 출발 전에 꼭 전화로 확인하세요.
      </p>
    </section>
  );
}
