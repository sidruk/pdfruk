import { PDFDocument } from "pdf-lib";

import { MAX_FILE_SIZE } from "@/lib/pdf/constants";
import type { PdfValidationError } from "@/types/pdf";

function isEncryptedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("encrypted") ||
    message.includes("password") ||
    message.includes("decrypt")
  );
}

export async function validatePdfFile(
  file: File,
): Promise<PdfValidationError | null> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return {
      code: "invalid_type",
      message: "Only PDF files are supported.",
      fileName: file.name,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      code: "too_large",
      message: `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.`,
      fileName: file.name,
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    await PDFDocument.load(buffer, { ignoreEncryption: false });
    return null;
  } catch (error) {
    if (isEncryptedError(error)) {
      return {
        code: "encrypted",
        message:
          "This PDF is password-protected. Use Unlock first.",
        fileName: file.name,
      };
    }

    return {
      code: "corrupt",
      message: "This file appears corrupted or is not a valid PDF.",
      fileName: file.name,
    };
  }
}

export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer);
  return doc.getPageCount();
}

export type PdfInspectResult =
  | { ok: true; pageCount: number }
  | { ok: false; error: PdfValidationError };

export async function inspectPdfFile(file: File): Promise<PdfInspectResult> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return {
      ok: false,
      error: {
        code: "invalid_type",
        message: "Only PDF files are supported.",
        fileName: file.name,
      },
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: {
        code: "too_large",
        message: `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.`,
        fileName: file.name,
      },
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
    return { ok: true, pageCount: doc.getPageCount() };
  } catch (error) {
    if (isEncryptedError(error)) {
      return {
        ok: false,
        error: {
          code: "encrypted",
          message: "This PDF is password-protected. Use Unlock first.",
          fileName: file.name,
        },
      };
    }

    return {
      ok: false,
      error: {
        code: "corrupt",
        message: "This file appears corrupted or is not a valid PDF.",
        fileName: file.name,
      },
    };
  }
}

export function validationErrorMessage(error: PdfValidationError): string {
  return `${error.fileName}: ${error.message}`;
}
