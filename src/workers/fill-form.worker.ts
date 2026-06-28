import { fillPdfForm } from "@/lib/pdf/forms";
import type {
  FillFormWorkerRequest,
  WorkerMessage,
  WorkerSuccessMessage,
} from "@/types/pdf";

self.onmessage = async (event: MessageEvent<FillFormWorkerRequest>) => {
  const { type, buffer, options } = event.data;

  if (type !== "fill-form") return;

  try {
    const result = await fillPdfForm(buffer, options);

    const data = result.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: "filled-form.pdf",
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to fill PDF form.",
    };
    self.postMessage(message);
  }
};
