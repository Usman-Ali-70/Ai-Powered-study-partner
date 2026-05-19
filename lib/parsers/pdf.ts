import { PDFParse } from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdf-parse v2 exposes a class. Pass the PDF as a Uint8Array
  // (it warns about Node Buffer ownership transfer to worker, so copy).
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return result.text ?? '';
  } finally {
    try {
      await parser.destroy();
    } catch {
      // ignore cleanup errors
    }
  }
}
