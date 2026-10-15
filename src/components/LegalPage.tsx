import Link from "next/link";
import { LEGAL_EFFECTIVE_DATE } from "@/lib/site";

// Shared layout for the privacy policy and terms of service.

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
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

      <article className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-stone-800">{title}</h1>
          <p className="text-xs text-stone-500 mt-1">시행일: {LEGAL_EFFECTIVE_DATE}</p>
        </div>
        {children}
        <LegalLinks />
      </article>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm space-y-2 text-sm text-stone-700 leading-relaxed">
      <h2 className="text-base font-bold text-stone-800">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-amber-500 shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalLinks() {
  return (
    <nav className="flex justify-center gap-3 text-xs text-stone-400 py-2">
      <Link href="/terms" className="hover:text-stone-600 underline">
        이용약관
      </Link>
      <span>·</span>
      <Link href="/privacy" className="hover:text-stone-600 underline font-semibold">
        개인정보처리방침
      </Link>
    </nav>
  );
}
