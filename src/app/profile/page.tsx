"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import type { PetProfile } from "@/types";

const DEFAULT_PROFILE: PetProfile = { name: "", age: null, breed: "" };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PetProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("poocheck_profile");
    if (stored) {
      try { setProfile(JSON.parse(stored)); } catch {}
    }
  }, []);

  function handleSave() {
    if (!profile.name.trim()) {
      alert("강아지 이름을 입력해주세요.");
      return;
    }
    localStorage.setItem("poocheck_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="min-h-screen bg-amber-50">
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-stone-500 hover:text-stone-800 transition text-lg"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <h1 className="text-lg font-bold text-stone-800">반려견 프로필</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <p className="text-sm text-stone-500 leading-relaxed">
          반려견 정보를 입력하면 더 정확한 분석 결과를 받을 수 있어요. 입력한 정보는 이 기기에만 저장됩니다.
        </p>

        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <ProfileForm profile={profile} onChange={setProfile} />
        </section>

        <button
          onClick={handleSave}
          className={[
            "w-full py-4 rounded-2xl font-bold text-base shadow-md transition",
            saved
              ? "bg-green-500 text-white"
              : "bg-amber-500 text-white hover:bg-amber-600 active:scale-95",
          ].join(" ")}
        >
          {saved ? "✓ 저장됨" : "저장하기"}
        </button>
      </div>
    </main>
  );
}
