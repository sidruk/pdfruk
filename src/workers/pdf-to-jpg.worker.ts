import { pdfToImages } from "@/lib/pdf/pdf-to-images";
import type {
  PdfToImagesWorkerRequest,
  WorkerMessage,
  WorkerSuccessMessage,
} from "@/types/pdf";

self.onmessage = async (event: MessageEvent<PdfToImagesWorkerRequest>) => {
  const { type, buffer, pdfName, options } = event.data;

  if (type !== "pdf-to-jpg") return;

  try {
    const result = await pdfToImages(buffer, pdfName, options, (current, total) => {
      const progress: WorkerMessage = {
        type: "progress",
        current,
        total,
        message: `Exporting page ${current} of ${total}...`,
      };
      self.postMessage(progress);
    });

    const success: WorkerSuccessMessage = {
      type: "success",
      data: result.buffer.buffer as ArrayBuffer,
      filename: result.filename,
      contentType: result.contentType,
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to convert PDF to images.",
    };
    self.postMessage(message);
  }
};
