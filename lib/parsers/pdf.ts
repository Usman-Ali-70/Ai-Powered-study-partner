import * as pdfParse from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdf-parse v2 uses named exports
  const parse = (pdfParse as unknown as { default?: (buf: Buffer) => Promise<{ text: string }>; (buf: Buffer): Promise<{ text: string }> });
  const fn = typeof parse === 'function' ? parse : ((parse as any).default || parse);
  const data = await (fn as (buf: Buffer) => Promise<{ text: string }>)(buffer);
  return data.text;
}
