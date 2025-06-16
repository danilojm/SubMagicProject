import { prisma } from "./db";
import { JobStatus } from "./types";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export class JobProcessor {
  private static instance: JobProcessor;
  private processingJobs = new Map<string, NodeJS.Timeout>();

  static getInstance(): JobProcessor {
    if (!JobProcessor.instance) {
      JobProcessor.instance = new JobProcessor();
    }
    return JobProcessor.instance;
  }

  async processJob(jobId: string): Promise<void> {
    try {
      console.log(`Processing job ${jobId}`);
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { jobSettings: true },
      });

      if (!job) throw new Error("Job not found");

      console.log(`Job details: ${JSON.stringify(job)}`);
      await this.updateJobStatus(jobId, "PROCESSING", 0, {
        statusMessage: "Starting processing...",
      });

      const tempDir = path.join(__dirname, "../temp", jobId);
      await fs.mkdir(tempDir, { recursive: true });

      if (!job.inputSource) {
        throw new Error("Invalid job input source or settings");
      }

      const audioPath = await this.downloadAudio(
        job.inputSource,
        tempDir,
        jobId
      );

      const srt = await this.transcribeAudio(
        audioPath,
        tempDir,
        jobId,
        job.jobSettings?.whisperModel || "base"
      );

      // Update transcription text in job
      await prisma.job.update({
        where: { id: jobId },
        data: { transcriptionText: srt },
      });

      await this.updateJobStatus(jobId, "TRANSLATING", 70, {
        statusMessage: `Translating to ${job.targetLanguages.length} language(s)...`,
      });

      const downloadsDir = path.join(__dirname, "../downloads", jobId);
      await fs.mkdir(downloadsDir, { recursive: true });

      // Choose translation provider (default to google if not set)
      // const provider: TRANSLATION_PROVIDERS = job.jobSettings
      const provider = job.jobSettings?.translationProvider || "google";

      // Process each target language
      for (let i = 0; i < job.targetLanguages.length; i++) {
        const targetLang = job.targetLanguages[i];

        let finalContent = srt;
        let fileName = `subtitles_${jobId}_${targetLang}.srt`;

        // If target language is not the source language, translate
        if (targetLang !== "en") {
          // assuming source is English, adjust as needed
          finalContent = (await this.translateSrt(srt, targetLang, provider)).join("\n\n");
        }

        const srtPath = path.join(downloadsDir, fileName);
        await fs.writeFile(srtPath, finalContent, "utf-8");

        // Save subtitle to database
        await this.saveSubtitle(
          jobId,
          targetLang,
          "SRT",
          finalContent,
          srtPath
        );

        // Update progress
        const progress = 70 + ((i + 1) / job.targetLanguages.length) * 25;
        await this.updateJobStatus(jobId, "TRANSLATING", progress, {
          statusMessage: `Processed ${i + 1}/${
            job.targetLanguages.length
          } languages`,
        });
      }

      await this.updateJobStatus(jobId, "COMPLETED", 100, {
        statusMessage: "Job completed successfully.",
      });
      await this.updateJobEndTime(jobId);
    } catch (error) {
      console.error("Job processing error:", error);
      await this.updateJobStatus(jobId, "FAILED", 0, {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        statusMessage: "Job failed during processing.",
      });
    }
  }

  // NEW METHOD: Save subtitle to database
  private async saveSubtitle(
    jobId: string,
    language: string,
    format: "SRT" | "VTT" | "ASS" | "SSA" | "TTML",
    content: string,
    filePath: string
  ): Promise<void> {
    try {
      const stats = await fs.stat(filePath);

      await prisma.subtitle.create({
        data: {
          jobId,
          language,
          format,
          content,
          filePath,
          fileSize: stats.size,
          downloadCount: 0,
          isEdited: false,
        },
      });

      console.log(`Subtitle saved for job ${jobId}, language: ${language}`);
    } catch (error) {
      console.error(`Failed to save subtitle for job ${jobId}:`, error);
      throw error;
    }
  }

  private async downloadAudio(
    videoUrl: string,
    outputDir: string,
    jobId: string
  ): Promise<string> {
    await this.updateJobStatus(jobId, "DOWNLOADING", 10, {
      statusMessage: "Downloading audio...",
    });

    console.log(
      `Downloading audio from JobID ${jobId} at videoUrl ${videoUrl} to outputDir ${outputDir}`
    );
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

  private async transcribeAudio(
    audioPath: string,
    outputDir: string,
    jobId: string,
    whisperModel: string
  ): Promise<string> {
    await this.updateJobStatus(jobId, "TRANSCRIBING", 40, {
      statusMessage: "Transcribing audio...",
    });
    const srtPath = path.join(outputDir, "audio.srt");

    return new Promise((resolve, reject) => {
      const cmd = `whisper "${audioPath}" --model "${whisperModel}" --language "en" --output_format srt --output_dir "${outputDir}"`;
      console.log(`Executing transcription command: ${cmd}`);
      exec(cmd, async (error) => {
        if (error)
          return reject(new Error(`Transcription failed: ${error.message}`));
        try {
          const srt = await fs.readFile(srtPath, "utf-8");
          return resolve(srt);
        } catch (readErr) {
          reject(
            new Error(`Reading SRT failed: ${(readErr as Error).message}`)
          );
        }
      });
    });
  }

  // --- TRANSLATION PROVIDERS ---

  private async translateWithDeepL(
    text: string,
    targetLang: string
  ): Promise<string> {
    const apiKey = process.env.DEEPL_API_KEY;
    const url = "https://api-free.deepl.com/v2/translate";
    const params = new URLSearchParams();
    params.append("auth_key", apiKey!);
    params.append("text", text);
    params.append("target_lang", targetLang.toUpperCase());

    console.log(`Translating with DeepL: ${text} to ${targetLang}`);

    const response = await axios.post(url, params);
    return response.data.translations[0].text;
  }

  private async translateWithAzure(
    text: string,
    targetLang: string
  ): Promise<string> {
    const apiKey = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;
    const endpoint =
      "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
    const url = `${endpoint}&to=${targetLang}`;

    const response = await axios.post(url, [{ Text: text }], {
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey!,
        "Ocp-Apim-Subscription-Region": region!,
        "Content-Type": "application/json",
      },
    });
    return response.data[0].translations[0].text;
  }

  private async translateWithGoogle(
    text: string,
    targetLang: string
  ): Promise<string> {
    // You can use your existing google-translate-api-x or similar
    const { translate } = await import("google-translate-api-x");
    const res = await translate(text, { to: targetLang });
    return res.text;
  }

  // --- SRT TRANSLATION ---

  private async translateBatchWithDeepL(
    texts: string[],
    targetLang: string
  ): Promise<string[]> {
    const apiKey = process.env.DEEPL_API_KEY;
    const url = "https://api-free.deepl.com/v2/translate";

    const headers = {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    };
    const data = {
      text: texts, // array de strings
      target_lang: targetLang.toUpperCase(),
    };

    const resp = await axios.post(url, data, { headers });
    return resp.data.translations.map((t: any) => t.text);
  }

  private async translateBatchWithGoogle(
    texts: string[],
    targetLang: string
  ): Promise<string[]> {
    const translate = (await import("google-translate-api-x")).default;
    const targetLenght = targetLang.split("-");
    if (targetLenght.length > 1) {
      targetLang = targetLenght[0] +"-"+targetLenght[1].toUpperCase(); // converte para maiúsculas
    }
    // Traduz todos os textos em paralelo
    const promises = texts.map((text) => translate(text, { to: targetLang }));
    const results = await Promise.all(promises);

    return results.map((res) => res.text);
  }
  private async translateSrt(
    srtContent: string,
    targetLang: string,
    provider: string
  ): Promise<string[]> {
    const blocks = srtContent.trim().split(/\n\s*\n/);
    // const translated: string[] = [];
    // console.log(`Translating SRT content to ${targetLang} using ${provider}`);

    // for (const block of blocks) {
    //   const lines = block.split("\n");
    //   if (lines.length >= 3) {
    //     const [index, timecode, ...textLines] = lines;
    //     const original = textLines.join(" ");
    //     try {
    //       let translatedText: string;
    //       if (provider === "deepl") {
    //         translatedText = await this.translateWithDeepL(original, targetLang);
    //       } else if (provider === "azure") {
    //         translatedText = await this.translateWithAzure(original, targetLang);
    //       } else {
    //         translatedText = await this.translateWithGoogle(original, targetLang);
    //       }
    //       translated.push(`${index}\n${timecode}\n${translatedText}`);
    //     } catch (err) {
    //       console.warn(
    //         `[WARN] Translation failed for block. Keeping original.`,
    //         err
    //       );
    //       translated.push(block);
    //     }
    //   } else {
    //     translated.push(block);
    //   }
    // }

    // return translated.join("\n\n");
    const { parsed, passthrough } = parseBlocks(blocks);
    const translated: string[] = new Array(blocks.length);

    // Considere o limite de 50 textos por request na DeepL
    const BATCH_SIZE = 50;
    for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
      const slice = parsed.slice(i, i + BATCH_SIZE);
      const originalTexts = slice.map((b) => b.text);

      let translatedTexts: string[];
      switch (provider) {
        case "deepl":
          translatedTexts = await this.translateBatchWithDeepL(
            originalTexts,
            targetLang
          );
          break;
        // case "azure":
        //   translatedTexts = await this.translateBatchWithAzure(
        //     originalTexts,
        //     targetLang
        //   );
        //   break;
        default:
          translatedTexts = await this.translateBatchWithGoogle(
            originalTexts,
            targetLang
          );
      }

      // Reconstrói cada bloco traduzido
      slice.forEach((b, j) => {
        translated[b.rawPos] = `${b.idx}\n${b.time}\n${translatedTexts[j]}`;
      });
    }

    // Copia blocos que não foram traduzidos
    passthrough.forEach((p) => (translated[p.rawPos] = p.block));

    return translated;
  }

  // --- STATUS/UTILITY METHODS ---

  private async updateJobStatus(
    jobId: string,
    status: JobStatus,
    progress: number,
    options?: {
      statusMessage?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    const dataToUpdate: any = {
      status,
      progress,
      updatedAt: new Date(),
    };

    if (options?.statusMessage) {
      dataToUpdate.statusMessage = options.statusMessage;
    }

    if (options?.errorMessage) {
      dataToUpdate.errorMessage = options.errorMessage;
    } else if (status !== "FAILED") {
      dataToUpdate.errorMessage = null;
    }

    if (status === "PROCESSING" && progress === 0) {
      dataToUpdate.processingStarted = new Date();
    }

    await prisma.job.update({
      where: { id: jobId },
      data: dataToUpdate,
    });
  }

  private async updateJobEndTime(jobId: string): Promise<void> {
    await prisma.job.update({
      where: { id: jobId },
      data: { processingEnded: new Date() },
    });
  }

  async cancelJob(jobId: string): Promise<void> {
    const timeout = this.processingJobs.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.processingJobs.delete(jobId);
    }
    await this.updateJobStatus(jobId, "CANCELLED", 0, {
      statusMessage: "Job cancelled by user.",
    });
  }

  async retryJob(jobId: string): Promise<void> {
    // Clear existing subtitles before retry
    await prisma.subtitle.deleteMany({
      where: { jobId },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "QUEUED",
        progress: 0,
        errorMessage: null,
        statusMessage: "Queued for retry.",
        processingStarted: null,
        processingEnded: null,
        transcriptionText: null,
      },
    });
    setTimeout(() => this.processJob(jobId), 1000);
  }
}

export const jobProcessor = JobProcessor.getInstance();
// 1. Converte um SRT em um array de objetos { idx, time, text, rawPos }
function parseBlocks(blocks: string[]) {
  type B = { idx: string; time: string; text: string; rawPos: number };
  const parsed: B[] = [];
  const passthrough: { rawPos: number; block: string }[] = [];

  blocks.forEach((block, rawPos) => {
    const lines = block.split("\n");
    if (lines.length >= 3) {
      const [idx, time, ...textLines] = lines;
      parsed.push({ idx, time, text: textLines.join(" "), rawPos });
    } else {
      // blocos inválidos ficam inalterados
      passthrough.push({ rawPos, block });
    }
  });

  return { parsed, passthrough };
}
