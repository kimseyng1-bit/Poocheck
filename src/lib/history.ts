import type { AnalysisResult, HistoryEntry, PetProfile } from "@/types";

const STORAGE_KEY = "poocheck_history";
// localStorage is ~5 MB per origin; at ~20–30 KB per thumbnail this keeps
// the history well under quota while still covering a couple of months.
const MAX_ENTRIES = 60;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Newest first. On quota errors, drop the oldest entries until it fits.
function persist(entries: HistoryEntry[]): HistoryEntry[] {
  let list = entries.slice(0, MAX_ENTRIES);
  while (list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list;
    } catch {
      list = list.slice(0, -1);
    }
  }
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  return [];
}

export function addHistoryEntry(
  result: AnalysisResult,
  pet: PetProfile,
  thumbnail: string
): HistoryEntry {
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    result,
    petName: pet.name,
    thumbnail,
  };
  persist([entry, ...loadHistory()]);
  return entry;
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  return persist(loadHistory().filter((e) => e.id !== id));
}

export function clearHistory() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// Downscale the analyzed photo to a small JPEG so many entries fit in storage.
export function makeThumbnail(
  dataUrl: string,
  maxWidth = 400,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve("");
    img.src = dataUrl;
  });
}
