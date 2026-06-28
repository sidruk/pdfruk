"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  getImageDimensions,
  imageValidationErrorMessage,
  validateImageFile,
} from "@/lib/pdf/validate-image";
import { trackToolComplete } from "@/lib/analytics/track";
import type {
  ImageFile,
  ImagesToPdfWorkerRequest,
  ProcessProgress,
  ProcessResult,
  WorkerMessage,
} from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useImagesToPdf() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      filesRef.current.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, []);

  const addFiles = useCallback(async (incoming: File[]) => {
    setError(null);
    setResult(null);

    const validated: ImageFile[] = [];

    for (const file of incoming) {
      const validation = await validateImageFile(file);
      if (validation) {
        toast.error(imageValidationErrorMessage(validation));
        continue;
      }

      const { width, height } = await getImageDimensions(file);
      validated.push({
        id: createFileId(),
        file,
        name: file.name,
        width,
        height,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (validated.length > 0) {
      setFiles((current) => [...current, ...validated]);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((current) => {
      const removed = current.find((file) => file.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return current.filter((file) => file.id !== id);
    });
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
    setFiles((current) => {
      current.forEach((file) => URL.revokeObjectURL(file.previewUrl));
      return [];
    });
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const process = useCallback(async () => {
    if (files.length === 0) {
      setError("Add at least one image to create a PDF.");
      return;
    }

    setIsProcessing(true);
    setProgress({
      current: 0,
      total: files.length,
      message: "Starting conversion...",
    });
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/images-to-pdf.worker.ts", import.meta.url),
    );
    workerRef.current = worker;

    const images = await Promise.all(
      files.map(async (file) => ({
        buffer: await file.file.arrayBuffer(),
        mimeType: file.file.type,
        name: file.name,
      })),
    );

    const buffers = images.map((image) => image.buffer);

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
      trackToolComplete("jpg-to-pdf");
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      const message = "Conversion failed unexpectedly. Please try again.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    const request: ImagesToPdfWorkerRequest = {
      type: "images-to-pdf",
      images,
    };
    worker.postMessage(request, buffers);
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
    canProcess: files.length >= 1 && !isProcessing,
  };
}
