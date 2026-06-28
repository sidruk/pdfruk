"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  cropRectToMargins,
  FULL_PAGE_CROP,
  isFullPageCrop,
  isValidCropRect,
} from "@/lib/pdf/crop-utils";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import type {
  CropPageScope,
  CropRect,
  PdfFile,
  ProcessProgress,
  ProcessResult,
  WorkerMessage,
} from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useCropPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(0.75);
  const [scope, setScope] = useState<CropPageScope>("all");
  const [globalCrop, setGlobalCrop] = useState<CropRect>(FULL_PAGE_CROP);
  const [pageCrops, setPageCrops] = useState<Record<number, CropRect>>({});
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

  const getActiveCrop = useCallback((): CropRect => {
    if (scope === "all") {
      return globalCrop;
    }

    return pageCrops[currentPage] ?? FULL_PAGE_CROP;
  }, [currentPage, globalCrop, pageCrops, scope]);

  const setScopeWithMigration = useCallback((nextScope: CropPageScope) => {
    setResult(null);

    setScope((currentScope) => {
      if (currentScope === nextScope) {
        return currentScope;
      }

      if (nextScope === "current") {
        setPageCrops((current) => {
          if (current[currentPage] || isFullPageCrop(globalCrop)) {
            return current;
          }

          return { ...current, [currentPage]: globalCrop };
        });
      } else {
        const nextGlobal = pageCrops[currentPage] ?? globalCrop;
        setGlobalCrop(nextGlobal);
      }

      return nextScope;
    });
  }, [currentPage, globalCrop, pageCrops]);

  const setActiveCrop = useCallback(
    (rect: CropRect) => {
      setResult(null);

      if (scope === "all") {
        setGlobalCrop(rect);
        return;
      }

      setPageCrops((current) => ({ ...current, [currentPage]: rect }));
    },
    [currentPage, scope],
  );

  const addFile = useCallback(async (incoming: File[]) => {
    const nextFile = incoming[0];
    if (!nextFile) return;

    setError(null);
    setResult(null);
    setCurrentPage(0);
    setZoom(0.75);
    setScope("all");
    setGlobalCrop(FULL_PAGE_CROP);
    setPageCrops({});

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
    setCurrentPage(0);
    setZoom(0.75);
    setScope("all");
    setGlobalCrop(FULL_PAGE_CROP);
    setPageCrops({});
    setResult(null);
    setError(null);
  }, []);

  const resetCrop = useCallback(() => {
    setResult(null);

    if (scope === "all") {
      setGlobalCrop(FULL_PAGE_CROP);
      return;
    }

    setPageCrops((current) => {
      const next = { ...current };
      delete next[currentPage];
      return next;
    });
  }, [currentPage, scope]);

  const resetAllCrops = useCallback(() => {
    setResult(null);
    setGlobalCrop(FULL_PAGE_CROP);
    setPageCrops({});
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFile(null);
    setCurrentPage(0);
    setZoom(0.75);
    setScope("all");
    setGlobalCrop(FULL_PAGE_CROP);
    setPageCrops({});
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (!file) return;
      setCurrentPage(Math.max(0, Math.min(pageIndex, file.pageCount - 1)));
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

  const hasValidCrop = useCallback((): boolean => {
    if (scope === "all") {
      return isValidCropRect(globalCrop) && !isFullPageCrop(globalCrop);
    }

    return Object.values(pageCrops).some(
      (rect) => isValidCropRect(rect) && !isFullPageCrop(rect),
    );
  }, [globalCrop, pageCrops, scope]);

  const process = useCallback(async () => {
    if (!file) {
      setError("Add a PDF file to crop.");
      return;
    }

    if (!hasValidCrop()) {
      setError("Select an area to keep before cropping.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: file.pageCount, message: "Cropping pages..." });
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/crop-pdf.worker.ts", import.meta.url),
    );
    workerRef.current = worker;

    const buffer = await file.file.arrayBuffer();

    const options =
      scope === "all"
        ? {
            scope: "all" as const,
            margins: cropRectToMargins(globalCrop),
          }
        : {
            scope: "current" as const,
            margins: cropRectToMargins(FULL_PAGE_CROP),
            pageMargins: Object.fromEntries(
              Object.entries(pageCrops)
                .filter(([, rect]) => !isFullPageCrop(rect))
                .map(([pageIndex, rect]) => [
                  Number(pageIndex),
                  cropRectToMargins(rect),
                ]),
            ),
          };

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
      const message = "Crop failed unexpectedly. Please try again.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({ type: "crop", buffer, options }, [buffer]);
  }, [file, globalCrop, hasValidCrop, pageCrops, scope]);

  return {
    file,
    currentPage,
    zoom,
    scope,
    activeCrop: getActiveCrop(),
    isProcessing,
    progress,
    result,
    error,
    addFile,
    removeFile,
    setScope: setScopeWithMigration,
    setActiveCrop,
    resetCrop,
    resetAllCrops,
    goToPage,
    zoomIn,
    zoomOut,
    fitToWidth,
    process,
    reset,
    canProcess: !!file && !isProcessing && hasValidCrop(),
  };
}
