import { PDFDocument } from "pdf-lib";

import type { CropMargins, CropOptions } from "@/types/pdf";

export type CropProgressCallback = (
  current: number,
  total: number,
) => void;

function validateMargins(margins: CropMargins): void {
  const { top, right, bottom, left } = margins;

  if ([top, right, bottom, left].some((value) => value < 0 || value >= 1)) {
    throw new Error("Crop margins must be between 0 and 1.");
  }

  if (top + bottom >= 1 || left + right >= 1) {
    throw new Error("Crop margins remove the entire page.");
  }
}

export function marginsToCropBox(
  pageWidth: number,
  pageHeight: number,
  margins: CropMargins,
): { x: number; y: number; width: number; height: number } {
  const x = margins.left * pageWidth;
  const y = margins.bottom * pageHeight;
  const width = pageWidth * (1 - margins.left - margins.right);
  const height = pageHeight * (1 - margins.top - margins.bottom);

  return { x, y, width, height };
}

function getMarginsForPage(
  pageIndex: number,
  options: CropOptions,
): CropMargins | null {
  if (options.scope === "all") {
    return options.margins;
  }

  return options.pageMargins?.[pageIndex] ?? null;
}

function hasCrop(margins: CropMargins): boolean {
  return Object.values(margins).some((value) => value > 0);
}

export async function cropPdf(
  buffer: ArrayBuffer,
  options: CropOptions,
  onProgress?: CropProgressCallback,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  const pages = doc.getPages();
  const total = pages.length;

  for (let index = 0; index < pages.length; index += 1) {
    const margins = getMarginsForPage(index, options);

    if (margins) {
      validateMargins(margins);

      if (hasCrop(margins)) {
        const page = pages[index];
        const { width, height } = page.getSize();
        const cropBox = marginsToCropBox(width, height, margins);

        page.setCropBox(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
        page.setMediaBox(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
      }
    }

    onProgress?.(index + 1, total);
  }

  return doc.save();
}
