"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { trackToolComplete } from "@/lib/analytics/track";
import { protectPdf, protectedFilename } from "@/lib/pdf/protect";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import type { PdfFile, ProcessProgress, ProcessResult } from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useProtectPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(false);
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
    setPassword("");
    setConfirmPassword("");
    setAllowPrint(true);
    setAllowCopy(false);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const process = useCallback(async () => {
    if (!file) {
      setError("Add a PDF file to protect.");
      return;
    }

    if (!password) {
      setError("Enter a password.");
      toast.error("Enter a password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: 1, message: "Encrypting PDF..." });
    setError(null);
    setResult(null);

    try {
      const buffer = await file.file.arrayBuffer();
      const protectedBytes = await protectPdf(buffer, password, {
        allowPrint,
        allowCopy,
      });

      const blob = new Blob([new Uint8Array(protectedBytes)], {
        type: "application/pdf",
      });
      setResult({ blob, filename: protectedFilename(file.name) });
      trackToolComplete("protect");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Failed to protect PDF. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [allowCopy, allowPrint, confirmPassword, file, password]);

  return {
    file,
    password,
    confirmPassword,
    allowPrint,
    allowCopy,
    isProcessing,
    progress,
    result,
    error,
    setPassword,
    setConfirmPassword,
    setAllowPrint,
    setAllowCopy,
    addFile,
    removeFile,
    process,
    reset,
    canProcess: !!file && passwordsMatch && !isProcessing,
  };
}
