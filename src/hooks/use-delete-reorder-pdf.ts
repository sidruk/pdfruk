"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { trackToolComplete } from "@/lib/analytics/track";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import type {
  PdfFile,
  ProcessProgress,
  ProcessResult,
  WorkerMessage,
} from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

function createInitialPageOrder(pageCount: number): number[] {
  return Array.from({ length: pageCount }, (_, index) => index);
}

export function useDeleteReorderPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
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
    const nextFile = incoming[0];
    if (!nextFile) return;

    setError(null);
    setResult(null);

    const validation = await validatePdfFile(nextFile);
    if (validation) {
      toast.error(validationErrorMessage(validation));
      return;
    }

    const pageCount = await getPdfPageCount(nextFile);
    setPageOrder(createInitialPageOrder(pageCount));
    setFile({
      id: createFileId(),
      file: nextFile,
      name: nextFile.name,
      pageCount,
    });
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPageOrder([]);
    setResult(null);
    setError(null);
  }, []);

  const deletePage = useCallback((position: number) => {
    setPageOrder((current) => {
      if (current.length <= 1) {
        toast.error("At least one page must remain.");
        return current;
      }
      return current.filter((_, index) => index !== position);
    });
    setResult(null);
  }, []);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPageOrder((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      if (moved === undefined) return current;
      next.splice(toIndex, 0, moved);
      return next;
    });
    setResult(null);
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFile(null);
    setPageOrder([]);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const process = useCallback(async () => {
    if (!file) {
      setError("Add a PDF file first.");
      return;
    }

    if (pageOrder.length === 0) {
      setError("At least one page must remain.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: pageOrder.length, message: "Rebuilding PDF..." });
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/delete-reorder-pdf.worker.ts", import.meta.url),
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

      const blob = new Blob([message.data], { type: "application/pdf" });
      setResult({ blob, filename: message.filename });
      trackToolComplete("delete-reorder");
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      const message = "Failed to reorder PDF. Please try again.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage(
      {
        type: "delete-reorder",
        buffer,
        options: { pageOrder, originalName: file.name },
      },
      [buffer],
    );
  }, [file, pageOrder]);

  const hasChanges =
    !!file &&
    (pageOrder.length !== file.pageCount ||
      pageOrder.some((pageIndex, position) => pageIndex !== position));

  return {
    file,
    pageOrder,
    isProcessing,
    progress,
    result,
    error,
    addFile,
    removeFile,
    deletePage,
    reorderPages,
    process,
    reset,
    canProcess: !!file && pageOrder.length > 0 && hasChanges && !isProcessing,
  };
}
