import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { mergePdfs } from "@/lib/pdf/merge";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("mergePdfs", () => {
  it("merges two single-page PDFs into one document with two pages", async () => {
    const first = await createTestPdf(1);
    const second = await createTestPdf(1);

    const mergedBytes = await mergePdfs([
      first.buffer as ArrayBuffer,
      second.buffer as ArrayBuffer,
    ]);

    const merged = await PDFDocument.load(mergedBytes);
    expect(merged.getPageCount()).toBe(2);
  });

  it("reports progress while merging", async () => {
    const first = await createTestPdf(1);
    const second = await createTestPdf(1);
    const progress: Array<{ current: number; total: number }> = [];

    await mergePdfs(
      [first.buffer as ArrayBuffer, second.buffer as ArrayBuffer],
      (current, total) => {
        progress.push({ current, total });
      },
    );

    expect(progress).toEqual([
      { current: 1, total: 2 },
      { current: 2, total: 2 },
    ]);
  });

  it("throws when no PDFs are provided", async () => {
    await expect(mergePdfs([])).rejects.toThrow(
      "At least one PDF is required to merge.",
    );
  });
});
