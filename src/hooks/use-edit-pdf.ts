"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { inspectPdfFile, validationErrorMessage } from "@/lib/pdf/validate";
import { trackToolComplete } from "@/lib/analytics/track";
import { renderPdfFilePageToDataUrl } from "@/lib/pdf/thumbnails";
import type {
  EditAnnotation,
  EditFontFamily,
  EditTool,
  ImageSourceKind,
  PdfFile,
  ProcessProgress,
  ProcessResult,
  ShapeKind,
  WorkerMessage,
} from "@/types/pdf";

const DEFAULT_COLOR = "#000000";
const DEFAULT_STROKE = 2;
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_FAMILY: EditFontFamily = "helvetica";

function createId(): string {
  return crypto.randomUUID();
}

export function useEditPdf() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState<EditTool>("select");
  const [activeShape, setActiveShape] = useState<ShapeKind>("rectangle");
  const [annotations, setAnnotations] = useState<EditAnnotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STROKE);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [fontFamily, setFontFamily] = useState<EditFontFamily>(DEFAULT_FONT_FAMILY);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
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
    setAnnotations([]);
    setSelectedId(null);
    setCurrentPage(0);
    setActiveTool("select");

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

  const addAnnotation = useCallback((annotation: EditAnnotation) => {
    setAnnotations((current) => [...current, annotation]);
    setSelectedId(annotation.id);
    setResult(null);
  }, []);

  const updateAnnotation = useCallback(
    (id: string, patch: Partial<EditAnnotation>) => {
      setAnnotations((current) =>
        current.map((annotation) =>
          annotation.id === id ? ({ ...annotation, ...patch } as EditAnnotation) : annotation,
        ),
      );
      setResult(null);
    },
    [],
  );

  const setColorWithSelection = useCallback(
    (value: string) => {
      setColor(value);
      if (selectedId) {
        updateAnnotation(selectedId, { color: value });
      }
    },
    [selectedId, updateAnnotation],
  );

  const setStrokeWidthWithSelection = useCallback(
    (value: number) => {
      setStrokeWidth(value);
      if (selectedId) {
        updateAnnotation(selectedId, { strokeWidth: value });
      }
    },
    [selectedId, updateAnnotation],
  );

  const setFontSizeWithSelection = useCallback(
    (value: number) => {
      setFontSize(value);
      if (selectedId) {
        const selected = annotations.find((annotation) => annotation.id === selectedId);
        if (selected?.type === "text") {
          updateAnnotation(selectedId, { fontSize: value });
        }
      }
    },
    [annotations, selectedId, updateAnnotation],
  );

  const setFontFamilyWithSelection = useCallback(
    (value: EditFontFamily) => {
      setFontFamily(value);
      if (selectedId) {
        const selected = annotations.find((annotation) => annotation.id === selectedId);
        if (selected?.type === "text") {
          updateAnnotation(selectedId, { fontFamily: value });
        }
      }
    },
    [annotations, selectedId, updateAnnotation],
  );

  const setBoldWithSelection = useCallback(
    (value: boolean) => {
      setBold(value);
      if (selectedId) {
        const selected = annotations.find((annotation) => annotation.id === selectedId);
        if (selected?.type === "text") {
          updateAnnotation(selectedId, { bold: value });
        }
      }
    },
    [annotations, selectedId, updateAnnotation],
  );

  const setItalicWithSelection = useCallback(
    (value: boolean) => {
      setItalic(value);
      if (selectedId) {
        const selected = annotations.find((annotation) => annotation.id === selectedId);
        if (selected?.type === "text") {
          updateAnnotation(selectedId, { italic: value });
        }
      }
    },
    [annotations, selectedId, updateAnnotation],
  );

  const addImageAnnotation = useCallback(
    (
      imageData: string,
      sourceKind: ImageSourceKind,
      aspectRatio: number,
      pageIndex: number,
    ) => {
      const width = sourceKind === "signature" ? 0.22 : 0.3;
      const height = width / aspectRatio;

      addAnnotation({
        id: createId(),
        type: "image",
        pageIndex,
        x: 0.35,
        y: 0.4,
        width,
        height: Math.min(height, 0.45),
        rotation: 0,
        imageData,
        sourceKind,
        color: DEFAULT_COLOR,
        strokeWidth: DEFAULT_STROKE,
      });
    },
    [addAnnotation],
  );

  const addImageFromFile = useCallback(
    async (file: File, sourceKind: ImageSourceKind, pageIndex: number) => {
      if (
        sourceKind !== "pdf" &&
        !file.type.startsWith("image/") &&
        !/\.(png|jpe?g)$/i.test(file.name)
      ) {
        toast.error("Please upload a PNG or JPG image.");
        return;
      }

      try {
        if (sourceKind === "pdf") {
          const inspection = await inspectPdfFile(file);
          if (!inspection.ok) {
            toast.error(validationErrorMessage(inspection.error));
            return;
          }

          const rendered = await renderPdfFilePageToDataUrl(file, 0, 1);
          addImageAnnotation(
            rendered.dataUrl,
            "pdf",
            rendered.width / rendered.height,
            pageIndex,
          );
          return;
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Failed to read image."));
          reader.readAsDataURL(file);
        });

        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            const image = new Image();
            image.onload = () =>
              resolve({ width: image.naturalWidth, height: image.naturalHeight });
            image.onerror = () => reject(new Error("Failed to load image."));
            image.src = dataUrl;
          },
        );

        addImageAnnotation(
          dataUrl,
          sourceKind,
          dimensions.width / dimensions.height,
          pageIndex,
        );
      } catch {
        toast.error(
          sourceKind === "pdf"
            ? "Could not add PDF page. Please try another file."
            : "Could not add image. Please try another file.",
        );
      }
    },
    [addImageAnnotation],
  );

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

        addImageAnnotation(
          dataUrl,
          "signature",
          dimensions.width / dimensions.height,
          currentPage,
        );
      } catch {
        toast.error("Could not add signature. Please try again.");
      }
    },
    [addImageAnnotation, currentPage],
  );

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((current) => current.filter((annotation) => annotation.id !== id));
    setSelectedId((current) => (current === id ? null : current));
    setResult(null);
  }, []);

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    removeAnnotation(selectedId);
  }, [removeAnnotation, selectedId]);

  const pageAnnotations = annotations.filter(
    (annotation) => annotation.pageIndex === currentPage,
  );

  const selectedAnnotation =
    annotations.find((annotation) => annotation.id === selectedId) ?? null;

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setFile(null);
    setCurrentPage(0);
    setZoom(1);
    setActiveTool("select");
    setActiveShape("rectangle");
    setAnnotations([]);
    setSelectedId(null);
    setColor(DEFAULT_COLOR);
    setStrokeWidth(DEFAULT_STROKE);
    setFontSize(DEFAULT_FONT_SIZE);
    setFontFamily(DEFAULT_FONT_FAMILY);
    setBold(false);
    setItalic(false);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
  }, []);

  const canProcess = !!file && !isProcessing && annotations.length > 0;

  const process = useCallback(async () => {
    if (!file) {
      toast.error("Add a PDF file to edit.");
      return;
    }

    if (annotations.length === 0) {
      toast.error("Add at least one annotation before saving.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: 1, message: "Applying edits..." });
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../workers/edit-pdf.worker.ts", import.meta.url),
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
        toast.error(message.message);
        setIsProcessing(false);
        setProgress(null);
        worker.terminate();
        workerRef.current = null;
        return;
      }

      const blob = new Blob([message.data], { type: "application/pdf" });
      const baseName = file.name.replace(/\.pdf$/i, "");
      setResult({ blob, filename: `${baseName}-edited.pdf` });
      trackToolComplete("edit-pdf");
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      toast.error("Failed to save edits. Please try again.");
      setIsProcessing(false);
      setProgress(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage(
      { type: "edit-pdf", buffer, annotations },
      [buffer],
    );
  }, [annotations, file]);

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
    activeTool,
    activeShape,
    annotations,
    pageAnnotations,
    selectedId,
    selectedAnnotation,
    color,
    strokeWidth,
    fontSize,
    fontFamily,
    bold,
    italic,
    isProcessing,
    progress,
    result,
    setActiveTool,
    setActiveShape,
    setColor: setColorWithSelection,
    setStrokeWidth: setStrokeWidthWithSelection,
    setFontSize: setFontSizeWithSelection,
    setFontFamily: setFontFamilyWithSelection,
    setBold: setBoldWithSelection,
    setItalic: setItalicWithSelection,
    setSelectedId,
    addFile,
    addAnnotation,
    addImageFromFile,
    addSignatureFromDataUrl,
    updateAnnotation,
    removeAnnotation,
    removeSelected,
    goToPage,
    zoomIn,
    zoomOut,
    fitToWidth,
    process,
    reset,
    canProcess,
  };
}
