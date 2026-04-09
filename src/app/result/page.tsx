"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ResultCard from "@/components/ResultCard";
import type { AnalysisResult, PetProfile } from "@/types";

interface StoredData {
  result: AnalysisResult;
  preview: string;
  pet: PetProfile;
}

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<StoredData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("poocheck_result");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!data) return null;

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
          <span className="text-xl">💩</span>
          <h1 className="text-lg font-bold text-stone-800">분석 결과</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Photo thumbnail */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 shadow-sm max-h-52">
          <Image
            src={data.preview}
            alt="분석된 사진"
            width={400}
            height={208}
            className="w-full object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Result */}
        <ResultCard result={data.result} petName={data.pet.name || undefined} />

        {/* Actions */}
        <button
          onClick={() => {
            sessionStorage.removeItem("poocheck_result");
            router.push("/");
          }}
          className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-base shadow-md hover:bg-amber-600 active:scale-95 transition"
        >
          다시 분석하기
        </button>

        <p className="text-center text-xs text-stone-400 pb-4">
          이 결과는 참고용이며 수의사 진단을 대체하지 않습니다.
        </p>
      </div>
    </main>
  );
}
