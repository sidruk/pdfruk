"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { CropWorkspace } from "@/components/pdf/crop-workspace";
import { ToolShell } from "@/components/tools/tool-shell";
import { useCropPdf } from "@/hooks/use-crop-pdf";

export default function CropPage() {
  const {
    file,
    currentPage,
    zoom,
    scope,
    activeCrop,
    isProcessing,
    progress,
    result,
    addFile,
    setScope,
    setActiveCrop,
    resetAllCrops,
    goToPage,
    zoomIn,
    zoomOut,
    fitToWidth,
    process,
    reset,
    canProcess,
  } = useCropPdf();

  return (
    <ToolShell
      title="Crop PDF"
      description="Select the area to keep on each page. Drag the handles to resize, or draw a new selection."
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
      processLabel="Crop PDF"
      dropzoneDisabled={isProcessing}
      wide={!!file}
    >
      {file ? (
        <CropWorkspace
          file={file}
          currentPage={currentPage}
          zoom={zoom}
          scope={scope}
          activeCrop={activeCrop}
          isProcessing={isProcessing}
          progress={progress}
          result={result}
          canProcess={canProcess}
          onPageChange={goToPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitToWidth={fitToWidth}
          onScopeChange={setScope}
          onCropChange={setActiveCrop}
          onResetAllCrops={resetAllCrops}
          onProcess={() => void process()}
          onReset={reset}
        />
      ) : null}
    </ToolShell>
  );
}
