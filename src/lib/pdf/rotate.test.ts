import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { rotatePdf } from "@/lib/pdf/rotate";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("rotatePdf", () => {
  it("rotates selected pages", async () => {
    const source = await createTestPdf(2);
    const result = await rotatePdf(source.buffer as ArrayBuffer, {
      rotations: { 0: 90, 1: 180 },
    });
    const doc = await PDFDocument.load(result);

    expect(doc.getPage(0).getRotation().angle).toBe(90);
    expect(doc.getPage(1).getRotation().angle).toBe(180);
  });

  it("leaves unlisted pages unchanged", async () => {
    const source = await createTestPdf(2);
    const result = await rotatePdf(source.buffer as ArrayBuffer, {
      rotations: { 0: 270 },
    });
    const doc = await PDFDocument.load(result);

    expect(doc.getPage(0).getRotation().angle).toBe(270);
    expect(doc.getPage(1).getRotation().angle).toBe(0);
  });
});
