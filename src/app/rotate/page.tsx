"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { RotateWorkspace } from "@/components/pdf/rotate-workspace";
import { ToolShell } from "@/components/tools/tool-shell";
import { useRotatePdf } from "@/hooks/use-rotate-pdf";

export default function RotatePage() {
  const {
    file,
    rotations,
    isProcessing,
    progress,
    result,
    addFile,
    removeFile,
    rotatePage,
    rotateAll,
    process,
    reset,
    canProcess,
  } = useRotatePdf();

  return (
    <ToolShell
      title="Rotate PDF"
      description="Rotate pages individually or all at once. Processing happens entirely in your browser."
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
      processLabel="Apply rotation"
      dropzoneDisabled={isProcessing}
      wide={!!file}
    >
      {file ? (
        <RotateWorkspace
          file={file}
          rotations={rotations}
          disabled={isProcessing}
          onRotatePage={rotatePage}
          onRotateAll={rotateAll}
          onRemove={removeFile}
        />
      ) : null}
    </ToolShell>
  );
}
