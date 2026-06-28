import { imagesToPdf } from "@/lib/pdf/images-to-pdf";
import type {
  ImagesToPdfWorkerRequest,
  WorkerMessage,
  WorkerSuccessMessage,
} from "@/types/pdf";

self.onmessage = async (event: MessageEvent<ImagesToPdfWorkerRequest>) => {
  const { type, images } = event.data;

  if (type !== "images-to-pdf") return;

  try {
    const result = await imagesToPdf(images, (current, total) => {
      const progress: WorkerMessage = {
        type: "progress",
        current,
        total,
        message: `Adding image ${current} of ${total}...`,
      };
      self.postMessage(progress);
    });

    const data = result.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: "images.pdf",
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to create PDF from images.",
    };
    self.postMessage(message);
  }
};
