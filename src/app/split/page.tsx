"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { SplitWorkspace } from "@/components/pdf/split-workspace";
import { ToolShell } from "@/components/tools/tool-shell";
import { useSplitPdf } from "@/hooks/use-split-pdf";

export default function SplitPage() {
  const {
    file,
    tab,
    rangeMode,
    rangeEntries,
    fixedPagesPerRange,
    mergeRanges,
    selectedPages,
    isProcessing,
    progress,
    result,
    setTab,
    setRangeMode,
    updateRangeEntry,
    addRangeEntry,
    removeRangeEntry,
    setFixedPagesPerRange,
    setMergeRanges,
    togglePage,
    addFile,
    process,
    reset,
    canProcess,
  } = useSplitPdf();

  return (
    <ToolShell
      title="Split PDF"
      description="Extract pages by range or select individual pages. All processing happens in your browser."
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
      processLabel="Split PDF"
      dropzoneDisabled={isProcessing}
      wide={!!file}
    >
      {file ? (
        <SplitWorkspace
          file={file}
          tab={tab}
          rangeMode={rangeMode}
          rangeEntries={rangeEntries}
          fixedPagesPerRange={fixedPagesPerRange}
          mergeRanges={mergeRanges}
          selectedPages={selectedPages}
          isProcessing={isProcessing}
          progress={progress}
          result={result}
          canProcess={canProcess}
          onTabChange={setTab}
          onRangeModeChange={setRangeMode}
          onRangeChange={updateRangeEntry}
          onAddRange={addRangeEntry}
          onRemoveRange={removeRangeEntry}
          onFixedPagesChange={setFixedPagesPerRange}
          onMergeRangesChange={setMergeRanges}
          onTogglePage={togglePage}
          onProcess={() => void process()}
          onReset={reset}
        />
      ) : null}
    </ToolShell>
  );
}
