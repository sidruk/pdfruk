import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { protectPdf } from "@/lib/pdf/protect";
import { unlockPdf } from "@/lib/pdf/unlock";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("protectPdf", () => {
  it("encrypts a PDF with the given password", async () => {
    const source = await createTestPdf(1);
    const protectedPdf = await protectPdf(
      source.buffer as ArrayBuffer,
      "secret",
      { allowPrint: true, allowCopy: false },
    );

    await expect(
      PDFDocument.load(protectedPdf, { ignoreEncryption: false }),
    ).rejects.toThrow();

    const unlocked = await unlockPdf(protectedPdf.buffer as ArrayBuffer, "secret");
    const doc = await PDFDocument.load(unlocked);
    expect(doc.getPageCount()).toBe(1);
  });

  it("rejects empty passwords", async () => {
    const source = await createTestPdf(1);
    await expect(
      protectPdf(source.buffer as ArrayBuffer, "   "),
    ).rejects.toThrow("Password is required.");
  });

  it("rejects already encrypted PDFs", async () => {
    const source = await createTestPdf(1);
    const protectedPdf = await protectPdf(
      source.buffer as ArrayBuffer,
      "secret",
    );

    await expect(
      protectPdf(protectedPdf.buffer as ArrayBuffer, "other"),
    ).rejects.toThrow("This PDF is already password-protected.");
  });
});
