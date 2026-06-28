import { PDFDocument, StandardFonts } from "pdf-lib";

import { parseHexColor, toPdfY } from "@/lib/pdf/pdf-utils";
import type { PageNumberOptions, PageNumberPosition } from "@/types/pdf";

export type PageNumbersProgressCallback = (
  current: number,
  total: number,
) => void;

function formatPageNumber(
  template: string,
  pageNumber: number,
  totalPages: number,
): string {
  return template
    .replace(/\{total\}/g, String(totalPages))
    .replace(/\{n\}/g, String(pageNumber));
}

function getPositionCoords(
  position: PageNumberPosition,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number,
  margin: number,
): { x: number; y: number } {
  const halfWidth = textWidth / 2;

  switch (position) {
    case "top-left":
      return { x: margin, y: toPdfY(pageHeight, margin / pageHeight + fontSize / pageHeight) };
    case "top-center":
      return {
        x: pageWidth / 2 - halfWidth,
        y: toPdfY(pageHeight, margin / pageHeight + fontSize / pageHeight),
      };
    case "top-right":
      return {
        x: pageWidth - margin - textWidth,
        y: toPdfY(pageHeight, margin / pageHeight + fontSize / pageHeight),
      };
    case "bottom-left":
      return { x: margin, y: margin };
    case "bottom-center":
      return { x: pageWidth / 2 - halfWidth, y: margin };
    case "bottom-right":
      return { x: pageWidth - margin - textWidth, y: margin };
  }
}

export async function addPageNumbers(
  buffer: ArrayBuffer,
  options: PageNumberOptions,
  onProgress?: PageNumbersProgressCallback,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const color = parseHexColor(options.color);

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    const { width, height } = page.getSize();
    const pageNumber = options.startNumber + index;
    const text = formatPageNumber(options.format, pageNumber, total);
    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    const { x, y } = getPositionCoords(
      options.position,
      width,
      height,
      textWidth,
      options.fontSize,
      options.margin,
    );

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color,
    });

    onProgress?.(index + 1, total);
  }

  return doc.save();
}
