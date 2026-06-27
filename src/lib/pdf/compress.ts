import { PDFDocument } from "pdf-lib";

import type { CompressSettings } from "@/lib/pdf/compress-presets";

export type CompressProgressCallback = (
  current: number,
  total: number,
) => void;

let pdfJsWorkerConfigured = false;

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");

  if (!pdfJsWorkerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfJsWorkerConfigured = true;
  }

  return pdfjs;
}

type RenderCanvas = OffscreenCanvas | HTMLCanvasElement;

function createRenderCanvas(width: number, height: number): RenderCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  throw new Error("Canvas is not available in this environment.");
}

async function canvasToJpeg(
  canvas: RenderCanvas,
  quality: number,
): Promise<Uint8Array> {
  const blob =
    canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: "image/jpeg", quality })
      : await new Promise<Blob>((resolve, reject) => {
          (canvas as HTMLCanvasElement).toBlob(
            (value) => {
              if (!value) {
                reject(new Error("Failed to encode JPEG."));
                return;
              }
              resolve(value);
            },
            "image/jpeg",
            quality,
          );
        });

  return new Uint8Array(await blob.arrayBuffer());
}

export async function compressPdf(
  buffer: ArrayBuffer,
  settings: CompressSettings,
  onProgress?: CompressProgressCallback,
): Promise<Uint8Array> {
  if (buffer.byteLength === 0) {
    throw new Error("A valid PDF file is required to compress.");
  }

  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const source = await loadingTask.promise;
  const output = await PDFDocument.create();
  const total = source.numPages;

  for (let pageIndex = 0; pageIndex < total; pageIndex += 1) {
    const page = await source.getPage(pageIndex + 1);
    const pageViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale: settings.scale });
    const canvas = createRenderCanvas(
      renderViewport.width,
      renderViewport.height,
    );
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context for compression.");
    }

    await page.render({
      canvasContext: context as CanvasRenderingContext2D,
      viewport: renderViewport,
      canvas: canvas as HTMLCanvasElement,
    }).promise;

    const jpegBytes = await canvasToJpeg(canvas, settings.jpegQuality);
    const image = await output.embedJpg(jpegBytes);
    const pdfPage = output.addPage([pageViewport.width, pageViewport.height]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: pageViewport.width,
      height: pageViewport.height,
    });

    onProgress?.(pageIndex + 1, total);
  }

  return output.save({ useObjectStreams: true });
}
