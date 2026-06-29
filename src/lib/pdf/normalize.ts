import { PDFDocument } from "pdf-lib";

/** Rewrite a PDF through pdf-lib to produce a clean, standards-compliant file. */
export async function normalizePdfBytes(
  data: Uint8Array | ArrayBuffer,
): Promise<Uint8Array> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  return doc.save({ useObjectStreams: false });
}
