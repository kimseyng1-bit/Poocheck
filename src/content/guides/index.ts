// Symptom guide pages (/guide/[slug]), split by category into color.ts,
// shape.ts and other.ts; sources live in sources.ts. Plain data so pages can be statically
// generated. Every claim should be backed by one of the listed sources; the
// "appRule" line must match the verdict rules in src/lib/verdict.ts.

export interface GuideSource {
  title: string;
  url: string;
}

export interface GuideSection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export type GuideCategory = "color" | "shape" | "other";

export const GUIDE_CATEGORIES: Record<GuideCategory, string> = {
  color: "색깔",
  shape: "모양·굳기",
  other: "기생충·이물·생활",
};

export interface Guide {
  slug: string;
  category: GuideCategory;
  title: string; // H1, written as the searcher would phrase it
  metaTitle: string;
  description: string;
  emoji: string;
  urgent: string[]; // "지금 바로 병원에 연락하세요"
  watch: string; // when watching at home is reasonable
  sections: GuideSection[];
  appRule?: string; // how PooCheck classifies this in the app (omit if unrelated to the verdict)
  related: string[];
  sources: GuideSource[];
  updated: string; // YYYY-MM-DD
  reviewedBy?: string; // set only after an actual veterinarian review
}

import { COLOR_GUIDES } from "./color";
import { OTHER_GUIDES } from "./other";
import { SHAPE_GUIDES } from "./shape";

export const GUIDES: Guide[] = [...COLOR_GUIDES, ...SHAPE_GUIDES, ...OTHER_GUIDES];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
