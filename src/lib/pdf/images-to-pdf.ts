import { PDFDocument } from "pdf-lib";

export type ImageInput = {
  buffer: ArrayBuffer;
  mimeType: string;
  name: string;
};

export type ImagesToPdfProgressCallback = (
  current: number,
  total: number,
) => void;

function isPng(mimeType: string, name: string): boolean {
  if (mimeType === "image/png") return true;
  return name.toLowerCase().endsWith(".png");
}

export async function imagesToPdf(
  images: ImageInput[],
  onProgress?: ImagesToPdfProgressCallback,
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error("At least one image is required.");
  }

  const doc = await PDFDocument.create();
  const total = images.length;

  for (let index = 0; index < images.length; index += 1) {
    const { buffer, mimeType, name } = images[index];
    const bytes = new Uint8Array(buffer);

    const image = isPng(mimeType, name)
      ? await doc.embedPng(bytes)
      : await doc.embedJpg(bytes);

    const { width, height } = image.scale(1);
    const page = doc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });

    onProgress?.(index + 1, total);
  }

  return doc.save();
}
