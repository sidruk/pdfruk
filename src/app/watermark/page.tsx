"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { WatermarkOptionsPanel } from "@/components/pdf/watermark-options";
import { ToolShell } from "@/components/tools/tool-shell";
import { useWatermarkPdf } from "@/hooks/use-watermark-pdf";

export default function WatermarkPage() {
  const {
    file,
    options,
    isProcessing,
    progress,
    result,
    addFile,
    removeFile,
    updateOption,
    process,
    reset,
    canProcess,
  } = useWatermarkPdf();

  return (
    <ToolShell
      title="Add Watermark"
      description="Stamp text or an attached image watermark on every page with custom position, opacity, and mosaic tiling."
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
      processLabel="Add watermark"
      dropzoneDisabled={isProcessing}
    >
      {file ? (
        <WatermarkOptionsPanel
          file={file}
          options={options}
          onOptionChange={updateOption}
          onRemove={removeFile}
          disabled={isProcessing}
        />
      ) : null}
    </ToolShell>
  );
}
