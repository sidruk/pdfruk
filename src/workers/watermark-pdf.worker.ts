import { addWatermark } from "@/lib/pdf/watermark";
import type {
  WatermarkWorkerRequest,
  WorkerMessage,
  WorkerSuccessMessage,
} from "@/types/pdf";

self.onmessage = async (event: MessageEvent<WatermarkWorkerRequest>) => {
  const { type, buffer, options } = event.data;

  if (type !== "watermark") return;

  try {
    const result = await addWatermark(buffer, options, (current, total) => {
      const progress: WorkerMessage = {
        type: "progress",
        current,
        total,
        message: `Adding watermark to page ${current} of ${total}...`,
      };
      self.postMessage(progress);
    });

    const data = result.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: "watermarked.pdf",
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to add watermark.",
    };
    self.postMessage(message);
  }
};
