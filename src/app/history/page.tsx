"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import StatusBadge from "@/components/StatusBadge";
import { clearHistory, deleteHistoryEntry, loadHistory } from "@/lib/history";
import { kakaoMapSearch } from "@/lib/vet";
import type { AnalysisLevel, HistoryEntry } from "@/types";

const DOT_COLOR: Record<AnalysisLevel, string> = {
  green: "bg-green-400",
  yellow: "bg-yellow-400",
  red: "bg-red-400",
};

const LEVEL_LABEL: Record<AnalysisLevel, string> = {
  green: "정상",
  yellow: "주의",
  red: "위험",
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOfToday - startOfDay) / DAY_MS);
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return d.toLocaleDateString("ko-KR", {
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [petFilter, setPetFilter] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const petNames = useMemo(
    () => Array.from(new Set((entries ?? []).map((e) => e.petName).filter(Boolean))),
    [entries]
  );

  const visible = useMemo(
    () => (entries ?? []).filter((e) => !petFilter || e.petName === petFilter),
    [entries, petFilter]
  );

  const stats = useMemo(() => {
    const since = Date.now() - 30 * DAY_MS;
    const counts: Record<AnalysisLevel, number> = { green: 0, yellow: 0, red: 0 };
    for (const e of visible) {
      if (new Date(e.createdAt).getTime() >= since) counts[e.result.level]++;
    }
    // Consecutive non-green results starting from the most recent one.
    let streak = 0;
    for (const e of visible) {
      if (e.result.level === "green") break;
      streak++;
    }
    return { counts, streak, recent: visible.slice(0, 14).reverse() };
  }, [visible]);

  const groups = useMemo(() => {
    const out: { key: string; label: string; items: HistoryEntry[] }[] = [];
    for (const e of visible) {
      const key = dayKey(e.createdAt);
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push(e);
      else out.push({ key, label: dayLabel(e.createdAt), items: [e] });
    }
    return out;
  }, [visible]);

  function openEntry(e: HistoryEntry) {
    sessionStorage.setItem(
      "poocheck_result",
      JSON.stringify({
        result: e.result,
        preview: e.thumbnail,
        pet: { name: e.petName, age: null, breed: "" },
        createdAt: e.createdAt,
      })
    );
    router.push("/result");
  }

  function handleDelete(id: string) {
    if (!confirm("이 기록을 삭제할까요?")) return;
    setEntries(deleteHistoryEntry(id));
  }

  function handleClearAll() {
    if (!confirm("모든 분석 기록을 삭제할까요? 되돌릴 수 없어요.")) return;
    clearHistory();
    setEntries([]);
    setPetFilter(null);
  }

  return (
    <main className="min-h-screen bg-amber-50">
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="text-stone-500 hover:text-stone-800 transition text-lg"
          aria-label="홈으로"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <h1 className="text-lg font-bold text-stone-800">분석 기록</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {entries === null ? null : entries.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-3">
            <span className="text-4xl">🐾</span>
            <p className="text-sm text-stone-600 leading-relaxed">
              아직 분석 기록이 없어요.<br />
              배변 사진을 분석하면 여기에 자동으로 쌓여요.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-2 px-5 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow hover:bg-amber-600 active:scale-95 transition"
            >
              💩 첫 분석 하러 가기
            </button>
          </div>
        ) : (
          <>
            {/* Pet filter — only when more than one pet has records */}
            {petNames.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[null, ...petNames].map((name) => (
                  <button
                    key={name ?? "__all"}
                    onClick={() => setPetFilter(name)}
                    className={[
                      "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition",
                      petFilter === name
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-white border-stone-200 text-stone-600",
                    ].join(" ")}
                  >
                    {name ?? "전체"}
                  </button>
                ))}
              </div>
            )}

            {/* Summary */}
            <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-stone-700">최근 30일 요약</h2>
              <div className="grid grid-cols-3 gap-2">
                {(["green", "yellow", "red"] as const).map((level) => (
                  <div key={level} className="rounded-xl bg-stone-50 py-3 text-center">
                    <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${DOT_COLOR[level]}`} />
                      {LEVEL_LABEL[level]}
                    </p>
                    <p className="text-xl font-bold text-stone-800 mt-1">
                      {stats.counts[level]}
                      <span className="text-xs font-medium text-stone-400 ml-0.5">회</span>
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-stone-400 mb-2">최근 {stats.recent.length}회 변화 (왼쪽이 과거)</p>
                <div className="flex items-center gap-1.5">
                  {stats.recent.map((e) => (
                    <span
                      key={e.id}
                      title={`${dayLabel(e.createdAt)} ${timeLabel(e.createdAt)} · ${LEVEL_LABEL[e.result.level]}`}
                      className={`w-4 h-4 rounded-full ${DOT_COLOR[e.result.level]}`}
                    />
                  ))}
                </div>
              </div>

              {stats.streak >= 2 && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  최근 {stats.streak}회 연속으로 주의·위험 판정이 나왔어요. 증상이 계속되면 수의사 상담을 권해요.{" "}
                  <a
                    href={kakaoMapSearch("동물병원")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline whitespace-nowrap"
                  >
                    근처 동물병원 찾기 →
                  </a>
                </div>
              )}
            </section>

            {/* Timeline */}
            <section className="space-y-5">
              {groups.map((g) => (
                <div key={g.key}>
                  <h3 className="text-xs font-semibold text-stone-500 mb-2 px-1">{g.label}</h3>
                  <ol className="relative border-l-2 border-stone-200 ml-2 space-y-3">
                    {g.items.map((e) => (
                      <li key={e.id} className="relative pl-5">
                        <span
                          className={`absolute -left-[7px] top-5 w-3 h-3 rounded-full ring-2 ring-amber-50 ${DOT_COLOR[e.result.level]}`}
                        />
                        <div className="bg-white rounded-2xl shadow-sm flex overflow-hidden">
                          <button
                            onClick={() => openEntry(e)}
                            className="flex-1 flex gap-3 p-3 text-left min-w-0 hover:bg-stone-50 transition"
                          >
                            {e.thumbnail ? (
                              <Image
                                src={e.thumbnail}
                                alt="분석 사진"
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-xl object-cover shrink-0"
                                unoptimized
                              />
                            ) : (
                              <span className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                                💩
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <StatusBadge level={e.result.level} />
                                <span className="text-xs text-stone-400">
                                  {timeLabel(e.createdAt)}
                                  {e.result.bristol_score && ` · 브리스톨 ${e.result.bristol_score}`}
                                </span>
                              </div>
                              {e.petName && petNames.length > 1 && !petFilter && (
                                <p className="text-xs text-stone-500 mt-1">{e.petName}</p>
                              )}
                              <p className="text-sm text-stone-700 mt-1 line-clamp-2">{e.result.summary}</p>
                            </div>
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="px-3 text-stone-300 hover:text-red-500 transition"
                            aria-label="기록 삭제"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </section>

            <button
              onClick={handleClearAll}
              className="w-full py-3 text-xs text-stone-400 hover:text-red-500 transition"
            >
              전체 기록 삭제
            </button>
          </>
        )}

        <p className="text-center text-xs text-stone-400 pb-4">
          기록은 이 기기에만 저장되며 수의사 진단을 대체하지 않습니다.
        </p>
      </div>
    </main>
  );
}
