"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { UnlockOptions } from "@/components/pdf/unlock-options";
import { ToolShell } from "@/components/tools/tool-shell";
import { useUnlockPdf } from "@/hooks/use-unlock-pdf";

export default function UnlockPage() {
  const {
    file,
    password,
    isProcessing,
    progress,
    result,
    setPassword,
    addFile,
    removeFile,
    process,
    reset,
    canProcess,
  } = useUnlockPdf();

  return (
    <ToolShell
      title="Unlock PDF"
      description="Remove password protection from a PDF. Files are processed on the server and deleted immediately."
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
      processLabel="Unlock PDF"
      dropzoneDisabled={isProcessing}
      privacyLabel="Processed securely, not stored"
    >
      {file ? (
        <UnlockOptions
          file={file}
          password={password}
          onPasswordChange={setPassword}
          onRemove={removeFile}
          disabled={isProcessing}
        />
      ) : null}
    </ToolShell>
  );
}
