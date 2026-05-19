/**
 * PDF text extraction using pdfjs-dist directly.
 *
 * Why not pdf-parse? pdf-parse v2 depends on @napi-rs/canvas, whose native
 * .node binaries don't get traced into Vercel/serverless builds and crash
 * the function with a 500 the first time it's imported in production.
 *
 * We only need the text layer, so we skip canvas entirely.
 */

interface TextItem {
  str?: string;
  hasEOL?: boolean;
}

interface PDFPage {
  getTextContent: () => Promise<{ items: TextItem[] }>;
  cleanup?: () => void;
}

interface PDFDocument {
  numPages: number;
  getPage: (n: number) => Promise<PDFPage>;
  destroy: () => Promise<void>;
  cleanup?: () => void;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import so the heavy pdfjs bundle is only loaded inside the
  // route handler that actually needs it.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Disable the worker — we're already off the main thread.
  // (Without this, pdfjs tries to spawn a worker which fails on serverless.)
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = '';
  }

  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({
    data,
    // Disable features that need canvas / DOM
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
    // Suppress noisy console warnings
    verbosity: 0,
  });

  const doc = (await loadingTask.promise) as unknown as PDFDocument;

  try {
    const chunks: string[] = [];
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      try {
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => {
            const text = item.str ?? '';
            return item.hasEOL ? text + '\n' : text;
          })
          .join(' ')
          .replace(/[ \t]+/g, ' ')
          .replace(/\n\s+/g, '\n')
          .trim();
        if (pageText) chunks.push(pageText);
      } finally {
        page.cleanup?.();
      }
    }
    return chunks.join('\n\n');
  } finally {
    try {
      doc.cleanup?.();
      await doc.destroy();
    } catch {
      // ignore cleanup errors
    }
  }
}
