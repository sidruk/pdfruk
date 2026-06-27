import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import {
  SplitRangeError,
  parsePageRanges,
  splitPdf,
} from "@/lib/pdf/split";
import { createTestPdf } from "@/lib/pdf/test-helpers";

describe("parsePageRanges", () => {
  it("parses single pages and ranges", () => {
    expect(parsePageRanges("1-2, 5, 7-9", 10)).toEqual([0, 1, 4, 6, 7, 8]);
  });

  it("throws for invalid ranges", () => {
    expect(() => parsePageRanges("abc", 5)).toThrow(SplitRangeError);
    expect(() => parsePageRanges("1-10", 5)).toThrow(SplitRangeError);
  });
});

describe("splitPdf", () => {
  it("extracts selected pages", async () => {
    const source = await createTestPdf(5);
    const { bytes } = await splitPdf(source.buffer as ArrayBuffer, {
      mode: "extract",
      selectedPages: [0, 2, 4],
    });

    const result = await PDFDocument.load(bytes);
    expect(result.getPageCount()).toBe(3);
  });

  it("extracts pages by range", async () => {
    const source = await createTestPdf(5);
    const { bytes } = await splitPdf(source.buffer as ArrayBuffer, {
      mode: "range",
      ranges: "1-2",
      rangeSegments: ["1-2"],
      mergeRanges: true,
    });

    const result = await PDFDocument.load(bytes);
    expect(result.getPageCount()).toBe(2);
  });

  it("creates a zip for multiple ranges when merge is off", async () => {
    const source = await createTestPdf(5);
    const { bytes, filename, contentType } = await splitPdf(
      source.buffer as ArrayBuffer,
      {
        mode: "range",
        ranges: "1-2, 4-5",
        rangeSegments: ["1-2", "4-5"],
        mergeRanges: false,
      },
    );

    expect(filename).toBe("split-pages.zip");
    expect(contentType).toBe("application/zip");
    expect(bytes.length).toBeGreaterThan(0);
  });

  it("merges multiple ranges into one pdf when merge is on", async () => {
    const source = await createTestPdf(5);
    const { bytes, contentType } = await splitPdf(source.buffer as ArrayBuffer, {
      mode: "range",
      ranges: "1-2, 4-5",
      rangeSegments: ["1-2", "4-5"],
      mergeRanges: true,
    });

    expect(contentType).toBe("application/pdf");
    const result = await PDFDocument.load(bytes);
    expect(result.getPageCount()).toBe(4);
  });

  it("throws when extract mode has no pages", async () => {
    const source = await createTestPdf(3);

    await expect(
      splitPdf(source.buffer as ArrayBuffer, {
        mode: "extract",
        selectedPages: [],
      }),
    ).rejects.toThrow(SplitRangeError);
  });
});
