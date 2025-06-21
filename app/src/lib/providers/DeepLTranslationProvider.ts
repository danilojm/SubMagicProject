// providers/DeepLTranslationProvider.ts
import axios from "axios";
import { BaseTranslationProvider } from "./BaseTranslationProvider";

export class DeepLTranslationProvider extends BaseTranslationProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    super();
    this.apiKey = process.env.DEEPL_API_KEY!;
    this.baseUrl = "https://api-free.deepl.com/v2/translate";

    if (!this.apiKey) {
      throw new Error("DEEPL_API_KEY is required for DeepL translation");
    }
  }

  async translate(text: string, targetLang: string): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append("auth_key", this.apiKey);
      params.append("text", text);
      params.append("target_lang", targetLang.toUpperCase());

      const response = await axios.post(this.baseUrl, params);
      return response.data.translations[0].text;
    } catch (error) {
      return this.handleTranslationError(error, text);
    }
  }

  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    try {
      const headers = {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/json",
      };

      const data = {
        text: texts,
        target_lang: targetLang.toUpperCase(),
      };

      const response = await axios.post(this.baseUrl, data, { headers });
      return response.data.translations.map((t: any) => t.text);
    } catch (error) {
      console.error("DeepL batch translation failed:", error);
      return texts;
    }
  }

  getSupportedLanguages(): string[] {
    return ["EN", "ES", "FR", "DE", "IT", "PT", "RU", "JA", "ZH"];
  }

  getMaxBatchSize(): number {
    return 50; // DeepL tem limite de 50 textos por request
  }
}

export default DeepLTranslationProvider;
