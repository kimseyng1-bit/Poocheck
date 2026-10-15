import type { Metadata } from "next";
import Link from "next/link";
import { LegalLinks } from "@/components/LegalPage";
import { GUIDES } from "@/content/guides";

export const metadata: Metadata = {
  title: "강아지 변 색깔·모양 가이드",
  description:
    "강아지 혈변, 검은 변, 설사, 점액변, 노란 변, 변비, 기생충까지 — 변 상태별 원인과 병원에 가야 할 때를 정리했어요.",
  alternates: { canonical: "/guide" },
};

// Quick color lookup that links into the detailed guides.
const COLOR_ROWS = [
  { swatch: "bg-amber-800", label: "갈색", meaning: "정상이에요", slug: "stool-color" },
  { swatch: "bg-stone-900", label: "검정·타르", meaning: "위장 출혈 가능 — 진료", slug: "black-stool" },
  { swatch: "bg-red-500", label: "붉은 피", meaning: "장 아래쪽 출혈 가능", slug: "blood" },
  { swatch: "bg-yellow-400", label: "노랑·주황", meaning: "설사·간·담도 문제", slug: "yellow-stool" },
  { swatch: "bg-green-600", label: "초록", meaning: "풀 섭취·담낭 문제", slug: "stool-color" },
  { swatch: "bg-stone-300", label: "회색·흰색", meaning: "췌장·담도 문제 — 진료", slug: "stool-color" },
  { swatch: "bg-stone-50 border border-stone-300", label: "흰 쌀알", meaning: "촌충 마디일 수 있어요", slug: "worms" },
];

export default function GuideIndexPage() {
  return (
    <main className="min-h-screen bg-amber-50">
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-stone-500 hover:text-stone-800 transition text-lg" aria-label="홈으로">
          ←
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">💩</span>
          <span className="text-lg font-bold text-stone-800">포푸체크</span>
        </Link>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-stone-800">강아지 변 색깔·모양 가이드</h1>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            변 상태가 평소와 다를 때, 원인과 병원에 가야 할 때를 확인하세요.
          </p>
        </div>

        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-stone-800">색깔로 빠르게 찾기</h2>
          <ul className="divide-y divide-stone-100">
            {COLOR_ROWS.map((row) => (
              <li key={row.label}>
                <Link href={`/guide/${row.slug}`} className="flex items-center gap-3 py-2.5 hover:bg-stone-50 transition">
                  <span className={`w-5 h-5 rounded-full shrink-0 ${row.swatch}`} />
                  <span className="text-sm font-semibold text-stone-700 w-20 shrink-0">{row.label}</span>
                  <span className="text-sm text-stone-500 flex-1">{row.meaning}</span>
                  <span className="text-stone-300">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/"
          className="block w-full py-4 rounded-2xl bg-amber-500 text-white text-center font-bold text-base shadow-md hover:bg-amber-600 active:scale-95 transition"
        >
          📷 사진으로 바로 확인해 보기
        </Link>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-stone-600 px-1">증상별 가이드</h2>
          <div className="grid grid-cols-1 gap-2">
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/guide/${g.slug}`}
                className="flex gap-3 bg-white rounded-2xl p-4 shadow-sm hover:bg-stone-50 transition"
              >
                <span className="text-2xl shrink-0">{g.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-800">{g.title}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">{g.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-stone-400">
          이 가이드는 일반적인 정보이며 수의사의 진단을 대체하지 않습니다.
        </p>
        <LegalLinks />
      </div>
    </main>
  );
}
