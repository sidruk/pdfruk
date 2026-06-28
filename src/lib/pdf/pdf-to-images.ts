import { zipSync } from "fflate";
import type { PDFDocumentProxy } from "pdfjs-dist";

export type PdfToImagesScale = 1 | 1.5 | 2;

export type PdfToImagesOptions = {
  scale: PdfToImagesScale;
};

export type PdfToImagesResult = {
  buffer: Uint8Array;
  filename: string;
  contentType: string;
};

export type PdfToImagesProgressCallback = (
  current: number,
  total: number,
) => void;

type PdfJsModule = typeof import("pdfjs-dist/build/pdf.mjs");

let pdfjsPromise: Promise<PdfJsModule> | null = null;
let workerConfigured = false;

function baseNameFromPdf(name: string): string {
  return name.replace(/\.pdf$/i, "") || "document";
}

function pageFilename(baseName: string, pageIndex: number, totalPages: number): string {
  const pad = String(totalPages).length;
  const pageNumber = String(pageIndex + 1).padStart(pad, "0");
  return `${baseName}-page-${pageNumber}.png`;
}

async function getPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/build/pdf.mjs");
  }

  const pdfjs = await pdfjsPromise;

  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }

  return pdfjs;
}

async function loadPdfDocument(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(data),
    useWorkerFetch: false,
  });
  return loadingTask.promise;
}

async function renderPagePng(
  pdf: PDFDocumentProxy,
  pageIndex: number,
  scale: number,
): Promise<Uint8Array> {
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const width = Math.ceil(viewport.width);
  const height = Math.ceil(viewport.height);

  let blob: Blob;

  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context for page export.");
    }

    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;

    blob = await canvas.convertToBlob({ type: "image/png" });
  } else if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context for page export.");
    }

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (value) {
          resolve(value);
          return;
        }
        reject(new Error("Failed to export PNG."));
      }, "image/png");
    });
  } else {
    throw new Error("Canvas is not available.");
  }

  return new Uint8Array(await blob.arrayBuffer());
}

export async function pdfToImages(
  buffer: ArrayBuffer,
  pdfName: string,
  options: PdfToImagesOptions,
  onProgress?: PdfToImagesProgressCallback,
): Promise<PdfToImagesResult> {
  const pdf = await loadPdfDocument(buffer);
  const totalPages = pdf.numPages;
  const baseName = baseNameFromPdf(pdfName);

  if (totalPages === 0) {
    throw new Error("PDF has no pages.");
  }

  if (totalPages === 1) {
    const png = await renderPagePng(pdf, 0, options.scale);
    onProgress?.(1, 1);
    return {
      buffer: png,
      filename: `${baseName}.png`,
      contentType: "image/png",
    };
  }

  const zipEntries: Record<string, Uint8Array> = {};

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    zipEntries[pageFilename(baseName, pageIndex, totalPages)] = await renderPagePng(
      pdf,
      pageIndex,
      options.scale,
    );
    onProgress?.(pageIndex + 1, totalPages);
  }

  return {
    buffer: zipSync(zipEntries),
    filename: `${baseName}-pages.zip`,
    contentType: "application/zip",
  };
}
