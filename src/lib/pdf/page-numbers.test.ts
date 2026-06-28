import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { addPageNumbers } from "@/lib/pdf/page-numbers";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("addPageNumbers", () => {
  it("adds page numbers to every page", async () => {
    const source = await createTestPdf(3);
    const result = await addPageNumbers(source.buffer as ArrayBuffer, {
      position: "bottom-center",
      format: "Page {n} of {total}",
      fontSize: 12,
      color: "#000000",
      startNumber: 1,
      margin: 24,
    });
    const doc = await PDFDocument.load(result);

    expect(doc.getPageCount()).toBe(3);
  });
});
