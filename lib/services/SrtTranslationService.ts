// services/SrtTranslationService.ts
import { TranslationService } from "./TranslationService";
import { TranslationProvider } from "../interfaces/translation";

interface SrtBlock {
  idx: string;
  time: string;
  text: string;
  rawPos: number;
}

interface ParsedSrt {
  parsed: SrtBlock[];
  passthrough: { rawPos: number; block: string }[];
}

export class SrtTranslationService {
  private translationService: TranslationService;

  constructor(translationService: TranslationService) {
    this.translationService = translationService;
  }

  async translateSrt(
    srtContent: string,
    targetLang: string,
    provider: TranslationProvider = "google"
  ): Promise<string[]> {
    const blocks = srtContent.trim().split(/\n\s*\n/);
    const { parsed, passthrough } = this.parseBlocks(blocks);
    const translated: string[] = new Array(blocks.length);

    if (parsed.length === 0) {
      return blocks; // Retorna original se não há nada para traduzir
    }

    // Extrai apenas os textos para tradução
    const originalTexts = parsed.map((block) => block.text);

    try {
      // Traduz todos os textos de uma vez usando o serviço de tradução
      const translatedTexts = await this.translationService.translateBatch(
        originalTexts,
        targetLang,
        provider
      );

      // Reconstrói cada bloco traduzido
      parsed.forEach((block, index) => {
        translated[
          block.rawPos
        ] = `${block.idx}\n${block.time}\n${translatedTexts[index]}`;
      });

      // Copia blocos que não foram traduzidos (passthrough)
      passthrough.forEach((p) => {
        translated[p.rawPos] = p.block;
      });

      return translated;
    } catch (error) {
      console.error("SRT translation failed:", error);
      return blocks; // Retorna original em caso de erro
    }
  }

  private parseBlocks(blocks: string[]): ParsedSrt {
    const parsed: SrtBlock[] = [];
    const passthrough: { rawPos: number; block: string }[] = [];

    blocks.forEach((block, rawPos) => {
      const lines = block.split("\n");
      if (lines.length >= 3) {
        const [idx, time, ...textLines] = lines;
        parsed.push({
          idx,
          time,
          text: textLines.join(" "),
          rawPos,
        });
      } else {
        // Blocos inválidos ficam inalterados
        passthrough.push({ rawPos, block });
      }
    });

    return { parsed, passthrough };
  }

  validateSrtFormat(srtContent: string): boolean {
    const blocks = srtContent.trim().split(/\n\s*\n/);
    return blocks.some((block) => {
      const lines = block.split("\n");
      return (
        lines.length >= 3 &&
        /^\d+$/.test(lines[0]) &&
        /\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/.test(lines[1])
      );
    });
  }
}

export default SrtTranslationService;
