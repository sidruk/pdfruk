"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { trackToolComplete } from "@/lib/analytics/track";
import { unlockPdf, unlockedFilename, validateUnlockPdfFile } from "@/lib/pdf/unlock";
import type { PdfFile, ProcessProgress, ProcessResult } from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useUnlockPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addFile = useCallback(async (incoming: File[]) => {
    const nextFile = incoming[0];
    if (!nextFile) return;

    setError(null);
    setResult(null);

    const validationError = await validateUnlockPdfFile(nextFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setFile({
      id: createFileId(),
      file: nextFile,
      name: nextFile.name,
      pageCount: 0,
    });
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setPassword("");
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const process = useCallback(async () => {
    if (!file) {
      setError("Add a PDF file to unlock.");
      return;
    }

    if (!password) {
      setError("Enter the PDF password.");
      toast.error("Enter the PDF password.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: 1, message: "Removing password..." });
    setError(null);
    setResult(null);

    try {
      const buffer = await file.file.arrayBuffer();
      const unlockedBytes = await unlockPdf(buffer, password);

      const blob = new Blob([new Uint8Array(unlockedBytes)], {
        type: "application/pdf",
      });
      setResult({ blob, filename: unlockedFilename(file.name) });
      trackToolComplete("unlock");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Failed to unlock PDF. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [file, password]);

  return {
    file,
    password,
    isProcessing,
    progress,
    result,
    error,
    setPassword,
    addFile,
    removeFile,
    process,
    reset,
    canProcess: !!file && password.length > 0 && !isProcessing,
  };
}
