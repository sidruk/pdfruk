import { cropPdf } from "@/lib/pdf/crop";
import type { CropWorkerRequest, WorkerMessage, WorkerSuccessMessage } from "@/types/pdf";

self.onmessage = async (event: MessageEvent<CropWorkerRequest>) => {
  const { type, buffer, options } = event.data;

  if (type !== "crop") return;

  try {
    const result = await cropPdf(buffer, options, (current, total) => {
      const progress: WorkerMessage = {
        type: "progress",
        current,
        total,
        message: `Cropping page ${current} of ${total}...`,
      };
      self.postMessage(progress);
    });

    const data = result.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: "cropped.pdf",
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message: error instanceof Error ? error.message : "Failed to crop PDF.",
    };
    self.postMessage(message);
  }
};
