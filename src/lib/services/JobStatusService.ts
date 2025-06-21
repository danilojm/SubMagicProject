// services/JobStatusService.ts
import { prisma } from "../db";
import { IJobStatusService } from "../interfaces/IJobStatusService";
import { JobStatus, JobStatusUpdate } from "../types/common";

export class JobStatusService implements IJobStatusService {
  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    progress: number,
    options?: JobStatusUpdate
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

  async updateJobEndTime(jobId: string): Promise<void> {
    await prisma.job.update({
      where: { id: jobId },
      data: { processingEnded: new Date() },
    });
  }

  async updateTranscriptionText(jobId: string, text: string): Promise<void> {
    await prisma.job.update({
      where: { id: jobId },
      data: { transcriptionText: text },
    });
  }
}
