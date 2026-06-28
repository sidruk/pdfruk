"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { PdfToImagesScale } from "@/lib/pdf/pdf-to-images";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import { trackToolComplete } from "@/lib/analytics/track";
import type {
  PdfFile,
  PdfToImagesWorkerRequest,
  ProcessProgress,
  ProcessResult,
  WorkerMessage,
} from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function usePdfToJpg() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [scale, setScale] = useState<PdfToImagesScale>(1.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const addFile = useCallback(async (incoming: File[]) => {
    const selected = incoming[0];
    if (!selected) return;

    setError(null);
    setResult(null);

    const validation = await validatePdfFile(selected);
    if (validation) {
      toast.error(validationErrorMessage(validation));
      return;
    }

    const pageCount = await getPdfPageCount(selected);
    setFile({
      id: createFileId(),
      file: selected,
      name: selected.name,
      pageCount,
    });
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFile(null);
    setScale(1.5);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const process = useCallback(async () => {
    if (!file) {
      setError("Add a PDF file to convert.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: file.pageCount, message: "Starting export..." });
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/pdf-to-jpg.worker.ts", import.meta.url),
    );
    workerRef.current = worker;

    const buffer = await file.file.arrayBuffer();

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      if (message.type === "progress") {
        setProgress({
          current: message.current,
          total: message.total,
          message: message.message,
        });
        return;
      }

      if (message.type === "error") {
        setError(message.message);
        toast.error(message.message);
        setIsProcessing(false);
        setProgress(null);
        worker.terminate();
        workerRef.current = null;
        return;
      }

      const blob = new Blob([message.data], {
        type: message.contentType ?? "image/png",
      });
      setResult({ blob, filename: message.filename });
      trackToolComplete("pdf-to-jpg");
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      const message = "PDF to image conversion failed unexpectedly. Please try again.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    const request: PdfToImagesWorkerRequest = {
      type: "pdf-to-jpg",
      buffer,
      pdfName: file.name,
      options: { scale },
    };
    worker.postMessage(request);
  }, [file, scale]);

  return {
    file,
    scale,
    isProcessing,
    progress,
    result,
    error,
    addFile,
    setScale,
    process,
    reset,
    canProcess: Boolean(file) && !isProcessing,
  };
}
