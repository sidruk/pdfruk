import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { imagesToPdf } from "@/lib/pdf/images-to-pdf";
import { MINIMAL_PNG } from "@/lib/pdf/test-helpers";

describe("imagesToPdf", () => {
  it("creates a single-page PDF from one PNG image", async () => {
    const buffer = MINIMAL_PNG.buffer.slice(
      MINIMAL_PNG.byteOffset,
      MINIMAL_PNG.byteOffset + MINIMAL_PNG.byteLength,
    ) as ArrayBuffer;

    const pdfBytes = await imagesToPdf([
      { buffer, mimeType: "image/png", name: "test.png" },
    ]);

    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it("creates a multi-page PDF from multiple images", async () => {
    const buffer = MINIMAL_PNG.buffer.slice(
      MINIMAL_PNG.byteOffset,
      MINIMAL_PNG.byteOffset + MINIMAL_PNG.byteLength,
    ) as ArrayBuffer;

    const pdfBytes = await imagesToPdf([
      { buffer, mimeType: "image/png", name: "first.png" },
      { buffer, mimeType: "image/png", name: "second.png" },
    ]);

    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBe(2);
  });

  it("reports progress while converting", async () => {
    const buffer = MINIMAL_PNG.buffer.slice(
      MINIMAL_PNG.byteOffset,
      MINIMAL_PNG.byteOffset + MINIMAL_PNG.byteLength,
    ) as ArrayBuffer;
    const progress: Array<{ current: number; total: number }> = [];

    await imagesToPdf(
      [
        { buffer, mimeType: "image/png", name: "first.png" },
        { buffer, mimeType: "image/png", name: "second.png" },
      ],
      (current, total) => {
        progress.push({ current, total });
      },
    );

    expect(progress).toEqual([
      { current: 1, total: 2 },
      { current: 2, total: 2 },
    ]);
  });

  it("throws when no images are provided", async () => {
    await expect(imagesToPdf([])).rejects.toThrow(
      "At least one image is required.",
    );
  });
});
