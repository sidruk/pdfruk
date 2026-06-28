"use client";

import { zipSync } from "fflate";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { loadPdfDocument } from "@/lib/pdf/pdfjs-client";

export type PdfToImagesScale = 2 | 3 | 4;

export type PdfToImagesFormat = "png" | "jpeg";

export type PdfToImagesOptions = {
  scale: PdfToImagesScale;
  format: PdfToImagesFormat;
  jpegQuality?: number;
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

const JPEG_QUALITY_DEFAULT = 0.92;

function baseNameFromPdf(name: string): string {
  return name.replace(/\.pdf$/i, "") || "document";
}

function pageFilename(
  baseName: string,
  pageIndex: number,
  totalPages: number,
  extension: "png" | "jpg",
): string {
  const pad = String(totalPages).length;
  const pageNumber = String(pageIndex + 1).padStart(pad, "0");
  return `${baseName}-page-${pageNumber}.${extension}`;
}

function mimeTypeForFormat(format: PdfToImagesFormat): string {
  return format === "jpeg" ? "image/jpeg" : "image/png";
}

function extensionForFormat(format: PdfToImagesFormat): "png" | "jpg" {
  return format === "jpeg" ? "jpg" : "png";
}

async function renderPageImage(
  pdf: PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  format: PdfToImagesFormat,
  jpegQuality: number,
): Promise<Uint8Array> {
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const width = Math.ceil(viewport.width);
  const height = Math.ceil(viewport.height);
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

  const mimeType = mimeTypeForFormat(format);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) {
          resolve(value);
          return;
        }
        reject(new Error(`Failed to export ${format.toUpperCase()}.`));
      },
      mimeType,
      format === "jpeg" ? jpegQuality : undefined,
    );
  });

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
  const extension = extensionForFormat(options.format);
  const contentType = mimeTypeForFormat(options.format);
  const jpegQuality = options.jpegQuality ?? JPEG_QUALITY_DEFAULT;

  if (totalPages === 0) {
    throw new Error("PDF has no pages.");
  }

  if (totalPages === 1) {
    const image = await renderPageImage(
      pdf,
      0,
      options.scale,
      options.format,
      jpegQuality,
    );
    onProgress?.(1, 1);
    return {
      buffer: image,
      filename: `${baseName}.${extension}`,
      contentType,
    };
  }

  const zipEntries: Record<string, Uint8Array> = {};

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    zipEntries[pageFilename(baseName, pageIndex, totalPages, extension)] =
      await renderPageImage(
        pdf,
        pageIndex,
        options.scale,
        options.format,
        jpegQuality,
      );
    onProgress?.(pageIndex + 1, totalPages);
  }

  return {
    buffer: zipSync(zipEntries),
    filename: `${baseName}-pages.zip`,
    contentType: "application/zip",
  };
}

export function scaleToApproxDpi(scale: PdfToImagesScale): number {
  return Math.round(scale * 72);
}
