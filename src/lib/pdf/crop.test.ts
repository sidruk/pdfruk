import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { cropPdf, marginsToCropBox } from "@/lib/pdf/crop";
import {
  cropRectToMargins,
  FULL_PAGE_CROP,
  isFullPageCrop,
  marginsToCropRect,
} from "@/lib/pdf/crop-utils";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("cropPdf", () => {
  it("crops all pages using margin percentages", async () => {
    const source = await createTestPdf(2);
    const result = await cropPdf(source.buffer as ArrayBuffer, {
      scope: "all",
      margins: { top: 0.1, right: 0.1, bottom: 0.1, left: 0.1 },
    });
    const doc = await PDFDocument.load(result);
    const page = doc.getPage(0);
    const crop = page.getCropBox();

    expect(crop.width).toBeCloseTo(320, 0);
    expect(crop.height).toBeCloseTo(400, 0);
  });

  it("crops only selected pages in current-page mode", async () => {
    const source = await createTestPdf(2);
    const result = await cropPdf(source.buffer as ArrayBuffer, {
      scope: "current",
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      pageMargins: {
        0: { top: 0.1, right: 0.1, bottom: 0.1, left: 0.1 },
      },
    });
    const doc = await PDFDocument.load(result);
    const firstPage = doc.getPage(0).getCropBox();
    const secondPage = doc.getPage(1).getSize();

    expect(firstPage.width).toBeCloseTo(320, 0);
    expect(secondPage.width).toBeCloseTo(400, 0);
  });

  it("rejects invalid margins", async () => {
    const source = await createTestPdf(1);

    await expect(
      cropPdf(source.buffer as ArrayBuffer, {
        scope: "all",
        margins: { top: 0.6, right: 0, bottom: 0.6, left: 0 },
      }),
    ).rejects.toThrow("Crop margins remove the entire page.");
  });
});

describe("marginsToCropBox", () => {
  it("converts normalized margins to a crop box", () => {
    const box = marginsToCropBox(400, 500, {
      top: 0.1,
      right: 0.2,
      bottom: 0.1,
      left: 0.2,
    });

    expect(box.x).toBe(80);
    expect(box.y).toBe(50);
    expect(box.width).toBeCloseTo(240, 0);
    expect(box.height).toBe(400);
  });
});

describe("crop utils", () => {
  it("converts between crop rects and margins", () => {
    const rect = { x: 0.1, y: 0.2, width: 0.7, height: 0.6 };
    const margins = cropRectToMargins(rect);

    expect(marginsToCropRect(margins)).toEqual({
      x: 0.1,
      y: 0.2,
      width: 0.7,
      height: 0.6,
    });
  });

  it("detects a full-page crop", () => {
    expect(isFullPageCrop(FULL_PAGE_CROP)).toBe(true);
    expect(isFullPageCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })).toBe(
      false,
    );
  });
});
