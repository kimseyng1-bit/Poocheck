"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import ProfileForm from "@/components/ProfileForm";
import { useAnalysis } from "@/hooks/useAnalysis";
import type { PetProfile } from "@/types";

const DEFAULT_PROFILE: PetProfile = { name: "", age: null, breed: "" };

export default function HomePage() {
  const router = useRouter();
  const { status, error, analyze } = useAnalysis();

  const [image, setImage] = useState<{ base64: string; mediaType: string; preview: string } | null>(null);
  const [profile, setProfile] = useState<PetProfile>(DEFAULT_PROFILE);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("poocheck_profile");
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch {}
    }
  }, []);

  function handleImageSelected(base64: string, mediaType: string, preview: string) {
    setImage({ base64, mediaType, preview });
  }

  async function handleAnalyze() {
    if (!image) return;
    localStorage.setItem("poocheck_profile", JSON.stringify(profile));

    const result = await analyze(image.base64, image.mediaType, profile);
    if (result) {
      sessionStorage.setItem(
        "poocheck_result",
        JSON.stringify({ result, preview: image.preview, pet: profile })
      );
      router.push("/result");
    }
  }

  const canAnalyze = !!image && status !== "loading";

  return (
    <main className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💩</span>
          <h1 className="text-lg font-bold text-stone-800">포푸체크</h1>
        </div>
        <button
          onClick={() => router.push("/profile")}
          className="text-xs text-stone-500 flex items-center gap-1 hover:text-amber-600 transition"
        >
          <span>🐾</span>
          <span>프로필</span>
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="text-center">
          <p className="text-stone-600 text-sm leading-relaxed">
            강아지 배변 사진을 올리면<br />
            <span className="font-semibold text-amber-700">AI가 건강 상태</span>를 분석해드려요
          </p>
        </div>

        {/* Upload */}
        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-stone-700">사진 업로드</h2>
          <UploadZone onImageSelected={handleImageSelected} />
        </section>

        {/* Pet profile toggle */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-semibold text-stone-700"
          >
            <span className="flex items-center gap-2">
              <span>🐶</span>
              반려견 정보 {profile.name ? `(${profile.name})` : ""}
            </span>
            <span className="text-stone-400 text-xs">{showProfile ? "접기 ▲" : "펼치기 ▼"}</span>
          </button>
          {showProfile && (
            <div className="mt-4">
              <ProfileForm profile={profile} onChange={setProfile} />
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={[
            "w-full py-4 rounded-2xl font-bold text-base shadow-md transition",
            canAnalyze
              ? "bg-amber-500 text-white hover:bg-amber-600 active:scale-95"
              : "bg-stone-200 text-stone-400 cursor-not-allowed",
          ].join(" ")}
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              분석 중…
            </span>
          ) : (
            "💩 분석 시작"
          )}
        </button>

        <p className="text-center text-xs text-stone-400">
          이 앱은 수의사 진단을 대체하지 않습니다.
        </p>
      </div>
    </main>
  );
}
