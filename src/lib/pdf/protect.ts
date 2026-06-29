import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import { isEncrypted } from "@pdfsmaller/pdf-decrypt";

import { MAX_FILE_SIZE } from "@/lib/pdf/constants";
import { normalizePdfBytes } from "@/lib/pdf/normalize";

export type ProtectPdfOptions = {
  allowPrint?: boolean;
  allowCopy?: boolean;
};

function isPdfBytes(data: Uint8Array): boolean {
  return data.length >= 4 && data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46;
}

export function protectedFilename(name: string): string {
  const base = name.replace(/\.pdf$/i, "");
  return `${base}-protected.pdf`;
}

export async function protectPdf(
  data: ArrayBuffer,
  password: string,
  options: ProtectPdfOptions = {},
): Promise<Uint8Array> {
  if (!password.trim()) {
    throw new Error("Password is required.");
  }

  const pdfBytes = new Uint8Array(data);

  if (pdfBytes.byteLength > MAX_FILE_SIZE) {
    throw new Error("File exceeds the 100 MB limit.");
  }

  if (!isPdfBytes(pdfBytes)) {
    throw new Error("This file appears corrupted or is not a valid PDF.");
  }

  const { encrypted } = await isEncrypted(pdfBytes);
  if (encrypted) {
    throw new Error("This PDF is already password-protected.");
  }

  const allowPrint = options.allowPrint ?? true;
  const allowCopy = options.allowCopy ?? false;

  try {
    const normalized = await normalizePdfBytes(pdfBytes);

    const protectedBytes = await encryptPDF(normalized, password, {
      algorithm: "RC4",
      ownerPassword: password,
      allowPrinting: allowPrint,
      allowHighQualityPrint: allowPrint,
      allowCopying: allowCopy,
      allowExtraction: allowCopy,
      allowModifying: false,
      allowAnnotating: false,
      allowFillingForms: false,
      allowAssembly: false,
    });

    if (!isPdfBytes(protectedBytes)) {
      throw new Error("Protected PDF validation failed.");
    }

    return protectedBytes;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("already password-protected") ||
        error.message.includes("Password is required") ||
        error.message.includes("not a valid PDF") ||
        error.message.includes("validation failed")
      ) {
        throw error;
      }
    }

    throw new Error("Failed to protect PDF.");
  }
}
