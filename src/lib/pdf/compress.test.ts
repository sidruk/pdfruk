import { describe, expect, it } from "vitest";

import {
  COMPRESS_PRESETS,
  compressedFilename,
} from "@/lib/pdf/compress-presets";

describe("compress presets", () => {
  it("defines ghostscript profiles for each preset", () => {
    expect(COMPRESS_PRESETS.low.ghostscriptProfile).toBe("/screen");
    expect(COMPRESS_PRESETS.medium.ghostscriptProfile).toBe("/ebook");
    expect(COMPRESS_PRESETS.high.ghostscriptProfile).toBe("/printer");
  });

  it("builds a compressed filename", () => {
    expect(compressedFilename("report.pdf")).toBe("report-compressed.pdf");
    expect(compressedFilename("scan.PDF")).toBe("scan-compressed.pdf");
  });
});
