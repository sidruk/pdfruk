"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { SortableFileList } from "@/components/pdf/sortable-file-list";
import { ToolShell } from "@/components/tools/tool-shell";
import { useMergePdf } from "@/hooks/use-merge-pdf";

export default function MergePage() {
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
  } = useMergePdf();

  return (
    <ToolShell
      title="Merge PDF"
      description="Combine multiple PDF files into a single document. Drag files to set the merge order."
      accept={PDF_ACCEPT}
      multiple
      onFilesAccepted={(accepted) => void addFiles(accepted)}
      canProcess={canProcess}
      onProcess={() => void process()}
      isProcessing={isProcessing}
      progress={progress}
      result={result}
      onReset={reset}
      processLabel="Merge PDFs"
      dropzoneDisabled={isProcessing}
    >
      <SortableFileList
        files={files}
        onReorder={reorderFiles}
        onRemove={removeFile}
      />
    </ToolShell>
  );
}
