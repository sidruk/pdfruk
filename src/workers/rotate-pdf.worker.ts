import { rotatePdf } from "@/lib/pdf/rotate";
import type { RotateWorkerRequest, WorkerMessage, WorkerSuccessMessage } from "@/types/pdf";

self.onmessage = async (event: MessageEvent<RotateWorkerRequest>) => {
  const { type, buffer, options } = event.data;

  if (type !== "rotate") return;

  try {
    const result = await rotatePdf(buffer, options, (current, total) => {
      const progress: WorkerMessage = {
        type: "progress",
        current,
        total,
        message: `Rotating page ${current} of ${total}...`,
      };
      self.postMessage(progress);
    });

    const data = result.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: "rotated.pdf",
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message: error instanceof Error ? error.message : "Failed to rotate PDF.",
    };
    self.postMessage(message);
  }
};
