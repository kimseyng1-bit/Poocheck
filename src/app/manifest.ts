import type { MetadataRoute } from "next";

// Replaces the old /manifest.json link, which pointed at a file that didn't exist.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "포푸체크 — 강아지 배변 건강 분석",
    short_name: "포푸체크",
    description: "강아지 배변 사진을 AI로 분석해 건강 상태를 확인하세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbeb",
    theme_color: "#f59e0b",
    lang: "ko",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
