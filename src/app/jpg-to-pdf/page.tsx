"use client";

import { SortableImageList } from "@/components/pdf/sortable-image-list";
import { ToolShell } from "@/components/tools/tool-shell";
import { useImagesToPdf } from "@/hooks/use-images-to-pdf";
import { IMAGE_ACCEPT } from "@/lib/pdf/constants";

export default function JpgToPdfPage() {
  const {
    files,
    isProcessing,
    progress,
    result,
    addFiles,
    removeFile,
    reorderFiles,
    process,
    reset,
    canProcess,
  } = useImagesToPdf();

  return (
    <ToolShell
      title="Images to PDF"
      description="Convert JPG and PNG images into a single PDF. Drag images to set the page order."
      accept={IMAGE_ACCEPT}
      multiple
      onFilesAccepted={(accepted) => void addFiles(accepted)}
      dropzoneSelectLabel="Choose images"
      canProcess={canProcess}
      onProcess={() => void process()}
      isProcessing={isProcessing}
      progress={progress}
      result={result}
      onReset={reset}
      processLabel="Create PDF"
      dropzoneDisabled={isProcessing}
    >
      <SortableImageList
        files={files}
        onReorder={reorderFiles}
        onRemove={removeFile}
      />
    </ToolShell>
  );
}
