export type TranslationProvider = "google" | "deepl" | "azure";

export interface ITranslationProvider {
  translate(text: string, targetLang: string): Promise<string>;
  translateBatch(texts: string[], targetLang: string): Promise<string[]>;
  getSupportedLanguages(): string[];
  getMaxBatchSize(): number;
}