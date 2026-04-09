"use client";

import { useState } from "react";
import type { AnalysisResult, PetProfile } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

interface State {
  status: Status;
  result: AnalysisResult | null;
  error: string | null;
}

export function useAnalysis() {
  const [state, setState] = useState<State>({
    status: "idle",
    result: null,
    error: null,
  });

  async function analyze(imageBase64: string, mediaType: string, pet: PetProfile) {
    setState({ status: "loading", result: null, error: null });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType, pet }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error ?? "분석 중 오류가 발생했습니다.");
      }
      setState({ status: "success", result: data.result, error: null });
      return data.result as AnalysisResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "알 수 없는 오류";
      setState({ status: "error", result: null, error: msg });
      return null;
    }
  }

  function reset() {
    setState({ status: "idle", result: null, error: null });
  }

  return { ...state, analyze, reset };
}
