import { PDFDocument } from "pdf-lib";

export class ReorderPagesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReorderPagesError";
  }
}

export async function reorderPages(
  buffer: ArrayBuffer,
  pageOrder: number[],
): Promise<Uint8Array> {
  if (pageOrder.length === 0) {
    throw new ReorderPagesError("At least one page must remain.");
  }

  const source = await PDFDocument.load(buffer);
  const pageCount = source.getPageCount();

  const invalid = pageOrder.find((index) => index < 0 || index >= pageCount);
  if (invalid !== undefined) {
    throw new ReorderPagesError("One or more page references are invalid.");
  }

  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(source, pageOrder);
  copiedPages.forEach((page) => output.addPage(page));
  return output.save();
}

export function buildReorderFilename(originalName: string): string {
  const base = originalName.replace(/\.pdf$/i, "");
  return `${base}-reordered.pdf`;
}
