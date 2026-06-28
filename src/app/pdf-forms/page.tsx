"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { FormsWorkspace } from "@/components/pdf/forms-workspace";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFillFormPdf } from "@/hooks/use-fill-form-pdf";

export default function PdfFormsPage() {
  const {
    file,
    fields,
    isLoadingFields,
    isProcessing,
    progress,
    result,
    addFile,
    removeFile,
    updateField,
    process,
    reset,
    canProcess,
  } = useFillFormPdf();

  return (
    <ToolShell
      title="PDF Forms"
      description="Fill in text fields, checkboxes, and dropdowns in an existing PDF form."
      accept={PDF_ACCEPT}
      multiple={false}
      onFilesAccepted={(accepted) => void addFile(accepted)}
      showDropzone={!file && !isLoadingFields}
      canProcess={canProcess}
      onProcess={() => void process()}
      isProcessing={isProcessing || isLoadingFields}
      progress={progress}
      result={result}
      onReset={reset}
      processLabel="Download filled PDF"
      dropzoneDisabled={isProcessing || isLoadingFields}
    >
      {isLoadingFields ? (
        <p className="text-sm text-muted-foreground">Reading form fields...</p>
      ) : null}

      {file ? (
        <FormsWorkspace
          file={file}
          fields={fields}
          disabled={isProcessing}
          onFieldChange={updateField}
          onRemove={removeFile}
        />
      ) : null}
    </ToolShell>
  );
}
