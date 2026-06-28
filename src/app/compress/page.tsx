"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { CompressOptions } from "@/components/pdf/compress-options";
import { ToolShell } from "@/components/tools/tool-shell";
import { useCompressPdf } from "@/hooks/use-compress-pdf";

export default function CompressPage() {
  const {
    file,
    preset,
    isProcessing,
    progress,
    result,
    setPreset,
    addFile,
    removeFile,
    process,
    reset,
    canProcess,
  } = useCompressPdf();

  return (
    <ToolShell
      title="Compress PDF"
      description="Reduce file size with Ghostscript and pikepdf. Files are processed on the server and deleted immediately after compression."
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
      processLabel="Compress PDF"
      dropzoneDisabled={isProcessing}
      privacyLabel="Processed securely, not stored"
    >
      {file ? (
        <CompressOptions
          file={file}
          preset={preset}
          onPresetChange={setPreset}
          onRemove={removeFile}
          disabled={isProcessing}
        />
      ) : null}
    </ToolShell>
  );
}
