import { splitPdf } from "@/lib/pdf/split";
import type {
  SplitWorkerRequest,
  WorkerMessage,
  WorkerSuccessMessage,
} from "@/types/pdf";

self.onmessage = async (event: MessageEvent<SplitWorkerRequest>) => {
  const { type, buffer, options } = event.data;

  if (type !== "split") return;

  try {
    const progress: WorkerMessage = {
      type: "progress",
      current: 1,
      total: 2,
      message: "Extracting pages...",
    };
    self.postMessage(progress);

    const { bytes, filename, contentType } = await splitPdf(buffer, options);
    const data = bytes.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename,
      contentType,
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to split PDF.",
    };
    self.postMessage(message);
  }
};
