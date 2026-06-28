"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  applyRangeFieldChange,
  buildFixedRanges,
  createRangeEntry,
  hasValidRanges,
  rangesToString,
  type PageRangeEntry,
} from "@/lib/pdf/range-entries";
import { getPdfPageCount, validatePdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import { trackToolComplete } from "@/lib/analytics/track";
import type {
  PdfFile,
  ProcessProgress,
  ProcessResult,
  RangeMode,
  SplitMode,
  SplitTab,
  WorkerMessage,
} from "@/types/pdf";

function createFileId(): string {
  return crypto.randomUUID();
}

export function useSplitPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [tab, setTab] = useState<SplitTab>("range");
  const [rangeMode, setRangeMode] = useState<RangeMode>("custom");
  const [rangeEntries, setRangeEntries] = useState<PageRangeEntry[]>([
    createRangeEntry(1, 3),
  ]);
  const [fixedPagesPerRange, setFixedPagesPerRange] = useState(1);
  const [mergeRanges, setMergeRanges] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const mode: SplitMode = tab === "pages" ? "extract" : "range";

  const ranges = useMemo(() => rangesToString(rangeEntries), [rangeEntries]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!file || rangeMode !== "fixed") return;
    setRangeEntries(buildFixedRanges(file.pageCount, fixedPagesPerRange));
  }, [file, rangeMode, fixedPagesPerRange]);

  const addFile = useCallback(async (incoming: File[]) => {
    const nextFile = incoming[0];
    if (!nextFile) return;

    setError(null);
    setResult(null);
    setSelectedPages([]);
    setTab("range");
    setRangeMode("custom");

    const validation = await validatePdfFile(nextFile);
    if (validation) {
      toast.error(validationErrorMessage(validation));
      return;
    }

    const pageCount = await getPdfPageCount(nextFile);
    setRangeEntries([createRangeEntry(1, pageCount)]);
    setFile({
      id: createFileId(),
      file: nextFile,
      name: nextFile.name,
      pageCount,
    });
  }, []);

  const updateRangeEntry = useCallback(
    (id: string, field: "from" | "to", value: number) => {
      if (!file) return;

      setRangeEntries((current) =>
        current.map((entry) =>
          entry.id === id
            ? applyRangeFieldChange(entry, field, value, file.pageCount)
            : entry,
        ),
      );
      setResult(null);
    },
    [file],
  );

  const addRangeEntry = useCallback(() => {
    if (!file) return;
    setRangeEntries((current) => {
      const last = current[current.length - 1];
      const nextFrom = last ? Math.min(last.to + 1, file.pageCount) : 1;
      return [...current, createRangeEntry(nextFrom, file.pageCount)];
    });
    setResult(null);
  }, [file]);

  const removeRangeEntry = useCallback((id: string) => {
    setRangeEntries((current) =>
      current.length > 1 ? current.filter((entry) => entry.id !== id) : current,
    );
    setResult(null);
  }, []);

  const handleRangeModeChange = useCallback(
    (nextMode: RangeMode) => {
      setRangeMode(nextMode);
      if (nextMode === "fixed" && file) {
        setRangeEntries(buildFixedRanges(file.pageCount, fixedPagesPerRange));
      }
      setResult(null);
    },
    [file, fixedPagesPerRange],
  );

  const togglePage = useCallback((pageIndex: number) => {
    setSelectedPages((current) => {
      if (current.includes(pageIndex)) {
        return current.filter((page) => page !== pageIndex);
      }
      return [...current, pageIndex].sort((a, b) => a - b);
    });
    setResult(null);
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFile(null);
    setTab("range");
    setRangeMode("custom");
    setRangeEntries([createRangeEntry(1, 3)]);
    setFixedPagesPerRange(1);
    setMergeRanges(false);
    setSelectedPages([]);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  const canProcess =
    !!file &&
    !isProcessing &&
    tab !== "size" &&
    rangeMode !== "smart" &&
    ((tab === "range" &&
      hasValidRanges(rangeEntries, file.pageCount)) ||
      (tab === "pages" && selectedPages.length > 0));

  const process = useCallback(async () => {
    if (!file) {
      setError("Add a PDF file to split.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: 1, message: "Preparing split..." });
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/split-pdf.worker.ts", import.meta.url),
    );
    workerRef.current = worker;

    const buffer = await file.file.arrayBuffer();
    const rangeSegments = rangeEntries.map((entry) =>
      entry.from === entry.to ? `${entry.from}` : `${entry.from}-${entry.to}`,
    );
    const options =
      mode === "range"
        ? {
            mode: "range" as const,
            ranges,
            rangeSegments,
            mergeRanges,
          }
        : { mode: "extract" as const, selectedPages };

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

      const blob = new Blob([message.data], {
        type: message.contentType ?? "application/pdf",
      });
      setResult({ blob, filename: message.filename });
      trackToolComplete("split");
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      const message = "Split failed unexpectedly. Please try again.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({ type: "split", buffer, options }, [buffer]);
  }, [file, mode, ranges, rangeEntries, mergeRanges, selectedPages]);

  return {
    file,
    tab,
    rangeMode,
    rangeEntries,
    fixedPagesPerRange,
    mergeRanges,
    selectedPages,
    isProcessing,
    progress,
    result,
    error,
    setTab,
    setRangeMode: handleRangeModeChange,
    updateRangeEntry,
    addRangeEntry,
    removeRangeEntry,
    setFixedPagesPerRange,
    setMergeRanges,
    togglePage,
    addFile,
    process,
    reset,
    canProcess,
  };
}
