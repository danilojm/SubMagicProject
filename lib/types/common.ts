// types/common.ts
export type JobStatus = "QUEUED" | "PROCESSING" | "DOWNLOADING" | "TRANSCRIBING" | "TRANSLATING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type SubtitleFormat = "SRT" | "VTT" | "ASS" | "SSA" | "TTML";
export type TranslationProvider = "google" | "deepl" | "azure";

export interface JobStatusUpdate {
  statusMessage?: string;
  errorMessage?: string;
}

export interface ProcessingProgress {
  status: JobStatus;
  progress: number;
  options?: JobStatusUpdate;
}