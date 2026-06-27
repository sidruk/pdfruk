import { describe, expect, it } from "vitest";

import {
  COMPRESS_PRESETS,
  compressedFilename,
  resolveCompressSettings,
} from "@/lib/pdf/compress-presets";
import { compressPdf } from "@/lib/pdf/compress";

describe("compress presets", () => {
  it("returns settings for each preset", () => {
    expect(resolveCompressSettings("low")).toEqual({
      scale: COMPRESS_PRESETS.low.scale,
      jpegQuality: COMPRESS_PRESETS.low.jpegQuality,
    });
    expect(resolveCompressSettings("medium")).toEqual({
      scale: COMPRESS_PRESETS.medium.scale,
      jpegQuality: COMPRESS_PRESETS.medium.jpegQuality,
    });
    expect(resolveCompressSettings("high")).toEqual({
      scale: COMPRESS_PRESETS.high.scale,
      jpegQuality: COMPRESS_PRESETS.high.jpegQuality,
    });
  });

  it("builds a compressed filename", () => {
    expect(compressedFilename("report.pdf")).toBe("report-compressed.pdf");
    expect(compressedFilename("scan.PDF")).toBe("scan-compressed.pdf");
  });
});

describe("compressPdf", () => {
  it("throws when the buffer is empty", async () => {
    await expect(
      compressPdf(new ArrayBuffer(0), resolveCompressSettings("medium")),
    ).rejects.toThrow("A valid PDF file is required to compress.");
  });
});
