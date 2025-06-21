// providers/GoogleTranslationProvider.ts
import { BaseTranslationProvider } from './BaseTranslationProvider';

export class GoogleTranslationProvider extends BaseTranslationProvider {
  async translate(text: string, targetLang: string): Promise<string> {
    try {
      const { translate } = await import("google-translate-api-x");
      const normalizedLang = this.normalizeLanguageCode(targetLang);
      const res = await translate(text, { to: normalizedLang });
      return res.text;
    } catch (error) {
      return this.handleTranslationError(error, text);
    }
  }

  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    try {
      const translate = (await import("google-translate-api-x")).default;
      const normalizedLang = this.normalizeLanguageCode(targetLang);
      
      // Traduz todos os textos em paralelo
      const promises = texts.map(text => translate(text, { to: normalizedLang }));
      const results = await Promise.all(promises);
      
      return results.map(res => res.text);
    } catch (error) {
      console.error('Google batch translation failed:', error);
      return texts; // Retorna textos originais em caso de erro
    }
  }

  protected normalizeLanguageCode(langCode: string): string {
    const parts = langCode.split("-");
    if (parts.length > 1) {
      return parts[0] + "-" + parts[1].toUpperCase();
    }
    return langCode;
  }

  getSupportedLanguages(): string[] {
    return ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"];
  }

  getMaxBatchSize(): number {
    return 100; // Google permite muitas requisições paralelas
  }
}

export default GoogleTranslationProvider;