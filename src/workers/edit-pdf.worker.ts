import { applyEditAnnotations } from "@/lib/pdf/edit";
import type { EditPdfWorkerRequest, WorkerMessage, WorkerSuccessMessage } from "@/types/pdf";

self.onmessage = async (event: MessageEvent<EditPdfWorkerRequest>) => {
  const { type, buffer, annotations } = event.data;

  if (type !== "edit-pdf") return;

  try {
    const progress: WorkerMessage = {
      type: "progress",
      current: 1,
      total: 2,
      message: "Applying annotations...",
    };
    self.postMessage(progress);

    const bytes = await applyEditAnnotations(buffer, annotations);
    const data = bytes.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: "edited.pdf",
      contentType: "application/pdf",
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to edit PDF.",
    };
    self.postMessage(message);
  }
};
