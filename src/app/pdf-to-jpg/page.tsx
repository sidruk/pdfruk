"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { PdfToImagesOptions } from "@/components/pdf/pdf-to-images-options";
import { ToolShell } from "@/components/tools/tool-shell";
import { usePdfToJpg } from "@/hooks/use-pdf-to-jpg";

export default function PdfToJpgPage() {
  const {
    file,
    scale,
    isProcessing,
    progress,
    result,
    addFile,
    setScale,
    process,
    reset,
    canProcess,
  } = usePdfToJpg();

  return (
    <ToolShell
      title="PDF to Images"
      description="Export every page from your PDF as a PNG image. Single-page PDFs download as one image; multi-page PDFs download as a ZIP."
      accept={PDF_ACCEPT}
      multiple={false}
      onFilesAccepted={(accepted) => void addFile(accepted)}
      showDropzone={!file}
      canProcess={canProcess}
      onProcess={() => void process()}
      isProcessing={isProcessing}
      progress={progress}
      result={result}
      onReset={reset}
      processLabel="Export images"
      dropzoneDisabled={isProcessing}
    >
      {file ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-brand-charcoal dark:text-foreground">
              {file.name}
            </span>
            <span className="mx-2">·</span>
            {file.pageCount} {file.pageCount === 1 ? "page" : "pages"}
          </div>
          <PdfToImagesOptions
            scale={scale}
            disabled={isProcessing}
            onScaleChange={setScale}
          />
        </div>
      ) : null}
    </ToolShell>
  );
}
