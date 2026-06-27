import { PDFDocument } from "pdf-lib";

export type MergeProgressCallback = (
  current: number,
  total: number,
) => void;

export async function mergePdfs(
  buffers: ArrayBuffer[],
  onProgress?: MergeProgressCallback,
): Promise<Uint8Array> {
  if (buffers.length === 0) {
    throw new Error("At least one PDF is required to merge.");
  }

  const merged = await PDFDocument.create();
  const total = buffers.length;

  for (let index = 0; index < buffers.length; index += 1) {
    const source = await PDFDocument.load(buffers[index]);
    const pageIndices = source.getPageIndices();
    const copiedPages = await merged.copyPages(source, pageIndices);
    copiedPages.forEach((page) => merged.addPage(page));
    onProgress?.(index + 1, total);
  }

  return merged.save();
}
