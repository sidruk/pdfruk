"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { EditWorkspace } from "@/components/pdf/edit-workspace";
import { ToolShell } from "@/components/tools/tool-shell";
import { useEditPdf } from "@/hooks/use-edit-pdf";

export default function EditPdfPage() {
  const {
    file,
    currentPage,
    zoom,
    activeTool,
    activeShape,
    pageAnnotations,
    selectedId,
    selectedAnnotation,
    color,
    strokeWidth,
    fontSize,
    fontFamily,
    bold,
    italic,
    isProcessing,
    progress,
    result,
    setActiveTool,
    setActiveShape,
    setColor,
    setStrokeWidth,
    setFontSize,
    setFontFamily,
    setBold,
    setItalic,
    setSelectedId,
    addFile,
    addAnnotation,
    addImageFromFile,
    addSignatureFromDataUrl,
    updateAnnotation,
    removeAnnotation,
    goToPage,
    zoomIn,
    zoomOut,
    fitToWidth,
    process,
    reset,
    canProcess,
  } = useEditPdf();

  return (
    <ToolShell
      title="Edit PDF"
      description="Add text, draw, and place shapes on your PDF. All editing happens in your browser."
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
      processLabel="Export"
      dropzoneDisabled={isProcessing}
      wide={!!file}
    >
      {file ? (
        <EditWorkspace
          file={file}
          currentPage={currentPage}
          zoom={zoom}
          activeTool={activeTool}
          activeShape={activeShape}
          pageAnnotations={pageAnnotations}
          selectedId={selectedId}
          selectedAnnotation={selectedAnnotation}
          color={color}
          strokeWidth={strokeWidth}
          fontSize={fontSize}
          fontFamily={fontFamily}
          bold={bold}
          italic={italic}
          isProcessing={isProcessing}
          progress={progress}
          result={result}
          canProcess={canProcess}
          onPageChange={goToPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitToWidth={fitToWidth}
          onToolChange={setActiveTool}
          onShapeChange={setActiveShape}
          onColorChange={setColor}
          onStrokeWidthChange={setStrokeWidth}
          onFontSizeChange={setFontSize}
          onFontFamilyChange={setFontFamily}
          onBoldChange={setBold}
          onItalicChange={setItalic}
          onAddImageFromFile={(nextFile, sourceKind) =>
            void addImageFromFile(nextFile, sourceKind, currentPage)
          }
          onAddSignature={(dataUrl) =>
            void addSignatureFromDataUrl(dataUrl)
          }
          onSelect={setSelectedId}
          onAdd={addAnnotation}
          onUpdate={updateAnnotation}
          onRemove={removeAnnotation}
          onProcess={() => void process()}
          onReset={reset}
        />
      ) : null}
    </ToolShell>
  );
}
