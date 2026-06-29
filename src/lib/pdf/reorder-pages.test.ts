import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { reorderPages } from "@/lib/pdf/reorder-pages";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("reorderPages", () => {
  it("reorders pages", async () => {
    const source = await createTestPdf(3);
    const result = await reorderPages(source.buffer as ArrayBuffer, [2, 0, 1]);
    const doc = await PDFDocument.load(result);

    expect(doc.getPageCount()).toBe(3);
  });

  it("removes pages when given a subset", async () => {
    const source = await createTestPdf(4);
    const result = await reorderPages(source.buffer as ArrayBuffer, [0, 3]);
    const doc = await PDFDocument.load(result);

    expect(doc.getPageCount()).toBe(2);
  });

  it("rejects empty page order", async () => {
    const source = await createTestPdf(2);
    await expect(
      reorderPages(source.buffer as ArrayBuffer, []),
    ).rejects.toThrow("At least one page must remain.");
  });
});
