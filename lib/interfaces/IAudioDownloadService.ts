// interfaces/IAudioDownloadService.ts
import { ProcessingProgress } from "../types/common";
export interface IAudioDownloadService {
  downloadAudio(
    videoUrl: string,
    outputDir: string,
    jobId: string,
    onProgress: (progress: ProcessingProgress) => Promise<void>
  ): Promise<string>;
}
