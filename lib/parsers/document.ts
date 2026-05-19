import { unzipSync, strFromU8 } from 'fflate';
import { extractTextFromPDF } from './pdf';

/**
 * Generic document text extractor.
 *
 * Supported file types:
 *   - PDF              (via pdf-parse)
 *   - DOCX / PPTX      (real ZIP unpacking with fflate)
 *   - TXT/MD/CSV/JSON/XML/HTML — decoded as UTF-8
 *   - RTF              (strip control words)
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  fileNameLower: string,
  contentType: string,
): Promise<string> {
  // PDF
  if (fileNameLower.endsWith('.pdf') || contentType.includes('pdf')) {
    return extractTextFromPDF(buffer);
  }

  // DOCX — Open Office XML word document
  if (
    fileNameLower.endsWith('.docx') ||
    contentType.includes('officedocument.wordprocessingml')
  ) {
    return extractDocxText(buffer);
  }

  // PPTX — slide deck
  if (
    fileNameLower.endsWith('.pptx') ||
    contentType.includes('officedocument.presentationml')
  ) {
    return extractPptxText(buffer);
  }

  // RTF
  if (fileNameLower.endsWith('.rtf') || contentType.includes('rtf')) {
    return stripRtf(buffer.toString('utf-8'));
  }

  // HTML
  if (
    fileNameLower.endsWith('.html') ||
    fileNameLower.endsWith('.htm') ||
    contentType.includes('text/html')
  ) {
    return stripHtml(buffer.toString('utf-8'));
  }

  // Plain text-ish formats
  if (
    contentType.startsWith('text/') ||
    fileNameLower.match(/\.(txt|md|markdown|csv|json|xml|tsv|log|yml|yaml)$/)
  ) {
    return buffer.toString('utf-8');
  }

  // Fallback — UTF-8 best-effort
  const text = buffer.toString('utf-8');
  const printable = text.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '').length;
  if (text.length > 0 && printable / text.length > 0.6) return text;

  throw new Error(
    'Unsupported file format. Try PDF, DOCX, PPTX, TXT, MD, RTF, HTML, CSV, or JSON.',
  );
}

/** Unzip a DOCX and pull text from word/document.xml. */
function extractDocxText(buffer: Buffer): string {
  const zip = unzipSync(new Uint8Array(buffer));
  const docXml = zip['word/document.xml'];
  if (!docXml) {
    throw new Error('Invalid DOCX — missing word/document.xml');
  }
  const xml = strFromU8(docXml);
  return extractWordTextRuns(xml);
}

/** Unzip a PPTX and pull text from every slide. */
function extractPptxText(buffer: Buffer): string {
  const zip = unzipSync(new Uint8Array(buffer));
  const slidePaths = Object.keys(zip)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      const nb = Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      return na - nb;
    });
  if (slidePaths.length === 0) {
    throw new Error('Invalid PPTX — no slides found');
  }
  return slidePaths
    .map((p, i) => {
      const xml = strFromU8(zip[p]);
      const text = extractWordTextRuns(xml);
      return `Slide ${i + 1}\n${text}`;
    })
    .join('\n\n');
}

/** Pull text out of OOXML `<w:t>` / `<a:t>` runs. */
function extractWordTextRuns(xml: string): string {
  const matches = xml.match(/<(?:w|a):t[^>]*>([\s\S]*?)<\/(?:w|a):t>/g) ?? [];
  const parts = matches.map((m) =>
    m
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'"),
  );
  // Detect paragraph boundaries from <w:p> / <a:p> to give the text some shape.
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function stripRtf(rtf: string): string {
  return rtf
    .replace(/\\par[d]?/g, '\n')
    .replace(/\{\\[^}]+\}/g, '')
    .replace(/\\[a-z]+-?\d*\s?/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
