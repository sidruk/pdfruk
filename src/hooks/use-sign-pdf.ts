"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { inspectPdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import { trackToolComplete } from "@/lib/analytics/track";
import type {
  EditAnnotation,
  ImageAnnotation,
  PdfFile,
  ProcessProgress,
  ProcessResult,
  WorkerMessage,
} from "@/types/pdf";

function createId(): string {
  return crypto.randomUUID();
}

export function useSignPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [signatures, setSignatures] = useState<ImageAnnotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const addFile = useCallback(async (incoming: File[]) => {
    const nextFile = incoming[0];
    if (!nextFile) return;

    setResult(null);
    setSignatures([]);
    setSelectedId(null);
    setCurrentPage(0);

    const inspection = await inspectPdfFile(nextFile);
    if (!inspection.ok) {
      toast.error(validationErrorMessage(inspection.error));
      return;
    }

    setFile({
      id: createId(),
      file: nextFile,
      name: nextFile.name,
      pageCount: inspection.pageCount,
    });
  }, []);

  const addSignatureFromDataUrl = useCallback(
    async (dataUrl: string) => {
      try {
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            const image = new Image();
            image.onload = () =>
              resolve({ width: image.naturalWidth, height: image.naturalHeight });
            image.onerror = () => reject(new Error("Failed to load signature."));
            image.src = dataUrl;
          },
        );

        const aspectRatio = dimensions.width / dimensions.height;
        const width = 0.22;
        const height = width / aspectRatio;

        const signature: ImageAnnotation = {
          id: createId(),
          type: "image",
          pageIndex: currentPage,
          x: 0.35,
          y: 0.4,
          width,
          height: Math.min(height, 0.45),
          rotation: 0,
          imageData: dataUrl,
          sourceKind: "signature",
          color: "#000000",
          strokeWidth: 2,
        };

        setSignatures((current) => [...current, signature]);
        setSelectedId(signature.id);
        setResult(null);
      } catch {
        toast.error("Could not add signature. Please try again.");
      }
    },
    [currentPage],
  );

  const updateSignature = useCallback(
    (id: string, patch: Partial<ImageAnnotation>) => {
      setSignatures((current) =>
        current.map((signature) =>
          signature.id === id ? { ...signature, ...patch } : signature,
        ),
      );
      setResult(null);
    },
    [],
  );

  const removeSignature = useCallback((id: string) => {
    setSignatures((current) => current.filter((signature) => signature.id !== id));
    setSelectedId((current) => (current === id ? null : current));
    setResult(null);
  }, []);

  const pageSignatures = signatures.filter(
    (signature) => signature.pageIndex === currentPage,
  );

  const selectedSignature =
    signatures.find((signature) => signature.id === selectedId) ?? null;

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFile(null);
    setCurrentPage(0);
    setZoom(1);
    setSignatures([]);
    setSelectedId(null);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
  }, []);

  const canProcess = !!file && !isProcessing && signatures.length > 0;

  const process = useCallback(async () => {
    if (!file) {
      toast.error("Add a PDF file to sign.");
      return;
    }

    if (signatures.length === 0) {
      toast.error("Add at least one signature before saving.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: 1, message: "Applying signatures..." });
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/edit-pdf.worker.ts", import.meta.url),
    );
    workerRef.current = worker;

    const buffer = await file.file.arrayBuffer();
    const annotations: EditAnnotation[] = signatures;

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
        toast.error(message.message);
        setIsProcessing(false);
        setProgress(null);
        worker.terminate();
        workerRef.current = null;
        return;
      }

      const blob = new Blob([message.data], { type: "application/pdf" });
      const baseName = file.name.replace(/\.pdf$/i, "");
      setResult({ blob, filename: `${baseName}-signed.pdf` });
      trackToolComplete("sign-pdf");
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      toast.error("Failed to save signed PDF. Please try again.");
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage(
      { type: "edit-pdf", buffer, annotations },
      [buffer],
    );
  }, [file, signatures]);

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (!file) return;
      setCurrentPage(Math.max(0, Math.min(pageIndex, file.pageCount - 1)));
      setSelectedId(null);
    },
    [file],
  );

  const zoomIn = useCallback(() => {
    setZoom((current) => Math.min(current + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((current) => Math.max(current - 0.25, 0.5));
  }, []);

  const fitToWidth = useCallback((targetZoom: number) => {
    if (!Number.isFinite(targetZoom) || targetZoom <= 0) return;
    setZoom(Math.max(0.5, Math.min(targetZoom, 3)));
  }, []);

  return {
    file,
    currentPage,
    zoom,
    pageSignatures,
    selectedId,
    selectedSignature,
    isProcessing,
    progress,
    result,
    addFile,
    addSignatureFromDataUrl,
    updateSignature,
    removeSignature,
    setSelectedId,
    goToPage,
    zoomIn,
    zoomOut,
    fitToWidth,
    process,
    reset,
    canProcess,
  };
}
