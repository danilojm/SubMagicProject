// interfaces/IFileService.ts
export interface IFileService {
  createDirectory(dirPath: string): Promise<void>;
  writeFile(
    filePath: string,
    content: string,
    encoding?: BufferEncoding
  ): Promise<void>;
  getFileStats(filePath: string): Promise<{ size: number }>;
}
