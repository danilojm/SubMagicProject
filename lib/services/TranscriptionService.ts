// services/TranscriptionService.ts
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { ITranscriptionService } from "../interfaces/ITranscriptionService";
import { ProcessingProgress } from "../types/common";

export class TranscriptionService implements ITranscriptionService {
  private readonly supportedModels = ["tiny", "base", "small", "medium", "large"];

  async transcribeAudio(
    audioPath: string,
    outputDir: string,
    jobId: string,
    whisperModel: string,
    onProgress: (progress: ProcessingProgress) => Promise<void>
  ): Promise<string> {
    await onProgress({
      status: "TRANSCRIBING",
      progress: 40,
      options: { statusMessage: "Transcribing audio..." }
    });

    this.validateWhisperModel(whisperModel);
    
    const srtPath = path.join(outputDir, "audio.srt");

    return new Promise((resolve, reject) => {
      const cmd = `whisper "${audioPath}" --model "${whisperModel}" --language "en" --output_format srt --output_dir "${outputDir}"`;
      console.log(`Executing transcription command: ${cmd}`);
      
      exec(cmd, async (error) => {
        if (error) {
          return reject(new Error(`Transcription failed: ${error.message}`));
        }
        
        try {
          const srt = await fs.readFile(srtPath, "utf-8");
          return resolve(srt);
        } catch (readErr) {
          reject(new Error(`Reading SRT failed: ${(readErr as Error).message}`));
        }
      });
    });
  }

  private validateWhisperModel(model: string): void {
    if (!this.supportedModels.includes(model)) {
      throw new Error(`Unsupported Whisper model: ${model}. Supported models: ${this.supportedModels.join(", ")}`);
    }
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }
}