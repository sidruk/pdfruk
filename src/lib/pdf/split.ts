import { zipSync } from "fflate";
import { PDFDocument } from "pdf-lib";

import type { SplitOptions } from "@/types/pdf";

export class SplitRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SplitRangeError";
  }
}

export function parsePageRanges(
  input: string,
  pageCount: number,
): number[] {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new SplitRangeError("Enter at least one page or range.");
  }

  const selected = new Set<number>();
  const parts = trimmed.split(",");

  for (const part of parts) {
    const pageIndices = parseSingleRange(part, pageCount);
    pageIndices.forEach((page) => selected.add(page));
  }

  if (selected.size === 0) {
    throw new SplitRangeError("No valid pages were selected.");
  }

  return Array.from(selected).sort((a, b) => a - b);
}

export function parseSingleRange(
  segment: string,
  pageCount: number,
): number[] {
  const trimmed = segment.trim();
  if (!trimmed) {
    throw new SplitRangeError("Enter at least one page or range.");
  }

  if (trimmed.includes("-")) {
    const [startRaw, endRaw] = trimmed.split("-").map((value) => value.trim());
    const start = Number(startRaw);
    const end = Number(endRaw);

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < 1 ||
      start > end
    ) {
      throw new SplitRangeError(`Invalid range: "${trimmed}"`);
    }

    if (end > pageCount) {
      throw new SplitRangeError(
        `Range "${trimmed}" exceeds document page count (${pageCount}).`,
      );
    }

    const pages: number[] = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page - 1);
    }
    return pages;
  }

  const pageNumber = Number(trimmed);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new SplitRangeError(`Invalid page: "${trimmed}"`);
  }

  if (pageNumber > pageCount) {
    throw new SplitRangeError(
      `Page ${pageNumber} exceeds document page count (${pageCount}).`,
    );
  }

  return [pageNumber - 1];
}

function segmentFilename(segment: string, index: number): string {
  const sanitized = segment.replace(/\s+/g, "");
  return `range-${index + 1}-pages-${sanitized}.pdf`;
}

async function createPdfFromPages(
  source: PDFDocument,
  pageIndices: number[],
): Promise<Uint8Array> {
  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(source, pageIndices);
  copiedPages.forEach((page) => output.addPage(page));
  return output.save();
}

async function splitPdfAsZip(
  source: PDFDocument,
  segments: string[],
  pageCount: number,
): Promise<{ bytes: Uint8Array; filename: string; contentType: string }> {
  const zipEntries: Record<string, Uint8Array> = {};

  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    const pageIndices = parseSingleRange(segment, pageCount);
    const pdfBytes = await createPdfFromPages(source, pageIndices);
    zipEntries[segmentFilename(segment, index)] = pdfBytes;
  }

  const bytes = zipSync(zipEntries);
  return {
    bytes,
    filename: "split-pages.zip",
    contentType: "application/zip",
  };
}

export function buildSplitFilename(
  options: SplitOptions,
  pageCount: number,
): string {
  if (options.mode === "range" && options.ranges) {
    const sanitized = options.ranges.replace(/\s+/g, "").replace(/,/g, "_");
    return `pages-${sanitized}.pdf`;
  }

  if (options.selectedPages && options.selectedPages.length > 0) {
    const labels = options.selectedPages.map((page) => page + 1).join("-");
    return `pages-${labels}.pdf`;
  }

  return `split-${pageCount}-pages.pdf`;
}

export async function splitPdf(
  buffer: ArrayBuffer,
  options: SplitOptions,
): Promise<{ bytes: Uint8Array; filename: string; contentType: string }> {
  const source = await PDFDocument.load(buffer);
  const pageCount = source.getPageCount();

  if (options.mode === "range") {
    if (!options.ranges) {
      throw new SplitRangeError("Enter a page range.");
    }

    const segments =
      options.rangeSegments ??
      options.ranges.split(",").map((part) => part.trim()).filter(Boolean);

    if (!options.mergeRanges && segments.length > 1) {
      return splitPdfAsZip(source, segments, pageCount);
    }

    const pageIndices = parsePageRanges(options.ranges, pageCount);
    const bytes = await createPdfFromPages(source, pageIndices);
    const filename = buildSplitFilename(
      { ...options, selectedPages: pageIndices },
      pageIndices.length,
    );

    return { bytes, filename, contentType: "application/pdf" };
  }

  if (!options.selectedPages || options.selectedPages.length === 0) {
    throw new SplitRangeError("Select at least one page.");
  }

  const invalid = options.selectedPages.find(
    (page) => page < 0 || page >= pageCount,
  );
  if (invalid !== undefined) {
    throw new SplitRangeError("One or more selected pages are invalid.");
  }

  const pageIndices = [...options.selectedPages].sort((a, b) => a - b);
  const bytes = await createPdfFromPages(source, pageIndices);
  const filename = buildSplitFilename(
    { ...options, selectedPages: pageIndices },
    pageIndices.length,
  );

  return { bytes, filename, contentType: "application/pdf" };
}
