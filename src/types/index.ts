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

export interface AnalysisResult {
  level: AnalysisLevel;
  summary: string;
  details: AnalysisDetails;
  advice: string;
}

export interface AnalyzeRequest {
  imageBase64: string;
  mediaType: string;
  pet: PetProfile;
}

export interface AnalyzeResponse {
  result?: AnalysisResult;
  error?: string;
}
