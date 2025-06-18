// services/FileService.ts
import fs from "fs/promises";
import { IFileService } from "../interfaces/IFileService";

export class FileService implements IFileService {
  async createDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async writeFile(filePath: string, content: string, encoding: BufferEncoding = "utf-8"): Promise<void> {
    await fs.writeFile(filePath, content, encoding);
  }

  async getFileStats(filePath: string): Promise<{ size: number }> {
    const stats = await fs.stat(filePath);
    return { size: stats.size };
  }
}