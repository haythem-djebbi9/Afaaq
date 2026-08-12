import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { PDFParse } from 'pdf-parse';
import { createWorker } from 'tesseract.js';

const MIN_PDF_TEXT_LENGTH = 20;

@Injectable()
export class DocumentExtractionService {
  private readonly logger = new Logger(DocumentExtractionService.name);

  async extractText(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return this.extractFromPdf(filePath);
    }
    if (mimeType.startsWith('image/')) {
      return this.extractFromImage(filePath);
    }
    return '';
  }

  private async extractFromPdf(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      const text = result.text?.trim() ?? '';
      if (text.length < MIN_PDF_TEXT_LENGTH) {
        return "Aucun texte détecté dans ce PDF (probablement un document scanné). L'OCR de PDF scannés n'est pas pris en charge dans cette version — seuls les PDF texte et les images (JPG/PNG) sont analysés.";
      }
      return text;
    } catch (err) {
      this.logger.warn(`PDF text extraction failed: ${(err as Error).message}`);
      return "Impossible d'extraire le texte de ce PDF.";
    } finally {
      await parser.destroy();
    }
  }

  private async extractFromImage(filePath: string): Promise<string> {
    const worker = await createWorker(['eng', 'fra', 'ara', 'deu']);
    try {
      const { data } = await worker.recognize(filePath);
      return data.text?.trim() ?? '';
    } catch (err) {
      this.logger.warn(`Image OCR failed: ${(err as Error).message}`);
      return "Impossible d'extraire le texte de cette image.";
    } finally {
      await worker.terminate();
    }
  }
}
