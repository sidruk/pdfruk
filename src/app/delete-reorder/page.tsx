"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { DeleteReorderWorkspace } from "@/components/pdf/delete-reorder-workspace";
import { ToolShell } from "@/components/tools/tool-shell";
import { useDeleteReorderPdf } from "@/hooks/use-delete-reorder-pdf";

export default function DeleteReorderPage() {
  const {
    file,
    pageOrder,
    isProcessing,
    progress,
    result,
    addFile,
    removeFile,
    deletePage,
    reorderPages,
    process,
    reset,
    canProcess,
  } = useDeleteReorderPdf();

  return (
    <ToolShell
      title="Delete & Reorder"
      description="Remove unwanted pages and drag to reorder. Processing happens entirely in your browser."
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
      processLabel="Apply changes"
      dropzoneDisabled={isProcessing}
      wide={!!file}
    >
      {file ? (
        <DeleteReorderWorkspace
          file={file}
          pageOrder={pageOrder}
          disabled={isProcessing}
          onReorder={reorderPages}
          onDeletePage={deletePage}
          onRemove={removeFile}
        />
      ) : null}
    </ToolShell>
  );
}
