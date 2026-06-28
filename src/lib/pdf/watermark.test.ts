import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { addWatermark } from "@/lib/pdf/watermark";
import { createTestPdf } from "@/lib/pdf/test-helpers";

const BASE_OPTIONS = {
  type: "text" as const,
  opacity: 0.3,
  fontSize: 48,
  color: "#64748b",
  rotation: -45,
  position: "center" as const,
  mosaic: false,
  imageScale: 0.25,
};

describe("addWatermark", () => {
  it("applies a text watermark to all pages", async () => {
    const source = await createTestPdf(2);
    const result = await addWatermark(source.buffer as ArrayBuffer, {
      ...BASE_OPTIONS,
      text: "CONFIDENTIAL",
    });
    const doc = await PDFDocument.load(result);

    expect(doc.getPageCount()).toBe(2);
  });

  it("applies a mosaic text watermark", async () => {
    const source = await createTestPdf(1);
    const result = await addWatermark(source.buffer as ArrayBuffer, {
      ...BASE_OPTIONS,
      text: "DRAFT",
      mosaic: true,
    });
    const doc = await PDFDocument.load(result);

    expect(doc.getPageCount()).toBe(1);
  });

  it("requires watermark text for text mode", async () => {
    const source = await createTestPdf(1);

    await expect(
      addWatermark(source.buffer as ArrayBuffer, {
        ...BASE_OPTIONS,
        text: "   ",
      }),
    ).rejects.toThrow("Watermark text is required.");
  });

  it("requires an attached image for image mode", async () => {
    const source = await createTestPdf(1);

    await expect(
      addWatermark(source.buffer as ArrayBuffer, {
        ...BASE_OPTIONS,
        type: "image",
        text: "",
      }),
    ).rejects.toThrow("Attach an image to use as the watermark.");
  });
});
