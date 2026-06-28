"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { compressedFilename } from "@/lib/pdf/compress-presets";
import { trackToolComplete } from "@/lib/analytics/track";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import type {
  CompressPreset,
  PdfFile,
  ProcessProgress,
  ProcessResult,
} from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useCompressPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [preset, setPreset] = useState<CompressPreset>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setFile({
      id: createFileId(),
      file: nextFile,
      name: nextFile.name,
      pageCount,
    });
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setPreset("medium");
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const process = useCallback(async () => {
    if (!file) {
      setError("Add a PDF file to compress.");
      return;
    }

    setIsProcessing(true);
    setProgress({
      current: 0,
      total: 1,
      message: "Uploading and compressing PDF...",
    });
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file.file, file.name);
    formData.append("preset", preset);

    try {
      const response = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        const message = payload?.error ?? "Failed to compress PDF.";
        setError(message);
        toast.error(message);
        return;
      }

      const blob = await response.blob();
      const originalSize = Number(
        response.headers.get("X-Original-Size") ?? file.file.size,
      );
      const compressedSize = Number(
        response.headers.get("X-Compressed-Size") ?? blob.size,
      );

      setResult({
        blob,
        filename: compressedFilename(file.name),
        metadata: {
          originalSize,
          compressedSize,
        },
      });
      trackToolComplete("compress");
    } catch {
      const message = "Compression failed unexpectedly. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [file, preset]);

  return {
    file,
    preset,
    isProcessing,
    progress,
    result,
    error,
    setPreset,
    addFile,
    removeFile,
    process,
    reset,
    canProcess: !!file && !isProcessing,
  };
}
