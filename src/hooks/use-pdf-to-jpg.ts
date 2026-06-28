"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  pdfToImages,
  type PdfToImagesFormat,
  type PdfToImagesScale,
} from "@/lib/pdf/pdf-to-images";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import { trackToolComplete } from "@/lib/analytics/track";
import type { PdfFile, ProcessProgress, ProcessResult } from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function usePdfToJpg() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [scale, setScale] = useState<PdfToImagesScale>(3);
  const [format, setFormat] = useState<PdfToImagesFormat>("png");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setFile(null);
    setScale(3);
    setFormat("png");
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

    try {
      const buffer = await file.file.arrayBuffer();
      const exportResult = await pdfToImages(
        buffer,
        file.name,
        { scale, format },
        (current, total) => {
          setProgress({
            current,
            total,
            message: `Exporting page ${current} of ${total}...`,
          });
        },
      );

      setResult({
        blob: new Blob([new Uint8Array(exportResult.buffer)], {
          type: exportResult.contentType,
        }),
        filename: exportResult.filename,
      });
      trackToolComplete("pdf-to-jpg");
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "PDF to image conversion failed unexpectedly. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [file, format, scale]);

  return {
    file,
    scale,
    format,
    isProcessing,
    progress,
    result,
    error,
    addFile,
    setScale,
    setFormat,
    process,
    reset,
    canProcess: Boolean(file) && !isProcessing,
  };
}
