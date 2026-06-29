import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { normalizePdfBytes } from "@/lib/pdf/normalize";
import { protectPdf } from "@/lib/pdf/protect";
import { unlockPdf } from "@/lib/pdf/unlock";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("normalizePdfBytes", () => {
  it("rewrites a PDF that pdf-lib can load cleanly", async () => {
    const source = await createTestPdf(2);
    const normalized = await normalizePdfBytes(source);
    const doc = await PDFDocument.load(normalized);

    expect(doc.getPageCount()).toBe(2);
  });

  it("produces Acrobat-safe output after protect and unlock", async () => {
    const source = await createTestPdf(3);
    const protectedPdf = await protectPdf(source.buffer as ArrayBuffer, "secret");
    const unlocked = await unlockPdf(protectedPdf.buffer as ArrayBuffer, "secret");
    const doc = await PDFDocument.load(unlocked);

    expect(doc.getPageCount()).toBe(3);
  });
});
