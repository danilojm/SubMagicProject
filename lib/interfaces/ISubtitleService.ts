import { SubtitleFormat } from "@prisma/client";

// interfaces/ISubtitleService.ts
export interface ISubtitleService {
  saveSubtitle(jobId: string, language: string, format: SubtitleFormat, content: string, filePath: string): Promise<void>;
  clearSubtitles(jobId: string): Promise<void>;
}
