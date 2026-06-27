import type { PDFDocumentProxy } from "pdfjs-dist";

import { THUMBNAIL_SCALE } from "@/lib/pdf/constants";

let workerConfigured = false;

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");

  if (!workerConfigured && typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }

  return pdfjs;
}

export async function loadPdfDocument(
  data: ArrayBuffer,
): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data });
  return loadingTask.promise;
}

export async function renderPageThumbnail(
  pdf: PDFDocumentProxy,
  pageIndex: number,
  scale: number = THUMBNAIL_SCALE,
): Promise<string> {
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create canvas context for thumbnail.");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport, canvas }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to render thumbnail."));
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

export function revokeThumbnailUrl(url: string | undefined): void {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
