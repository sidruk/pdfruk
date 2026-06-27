import { compressPdf } from "@/lib/pdf/compress";
import {
  compressedFilename,
  resolveCompressSettings,
} from "@/lib/pdf/compress-presets";
import type {
  CompressWorkerRequest,
  WorkerMessage,
  WorkerSuccessMessage,
} from "@/types/pdf";

self.onmessage = async (event: MessageEvent<CompressWorkerRequest>) => {
  const { type, buffer, preset, originalName, originalSize } = event.data;

  if (type !== "compress") return;

  try {
    const settings = resolveCompressSettings(preset);
    const result = await compressPdf(buffer, settings, (current, total) => {
      const progress: WorkerMessage = {
        type: "progress",
        current,
        total,
        message: `Compressing page ${current} of ${total}...`,
      };
      self.postMessage(progress);
    });

    const data = result.buffer as ArrayBuffer;
    const success: WorkerSuccessMessage = {
      type: "success",
      data,
      filename: compressedFilename(originalName),
      metadata: {
        originalSize,
        compressedSize: data.byteLength,
      },
    };
    self.postMessage(success);
  } catch (error) {
    const message: WorkerMessage = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to compress PDF.",
    };
    self.postMessage(message);
  }
};
