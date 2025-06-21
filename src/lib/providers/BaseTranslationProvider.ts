import { ITranslationProvider } from "../interfaces/translation";

export abstract class BaseTranslationProvider implements ITranslationProvider {
  abstract translate(text: string, targetLang: string): Promise<string>;
  abstract translateBatch(
    texts: string[],
    targetLang: string
  ): Promise<string[]>;
  abstract getSupportedLanguages(): string[];
  abstract getMaxBatchSize(): number;

  protected normalizeLanguageCode(langCode: string): string {
    // Implementação base para normalização de códigos de idioma
    return langCode.toLowerCase();
  }

  protected handleTranslationError(error: any, text: string): string {
    console.warn(
      `Translation failed for text: "${text.substring(0, 50)}..."`,
      error
    );
    return text; // Retorna o texto original em caso de erro
  }
}
