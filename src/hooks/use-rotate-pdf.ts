"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getPageRotations } from "@/lib/pdf/rotate";
import { normalizeRotation } from "@/lib/pdf/pdf-utils";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import type {
  PdfFile,
  ProcessProgress,
  ProcessResult,
  RotationAngle,
  WorkerMessage,
} from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useRotatePdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [rotations, setRotations] = useState<Record<number, RotationAngle>>({});
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
    const buffer = await nextFile.arrayBuffer();
    const existingRotations = await getPageRotations(buffer);
    const initialRotations = Object.fromEntries(
      existingRotations.map((angle, index) => [index, angle]),
    ) as Record<number, RotationAngle>;

    setRotations(initialRotations);
    setFile({
      id: createFileId(),
      file: nextFile,
      name: nextFile.name,
      pageCount,
    });
  }, []);

  const rotatePage = useCallback((pageIndex: number, delta: 90 | -90) => {
    setRotations((current) => {
      const nextAngle = normalizeRotation((current[pageIndex] ?? 0) + delta);
      return { ...current, [pageIndex]: nextAngle };
    });
    setResult(null);
  }, []);

  const rotateAll = useCallback((delta: 90 | -90) => {
    if (!file) return;

    setRotations((current) => {
      const next: Record<number, RotationAngle> = { ...current };
      for (let index = 0; index < file.pageCount; index += 1) {
        next[index] = normalizeRotation((next[index] ?? 0) + delta);
      }
      return next;
    });
    setResult(null);
  }, [file]);

  const removeFile = useCallback(() => {
    setFile(null);
    setRotations({});
    setResult(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFile(null);
    setRotations({});
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const process = useCallback(async () => {
    if (!file) {
      setError("Add a PDF file to rotate.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: file.pageCount, message: "Starting rotation..." });
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/rotate-pdf.worker.ts", import.meta.url),
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
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      const message = "Rotation failed unexpectedly. Please try again.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage(
      { type: "rotate", buffer, options: { rotations } },
      [buffer],
    );
  }, [file, rotations]);

  return {
    file,
    rotations,
    isProcessing,
    progress,
    result,
    error,
    addFile,
    removeFile,
    rotatePage,
    rotateAll,
    process,
    reset,
    canProcess: !!file && !isProcessing,
  };
}
