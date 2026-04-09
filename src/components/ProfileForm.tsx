"use client";

import type { PetProfile } from "@/types";

interface Props {
  profile: PetProfile;
  onChange: (profile: PetProfile) => void;
}

export default function ProfileForm({ profile, onChange }: Props) {
  function update(field: keyof PetProfile, value: string | number | null) {
    onChange({ ...profile, [field]: value });
  }

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          강아지 이름 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="예: 코코"
          maxLength={30}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
        />
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">나이 (살)</label>
        <input
          type="number"
          value={profile.age ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            update("age", v === "" ? null : Number(v));
          }}
          placeholder="예: 3"
          min={0}
          max={30}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
        />
      </div>

      {/* Breed */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">품종</label>
        <input
          type="text"
          value={profile.breed}
          onChange={(e) => update("breed", e.target.value)}
          placeholder="예: 말티즈, 푸들, 믹스 ..."
          maxLength={50}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
        />
      </div>
    </div>
  );
}
