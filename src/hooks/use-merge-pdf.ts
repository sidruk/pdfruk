"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import type { PdfFile, ProcessProgress, ProcessResult, WorkerMessage } from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useMergePdf() {
  const [files, setFiles] = useState<PdfFile[]>([]);
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

  const addFiles = useCallback(async (incoming: File[]) => {
    setError(null);
    setResult(null);

    const validated: PdfFile[] = [];

    for (const file of incoming) {
      const validation = await validatePdfFile(file);
      if (validation) {
        toast.error(validationErrorMessage(validation));
        continue;
      }

      const pageCount = await getPdfPageCount(file);
      validated.push({
        id: createFileId(),
        file,
        name: file.name,
        pageCount,
      });
    }

    if (validated.length > 0) {
      setFiles((current) => [...current, ...validated]);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
    setResult(null);
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return current;
      next.splice(toIndex, 0, moved);
      return next;
    });
    setResult(null);
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFiles([]);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const process = useCallback(async () => {
    if (files.length < 2) {
      setError("Add at least two PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length, message: "Starting merge..." });
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/merge-pdf.worker.ts", import.meta.url),
    );
    workerRef.current = worker;

    const buffers = await Promise.all(
      files.map((file) => file.file.arrayBuffer()),
    );

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
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      const message = "Merge failed unexpectedly. Please try again.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({ type: "merge", buffers }, buffers);
  }, [files]);

  return {
    files,
    isProcessing,
    progress,
    result,
    error,
    addFiles,
    removeFile,
    reorderFiles,
    process,
    reset,
    canProcess: files.length >= 2 && !isProcessing,
  };
}
