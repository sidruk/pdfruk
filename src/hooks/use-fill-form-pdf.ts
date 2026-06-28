"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { extractFormFields } from "@/lib/pdf/forms";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import { trackToolComplete } from "@/lib/analytics/track";
import type {
  PdfFile,
  PdfFormField,
  ProcessProgress,
  ProcessResult,
  WorkerMessage,
} from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useFillFormPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [fields, setFields] = useState<PdfFormField[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
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
    setFields([]);
    setIsLoadingFields(true);

    const validation = await validatePdfFile(nextFile);
    if (validation) {
      toast.error(validationErrorMessage(validation));
      setIsLoadingFields(false);
      return;
    }

    try {
      const pageCount = await getPdfPageCount(nextFile);
      const buffer = await nextFile.arrayBuffer();
      const formFields = await extractFormFields(buffer);

      if (formFields.length === 0) {
        toast.error("This PDF has no fillable form fields.");
        setIsLoadingFields(false);
        return;
      }

      setFields(formFields);
      setFile({
        id: createFileId(),
        file: nextFile,
        name: nextFile.name,
        pageCount,
      });
    } catch {
      toast.error("Could not read form fields from this PDF.");
    } finally {
      setIsLoadingFields(false);
    }
  }, []);

  const updateField = useCallback((name: string, value: string | boolean) => {
    setFields((current) =>
      current.map((field) =>
        field.name === name
          ? {
              ...field,
              value: typeof value === "boolean" ? (value ? "true" : "false") : value,
            }
          : field,
      ),
    );
    setResult(null);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setFields([]);
    setResult(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFile(null);
    setFields([]);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const process = useCallback(async () => {
    if (!file || fields.length === 0) {
      setError("Add a PDF with form fields to fill.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: 1, message: "Filling form fields..." });
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/fill-form.worker.ts", import.meta.url),
    );
    workerRef.current = worker;

    const buffer = await file.file.arrayBuffer();
    const fieldValues = fields.map((field) => ({
      name: field.name,
      value:
        field.type === "checkbox"
          ? field.value === "true"
          : field.value,
    }));

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      if (message.type === "error") {
        setError(message.message);
        toast.error(message.message);
        setIsProcessing(false);
        setProgress(null);
        worker.terminate();
        workerRef.current = null;
        return;
      }

      if (message.type === "success") {
        const blob = new Blob([message.data], { type: "application/pdf" });
        setResult({ blob, filename: message.filename });
        trackToolComplete("pdf-forms");
        setIsProcessing(false);
        setProgress(null);
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = () => {
      const message = "Failed to fill form. Please try again.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage(
      {
        type: "fill-form",
        buffer,
        options: { fields: fieldValues },
      },
      [buffer],
    );
  }, [file, fields]);

  return {
    file,
    fields,
    isLoadingFields,
    isProcessing,
    progress,
    result,
    error,
    addFile,
    removeFile,
    updateField,
    process,
    reset,
    canProcess: !!file && fields.length > 0 && !isProcessing && !isLoadingFields,
  };
}
