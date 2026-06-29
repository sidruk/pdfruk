"use client";

import { PDF_ACCEPT } from "@/lib/pdf/constants";

import { ProtectOptions } from "@/components/pdf/protect-options";
import { ToolShell } from "@/components/tools/tool-shell";
import { useProtectPdf } from "@/hooks/use-protect-pdf";

export default function ProtectPage() {
  const {
    file,
    password,
    confirmPassword,
    allowPrint,
    allowCopy,
    isProcessing,
    progress,
    result,
    setPassword,
    setConfirmPassword,
    setAllowPrint,
    setAllowCopy,
    addFile,
    removeFile,
    process,
    reset,
    canProcess,
  } = useProtectPdf();

  return (
    <ToolShell
      title="Protect PDF"
      description="Add a password to restrict access to your PDF. Files are processed on the server and deleted immediately after encryption."
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
      processLabel="Protect PDF"
      dropzoneDisabled={isProcessing}
      privacyLabel="Processed securely, not stored"
    >
      {file ? (
        <ProtectOptions
          file={file}
          password={password}
          confirmPassword={confirmPassword}
          allowPrint={allowPrint}
          allowCopy={allowCopy}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onAllowPrintChange={setAllowPrint}
          onAllowCopyChange={setAllowCopy}
          onRemove={removeFile}
          disabled={isProcessing}
        />
      ) : null}
    </ToolShell>
  );
}
