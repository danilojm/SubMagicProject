// services/SubtitleService.ts
import { prisma } from "../db";
import { IFileService } from "../interfaces/IFileService";
import { ISubtitleService } from "../interfaces/ISubtitleService";
import { SubtitleFormat } from "../types/common";

export class SubtitleService implements ISubtitleService {
  constructor(private fileService: IFileService) {}

  async saveSubtitle(
    jobId: string,
    language: string,
    format: SubtitleFormat,
    content: string,
    filePath: string
  ): Promise<void> {
    try {
      const stats = await this.fileService.getFileStats(filePath);

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

  async clearSubtitles(jobId: string): Promise<void> {
    await prisma.subtitle.deleteMany({
      where: { jobId },
    });
  }

  async getSubtitlesByJob(jobId: string) {
    return prisma.subtitle.findMany({
      where: { jobId },
    });
  }

  async incrementDownloadCount(subtitleId: string): Promise<void> {
    await prisma.subtitle.update({
      where: { id: subtitleId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }
}
