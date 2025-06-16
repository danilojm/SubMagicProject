// providers/AzureTranslationProvider.ts
import axios from 'axios';
import { BaseTranslationProvider } from './BaseTranslationProvider';

export class AzureTranslationProvider extends BaseTranslationProvider {
  private apiKey: string;
  private region: string;
  private endpoint: string;

  constructor() {
    super();
    this.apiKey = process.env.AZURE_TRANSLATOR_KEY!;
    this.region = process.env.AZURE_TRANSLATOR_REGION!;
    this.endpoint = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
    
    if (!this.apiKey || !this.region) {
      throw new Error("AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION are required");
    }
  }

  async translate(text: string, targetLang: string): Promise<string> {
    try {
      const url = `${this.endpoint}&to=${targetLang}`;
      const response = await axios.post(url, [{ Text: text }], {
        headers: {
          "Ocp-Apim-Subscription-Key": this.apiKey,
          "Ocp-Apim-Subscription-Region": this.region,
          "Content-Type": "application/json",
        },
      });
      
      return response.data[0].translations[0].text;
    } catch (error) {
      return this.handleTranslationError(error, text);
    }
  }

  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    try {
      const url = `${this.endpoint}&to=${targetLang}`;
      const body = texts.map(text => ({ Text: text }));
      
      const response = await axios.post(url, body, {
        headers: {
          "Ocp-Apim-Subscription-Key": this.apiKey,
          "Ocp-Apim-Subscription-Region": this.region,
          "Content-Type": "application/json",
        },
      });
      
      return response.data.map((item: any) => item.translations[0].text);
    } catch (error) {
      console.error('Azure batch translation failed:', error);
      return texts;
    }
  }

  getSupportedLanguages(): string[] {
    return ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"];
  }

  getMaxBatchSize(): number {
    return 100; // Azure suporta muitos textos por request
  }
}

export default AzureTranslationProvider;