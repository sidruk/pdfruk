import {
  buildReorderFilename,
  reorderPages,
} from "@/lib/pdf/reorder-pages";
import type { DeleteReorderWorkerRequest, WorkerMessage, WorkerSuccessMessage } from "@/types/pdf";

self.onmessage = async (event: MessageEvent<DeleteReorderWorkerRequest>) => {
  const { type, buffer, options } = event.data;

  if (type !== "delete-reorder") return;

  try {
    const total = options.pageOrder.length;
    const progress: WorkerMessage = {
      type: "progress",
      current: 0,
      total,
      message: "Rebuilding PDF...",
    };
    self.postMessage(progress);

    const bytes = await reorderPages(buffer, options.pageOrder);
    const data = bytes.buffer as ArrayBuffer;

    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: buildReorderFilename(options.originalName),
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to reorder PDF pages.",
    };
    self.postMessage(message);
  }
};
