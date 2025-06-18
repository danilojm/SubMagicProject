// JobProcessor.ts - VERSÃO COMPLETA REFATORADA
import { prisma } from "./db";
import path from "path";
import { JobStatus, TranslationProvider } from "./types/common";
import { JobStatusService } from "./services/JobStatusService";
import { FileService } from "./services/FileService";
import { AudioDownloadService } from "./services/AudioDownloadService";
import { TranscriptionService } from "./services/TranscriptionService";
import { SubtitleService } from "./services/SubtitleService";
import { TranslationService } from "./services/TranslationService";
import { SrtTranslationService } from "./services/SrtTranslationService";

export class JobProcessor {
  private static instance: JobProcessor;
  private processingJobs = new Map<string, NodeJS.Timeout>();
  
  // Dependency Injection - Serviços
  private jobStatusService: JobStatusService;
  private fileService: FileService;
  private audioDownloadService: AudioDownloadService;
  private transcriptionService: TranscriptionService;
  private subtitleService: SubtitleService;
  private translationService: TranslationService;
  private srtTranslationService: SrtTranslationService;

  constructor() {
    // Initialize all services
    this.jobStatusService = new JobStatusService();
    this.fileService = new FileService();
    this.audioDownloadService = new AudioDownloadService();
    this.transcriptionService = new TranscriptionService();
    this.subtitleService = new SubtitleService(this.fileService);
    this.translationService = new TranslationService();
    this.srtTranslationService = new SrtTranslationService(this.translationService);
  }

  static getInstance(): JobProcessor {
    if (!JobProcessor.instance) {
      JobProcessor.instance = new JobProcessor();
    }
    return JobProcessor.instance;
  }

  async processJob(jobId: string): Promise<void> {
    try {
      console.log(`Processing job ${jobId}`);
      
      // Fetch job details
      const job = await this.getJobDetails(jobId);
      if (!job) throw new Error("Job not found");

      console.log(`Job details: ${JSON.stringify(job)}`);
      
      // Start processing
      await this.jobStatusService.updateJobStatus(jobId, "PROCESSING", 0, {
        statusMessage: "Starting processing...",
      });

      // Setup directories
      const { tempDir, downloadsDir } = await this.setupDirectories(jobId);

      if (!job.inputSource) {
        throw new Error("Invalid job input source or settings");
      }

      // Step 1: Download Audio
      const audioPath = await this.audioDownloadService.downloadAudio(
        job.inputSource,
        tempDir,
        jobId,
        (progress) => this.jobStatusService.updateJobStatus(jobId, progress.status, progress.progress, progress.options)
      );

      // Step 2: Transcribe Audio
      const srt = await this.transcriptionService.transcribeAudio(
        audioPath,
        tempDir,
        jobId,
        job.jobSettings?.whisperModel || "base",
        (progress) => this.jobStatusService.updateJobStatus(jobId, progress.status, progress.progress, progress.options)
      );

      // Update transcription text in job
      await this.jobStatusService.updateTranscriptionText(jobId, srt);

      // Step 3: Translation Phase
      await this.jobStatusService.updateJobStatus(jobId, "TRANSLATING", 70, {
        statusMessage: `Translating to ${job.targetLanguages.length} language(s)...`,
      });

      await this.processTranslations(job, srt, downloadsDir, jobId);

      // Complete job
      await this.jobStatusService.updateJobStatus(jobId, "COMPLETED", 100, {
        statusMessage: "Job completed successfully.",
      });
      await this.jobStatusService.updateJobEndTime(jobId);

    } catch (error) {
      console.error("Job processing error:", error);
      await this.jobStatusService.updateJobStatus(jobId, "FAILED", 0, {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        statusMessage: "Job failed during processing.",
      });
    }
  }

  private async getJobDetails(jobId: string) {
    return prisma.job.findUnique({
      where: { id: jobId },
      include: { jobSettings: true },
    });
  }

  private async setupDirectories(jobId: string): Promise<{ tempDir: string; downloadsDir: string }> {
    const tempDir = path.join(__dirname, "../temp", jobId);
    const downloadsDir = path.join(__dirname, "../downloads", jobId);
    
    await this.fileService.createDirectory(tempDir);
    await this.fileService.createDirectory(downloadsDir);
    
    return { tempDir, downloadsDir };
  }

  private async processTranslations(
    job: any,
    srt: string,
    downloadsDir: string,
    jobId: string
  ): Promise<void> {
    const provider = (job.jobSettings?.translationProvider as TranslationProvider) || "google";

    // Validate provider availability
    if (!this.translationService.isProviderAvailable(provider)) {
      throw new Error(`Translation provider '${provider}' is not available`);
    }

    // Process each target language
    for (let i = 0; i < job.targetLanguages.length; i++) {
      const targetLang = job.targetLanguages[i];
      let finalContent = srt;
      const fileName = `subtitles_${jobId}_${targetLang}.srt`;

      // Translate if target language is not source language
      if (targetLang !== "en") {
        const translatedBlocks = await this.srtTranslationService.translateSrt(
          srt,
          targetLang,
          provider
        );
        finalContent = translatedBlocks.join("\n\n");
      }

      // Save file
      const srtPath = path.join(downloadsDir, fileName);
      await this.fileService.writeFile(srtPath, finalContent);

      // Save subtitle to database
      await this.subtitleService.saveSubtitle(
        jobId,
        targetLang,
        "SRT",
        finalContent,
        srtPath
      );

      // Update progress
      const progress = 70 + ((i + 1) / job.targetLanguages.length) * 25;
      await this.jobStatusService.updateJobStatus(jobId, "TRANSLATING", progress, {
        statusMessage: `Processed ${i + 1}/${job.targetLanguages.length} languages`,
      });
    }
  }

  async cancelJob(jobId: string): Promise<void> {
    const timeout = this.processingJobs.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.processingJobs.delete(jobId);
    }
    await this.jobStatusService.updateJobStatus(jobId, "CANCELLED", 0, {
      statusMessage: "Job cancelled by user.",
    });
  }

  async retryJob(jobId: string): Promise<void> {
    // Clear existing subtitles before retry
    await this.subtitleService.clearSubtitles(jobId);

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

  // Utility methods for external access
  getAvailableTranslationProviders(): TranslationProvider[] {
    return this.translationService.getAvailableProviders();
  }

  getSupportedWhisperModels(): string[] {
    return this.transcriptionService.getSupportedModels();
  }

  async getJobSubtitles(jobId: string) {
    return this.subtitleService.getSubtitlesByJob(jobId);
  }
}

export const jobProcessor = JobProcessor.getInstance();