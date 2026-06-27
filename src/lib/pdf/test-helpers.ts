import { PDFDocument, StandardFonts } from "pdf-lib";

export async function createTestPdf(pageCount: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let index = 0; index < pageCount; index += 1) {
    const page = doc.addPage([400, 500]);
    page.drawText(`Page ${index + 1}`, {
      x: 50,
      y: 450,
      size: 24,
      font,
    });
  }

  return doc.save();
}
