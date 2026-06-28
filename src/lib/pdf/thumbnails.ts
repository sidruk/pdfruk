"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

import { THUMBNAIL_SCALE } from "@/lib/pdf/constants";

type PdfJsModule = typeof import("pdfjs-dist/build/pdf.mjs");

let pdfjsPromise: Promise<PdfJsModule> | null = null;
let workerConfigured = false;

async function getPdfJs(): Promise<PdfJsModule> {
  if (typeof window === "undefined") {
    throw new Error("PDF.js is only available in the browser.");
  }

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
