// interfaces/ITranscriptionService.ts
import { ProcessingProgress } from "../types/common";

export interface ITranscriptionService {
  transcribeAudio(
    audioPath: string,
    outputDir: string,
    jobId: string,
    whisperModel: string,
    onProgress: (progress: ProcessingProgress) => Promise<void>
  ): Promise<string>;
}
