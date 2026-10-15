export interface PetProfile {
  name: string;
  age: number | null;
  breed: string;
}

export type AnalysisLevel = "green" | "yellow" | "red";

export interface AnalysisDetails {
  color: string;
  shape: string;
  foreign_objects: string;
}

export type BristolScore = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type AnalysisConfidence = "high" | "medium" | "low";

// Yes/no observations reported by Claude; see src/lib/verdict.ts.
export interface AnalysisFindings {
  blood: boolean;
  black_tarry: boolean;
  parasites: boolean;
  foreign_body: boolean;
  pale: boolean;
  mucus: boolean;
  abnormal_color: boolean;
  undigested_food: boolean;
}

export interface AnalysisResult {
  level: AnalysisLevel;
  summary: string;
  details: AnalysisDetails;
  advice: string;
  // Optional because history entries saved before these fields existed lack them.
  bristol_score?: BristolScore;
  confidence?: AnalysisConfidence;
  confidence_reason?: string;
  // What set the level, e.g. ["혈액"]; empty for green. Absent in older records.
  level_reasons?: string[];
}

export interface HistoryEntry {
  id: string;
  createdAt: string; // ISO timestamp
  result: AnalysisResult;
  petName: string;
  thumbnail: string; // small JPEG data URL
}

export interface AnalyzeRequest {
  imageBase64: string;
  mediaType: string;
  pet: PetProfile;
}

export interface AnalyzeResponse {
  result?: AnalysisResult;
  error?: string;
  code?: "not_stool" | "unclear" | "rate_limited";
  remaining?: number; // analyses left today on this device
}
