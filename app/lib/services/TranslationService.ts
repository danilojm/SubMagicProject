// services/TranslationService.ts
import {
  TranslationProvider,
  ITranslationProvider,
} from "../interfaces/translation";
import { GoogleTranslationProvider } from "../providers/GoogleTranslationProvider";
import { DeepLTranslationProvider } from "../providers/DeepLTranslationProvider";
import { AzureTranslationProvider } from "../providers/AzureTranslationProvider";



export class TranslationService {
  private providers: Map<TranslationProvider, ITranslationProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    try {
      this.providers.set("google", new GoogleTranslationProvider());
    } catch (error) {
      console.warn("Google Translation Provider not available:", error);
    }

    try {
      this.providers.set("deepl", new DeepLTranslationProvider());
    } catch (error) {
      console.warn("DeepL Translation Provider not available:", error);
    }

    try {
      this.providers.set("azure", new AzureTranslationProvider());
    } catch (error) {
      console.warn("Azure Translation Provider not available:", error);
    }

    if (this.providers.size === 0) {
      throw new Error(
        "No translation providers are available. Check your environment variables."
      );
    }
  }

  getProvider(providerName: TranslationProvider): ITranslationProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(
        `Translation provider '${providerName}' is not available`
      );
    }
    return provider;
  }

  async translate(
    text: string,
    targetLang: string,
    providerName: TranslationProvider = "google"
  ): Promise<string> {
    const provider = this.getProvider(providerName);
    return provider.translate(text, targetLang);
  }

  async translateBatch(
    texts: string[],
    targetLang: string,
    providerName: TranslationProvider = "google"
  ): Promise<string[]> {
    const provider = this.getProvider(providerName);
    const maxBatchSize = provider.getMaxBatchSize();

    if (texts.length <= maxBatchSize) {
      return provider.translateBatch(texts, targetLang);
    }

    // Divide em lotes se exceder o limite
    const results: string[] = [];
    for (let i = 0; i < texts.length; i += maxBatchSize) {
      const batch = texts.slice(i, i + maxBatchSize);
      const batchResults = await provider.translateBatch(batch, targetLang);
      results.push(...batchResults);
    }

    return results;
  }

  getAvailableProviders(): TranslationProvider[] {
    return Array.from(this.providers.keys());
  }

  isProviderAvailable(providerName: TranslationProvider): boolean {
    return this.providers.has(providerName);
  }
}

export const translationService = new TranslationService();
export default translationService;
