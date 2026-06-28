"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

import { THUMBNAIL_SCALE } from "@/lib/pdf/constants";
import { loadPdfDocument } from "@/lib/pdf/pdfjs-client";

export { loadPdfDocument };

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

export type PageRenderResult = {
  dataUrl: string;
  width: number;
  height: number;
};

export async function renderPageImage(
  pdf: PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  pixelRatio: number = typeof window !== "undefined"
    ? window.devicePixelRatio || 1
    : 1,
): Promise<PageRenderResult> {
  const page = await pdf.getPage(pageIndex + 1);
  const renderScale = scale * pixelRatio;
  const viewport = page.getViewport({ scale: renderScale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create canvas context for page render.");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport, canvas }).promise;

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: viewport.width / pixelRatio,
    height: viewport.height / pixelRatio,
  };
}

export async function renderPdfFilePageToDataUrl(
  file: File,
  pageIndex: number,
  scale = 1,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfDocument(buffer);
  return renderPageImage(pdf, pageIndex, scale, 1);
}
