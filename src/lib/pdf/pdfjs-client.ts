import type { PDFDocumentProxy } from "pdfjs-dist";

type PdfJsModule = typeof import("pdfjs-dist/build/pdf.mjs");

let pdfjsPromise: Promise<PdfJsModule> | null = null;
let workerConfigured = false;

function isDedicatedWorker(): boolean {
  return typeof window === "undefined" && typeof self !== "undefined";
}

export async function getPdfJs(): Promise<PdfJsModule> {
  if (typeof window === "undefined" && !isDedicatedWorker()) {
    throw new Error("PDF.js is only available in the browser.");
  }

  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/build/pdf.mjs");
  }

  const pdfjs = await pdfjsPromise;

  if (!workerConfigured) {
    if (isDedicatedWorker()) {
      // Avoid spawning a nested worker from inside a dedicated worker.
      pdfjs.GlobalWorkerOptions.workerSrc = "";
    } else {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }
    workerConfigured = true;
  }

  return pdfjs;
}

export async function loadPdfDocument(
  data: ArrayBuffer,
): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(data),
    useWorkerFetch: false,
  });
  return loadingTask.promise;
}
