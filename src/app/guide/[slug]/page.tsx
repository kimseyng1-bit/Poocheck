import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapButtons } from "@/components/VetCard";
import { GUIDES, getGuide } from "@/content/guides";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return {};
  const url = `/guide/${guide.slug}`;
  return {
    title: guide.metaTitle,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: guide.metaTitle, description: guide.description },
  };
}

function formatDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const related = guide.related.map(getGuide).filter((g) => g !== undefined);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    inLanguage: "ko",
    datePublished: guide.updated,
    dateModified: guide.updated,
    mainEntityOfPage: `${SITE_URL}/guide/${guide.slug}`,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    citation: guide.sources.map((s) => s.url),
  };

  return (
    <main className="min-h-screen bg-amber-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3">
        <Link href="/guide" className="text-stone-500 hover:text-stone-800 transition text-lg" aria-label="가이드 목록">
          ←
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">💩</span>
          <span className="text-lg font-bold text-stone-800">포푸체크</span>
        </Link>
      </header>

      <article className="max-w-md mx-auto px-4 py-6 space-y-5">
        <div>
          <p className="text-3xl">{guide.emoji}</p>
          <h1 className="text-xl font-bold text-stone-800 mt-2 leading-snug">{guide.title}</h1>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">{guide.description}</p>
        </div>

        {/* 30-second summary */}
        <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 space-y-3">
          <h2 className="text-base font-bold text-red-800">🚨 지금 바로 병원에 연락하세요</h2>
          <ul className="space-y-1.5">
            {guide.urgent.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-stone-700 leading-relaxed">
                <span className="text-red-400 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h2 className="text-base font-bold text-green-800">🏠 지켜봐도 되는 경우</h2>
          <p className="text-sm text-stone-700 mt-2 leading-relaxed">{guide.watch}</p>
        </section>

        {/* Main CTA */}
        <Link
          href="/"
          className="block w-full py-4 rounded-2xl bg-amber-500 text-white text-center font-bold text-base shadow-md hover:bg-amber-600 active:scale-95 transition"
        >
          📷 사진으로 바로 확인해 보기
        </Link>

        {guide.sections.map((section) => (
          <section key={section.heading} className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-stone-800">{section.heading}</h2>
            {section.body && <p className="text-sm text-stone-700 leading-relaxed">{section.body}</p>}
            {section.bullets && (
              <ul className="space-y-1.5">
                {section.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-stone-700 leading-relaxed">
                    <span className="text-amber-500 shrink-0">•</span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="bg-amber-100/60 rounded-2xl p-4 text-sm text-amber-900 leading-relaxed">
          💡 {guide.appRule}
        </section>

        {/* Vet finder */}
        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-stone-800">🏥 가까운 동물병원 찾기</h2>
          <MapButtons query="24시 동물병원" label="🚨 24시 동물병원" primary />
          <MapButtons query="동물병원" label="📍 근처 동물병원" />
          <p className="text-xs text-stone-500">병원마다 진료 시간이 달라요. 출발 전에 전화로 확인하세요.</p>
        </section>

        {related.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-stone-600 px-1">함께 보면 좋은 가이드</h2>
            <div className="grid grid-cols-1 gap-2">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guide/${g.slug}`}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm hover:bg-stone-50 transition"
                >
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-sm text-stone-700">{g.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="space-y-2 text-xs text-stone-500 leading-relaxed pb-4">
          <p className="font-semibold text-stone-600">참고 자료</p>
          <ul className="space-y-1">
            {guide.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <p>
            최종 수정 {formatDate(guide.updated)} ·{" "}
            {guide.reviewedBy ? `감수: ${guide.reviewedBy}` : "위 참고 자료를 바탕으로 정리했으며, 아직 수의사 감수를 거치지 않았어요."}
          </p>
          <p>이 글은 일반적인 정보이며 수의사의 진단을 대체하지 않습니다.</p>
        </footer>
      </article>
    </main>
  );
}
