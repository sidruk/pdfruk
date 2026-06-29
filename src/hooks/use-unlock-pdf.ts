"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { trackToolComplete } from "@/lib/analytics/track";
import { getPdfPageCount } from "@/lib/pdf/validate";
import type { PdfFile, ProcessProgress, ProcessResult } from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

function unlockedFilename(name: string): string {
  const base = name.replace(/\.pdf$/i, "");
  return `${base}-unlocked.pdf`;
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

    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }

    let pageCount = 0;
    try {
      pageCount = await getPdfPageCount(nextFile);
    } catch {
      toast.error("This file appears corrupted or is not a valid PDF.");
      return;
    }

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

    const formData = new FormData();
    formData.append("file", file.file, file.name);
    formData.append("password", password);

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        const message = payload?.error ?? "Failed to unlock PDF.";
        setError(message);
        toast.error(message);
        return;
      }

      const blob = await response.blob();
      setResult({ blob, filename: unlockedFilename(file.name) });
      trackToolComplete("unlock");
    } catch {
      const message = "Failed to unlock PDF. Please try again.";
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
