import { PDFDocument, degrees } from "pdf-lib";

import { normalizeRotation } from "@/lib/pdf/pdf-utils";
import type { RotateOptions, RotationAngle } from "@/types/pdf";

export type RotateProgressCallback = (
  current: number,
  total: number,
) => void;

export async function rotatePdf(
  buffer: ArrayBuffer,
  options: RotateOptions,
  onProgress?: RotateProgressCallback,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  const pages = doc.getPages();
  const total = pages.length;

  for (let index = 0; index < pages.length; index += 1) {
    const rotation = options.rotations[index];
    if (rotation !== undefined) {
      pages[index].setRotation(degrees(normalizeRotation(rotation)));
    }
    onProgress?.(index + 1, total);
  }

  return doc.save();
}

export async function getPageRotations(buffer: ArrayBuffer): Promise<RotationAngle[]> {
  const doc = await PDFDocument.load(buffer);
  return doc.getPages().map((page) => normalizeRotation(page.getRotation().angle));
}
