// services/AudioDownloadService.ts
import { exec } from "child_process";
import path from "path";
import { IAudioDownloadService } from "../interfaces/IAudioDownloadService";
import { ProcessingProgress } from "../types/common";

export class AudioDownloadService implements IAudioDownloadService {
  async downloadAudio(
    videoUrl: string,
    outputDir: string,
    jobId: string,
    onProgress: (progress: ProcessingProgress) => Promise<void>
  ): Promise<string> {
    await onProgress({
      status: "DOWNLOADING",
      progress: 10,
      options: { statusMessage: "Downloading audio..." }
    });

    console.log(`Downloading audio from JobID ${jobId} at videoUrl ${videoUrl} to outputDir ${outputDir}`);
    
    const audioPath = path.join(outputDir, "audio.wav");
    
    return new Promise((resolve, reject) => {
      const cmd = `yt-dlp -x --audio-format wav -o "${audioPath}" "${videoUrl}"`;
      console.log(`Executing command: ${cmd}`);
      
      exec(cmd, (error) => {
        if (error) {
          console.error(`Download error for job ${jobId}:`, error);
          return reject(new Error(`Download failed: ${error.message}`));
        }
        resolve(audioPath);
      });
    });
  }

  private validateVideoUrl(url: string): boolean {
    // Implementar validação básica de URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private sanitizeOutputPath(outputDir: string): string {
    // Implementar sanitização do caminho de saída
    return path.resolve(outputDir);
  }
}