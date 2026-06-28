"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { PageNumbersOptions } from "@/components/pdf/page-numbers-options";
import { ToolShell } from "@/components/tools/tool-shell";
import { usePageNumbersPdf } from "@/hooks/use-page-numbers-pdf";

export default function PageNumbersPage() {
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
  } = usePageNumbersPdf();

  return (
    <ToolShell
      title="Page Numbers"
      description="Add formatted page numbers to every page of your PDF."
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
      processLabel="Add page numbers"
      dropzoneDisabled={isProcessing}
    >
      {file ? (
        <PageNumbersOptions
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
