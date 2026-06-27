import { mergePdfs } from "@/lib/pdf/merge";
import type {
  MergeWorkerRequest,
  WorkerMessage,
  WorkerSuccessMessage,
} from "@/types/pdf";

self.onmessage = async (event: MessageEvent<MergeWorkerRequest>) => {
  const { type, buffers } = event.data;

  if (type !== "merge") return;

  try {
    const result = await mergePdfs(buffers, (current, total) => {
      const progress: WorkerMessage = {
        type: "progress",
        current,
        total,
        message: `Merging file ${current} of ${total}...`,
      };
      self.postMessage(progress);
    });

    const data = result.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: "merged.pdf",
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to merge PDFs.",
    };
    self.postMessage(message);
  }
};
