import { addPageNumbers } from "@/lib/pdf/page-numbers";
import type {
  PageNumbersWorkerRequest,
  WorkerMessage,
  WorkerSuccessMessage,
} from "@/types/pdf";

self.onmessage = async (event: MessageEvent<PageNumbersWorkerRequest>) => {
  const { type, buffer, options } = event.data;

  if (type !== "page-numbers") return;

  try {
    const result = await addPageNumbers(buffer, options, (current, total) => {
      const progress: WorkerMessage = {
        type: "progress",
        current,
        total,
        message: `Adding numbers to page ${current} of ${total}...`,
      };
      self.postMessage(progress);
    });

    const data = result.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: "numbered.pdf",
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to add page numbers.",
    };
    self.postMessage(message);
  }
};
