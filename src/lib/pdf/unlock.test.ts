import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { protectPdf } from "@/lib/pdf/protect";
import { unlockPdf, validateUnlockPdfFile } from "@/lib/pdf/unlock";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("unlockPdf", () => {
  it("removes password protection with the correct password", async () => {
    const source = await createTestPdf(2);
    const protectedPdf = await protectPdf(
      source.buffer as ArrayBuffer,
      "secret",
    );

    const unlocked = await unlockPdf(protectedPdf.buffer as ArrayBuffer, "secret");
    const doc = await PDFDocument.load(unlocked);
    expect(doc.getPageCount()).toBe(2);
  });

  it("rejects incorrect passwords", async () => {
    const source = await createTestPdf(1);
    const protectedPdf = await protectPdf(
      source.buffer as ArrayBuffer,
      "secret",
    );

    await expect(
      unlockPdf(protectedPdf.buffer as ArrayBuffer, "wrong"),
    ).rejects.toThrow("Incorrect password.");
  });

  it("rejects unencrypted PDFs", async () => {
    const source = await createTestPdf(1);
    const file = new File([source], "plain.pdf", { type: "application/pdf" });

    await expect(
      validateUnlockPdfFile(file),
    ).resolves.toBe("This PDF is not password-protected.");
  });
});
