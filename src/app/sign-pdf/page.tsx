"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { SignWorkspace } from "@/components/pdf/sign-workspace";
import { ToolShell } from "@/components/tools/tool-shell";
import { useSignPdf } from "@/hooks/use-sign-pdf";

export default function SignPdfPage() {
  const {
    file,
    currentPage,
    zoom,
    pageSignatures,
    selectedId,
    selectedSignature,
    isProcessing,
    progress,
    result,
    addFile,
    addSignatureFromDataUrl,
    updateSignature,
    removeSignature,
    setSelectedId,
    goToPage,
    zoomIn,
    zoomOut,
    fitToWidth,
    process,
    reset,
    canProcess,
  } = useSignPdf();

  return (
    <ToolShell
      title="Sign PDF"
      description="Draw, type, or upload your signature and place it on any page. All processing happens in your browser."
      accept={PDF_ACCEPT}
      multiple={false}
      onFilesAccepted={(accepted) => void addFile(accepted)}
      showDropzone={!file}
      showProcessButton={!file}
      canProcess={canProcess}
      onProcess={() => void process()}
      isProcessing={isProcessing}
      progress={progress}
      result={result}
      onReset={reset}
      processLabel="Download signed PDF"
      dropzoneDisabled={isProcessing}
      wide={!!file}
    >
      {file ? (
        <SignWorkspace
          file={file}
          currentPage={currentPage}
          zoom={zoom}
          pageSignatures={pageSignatures}
          selectedId={selectedId}
          selectedSignature={selectedSignature}
          isProcessing={isProcessing}
          progress={progress}
          result={result}
          canProcess={canProcess}
          onPageChange={goToPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitToWidth={fitToWidth}
          onAddSignature={(dataUrl) => void addSignatureFromDataUrl(dataUrl)}
          onSelect={setSelectedId}
          onUpdate={updateSignature}
          onRemove={removeSignature}
          onProcess={() => void process()}
          onReset={reset}
        />
      ) : null}
    </ToolShell>
  );
}
