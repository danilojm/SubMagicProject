import { JobStatus } from "@prisma/client";
import { JobStatusUpdate } from "../types/common";

export interface IJobStatusService {
  updateJobStatus(jobId: string, status: JobStatus, progress: number, options?: JobStatusUpdate): Promise<void>;
  updateJobEndTime(jobId: string): Promise<void>;
  updateTranscriptionText(jobId: string, text: string): Promise<void>;
}