import { decryptPDF, isEncrypted } from "@pdfsmaller/pdf-decrypt";

import { MAX_FILE_SIZE } from "@/lib/pdf/constants";

function isPdfBytes(data: Uint8Array): boolean {
  return data.length >= 4 && data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46;
}

export function unlockedFilename(name: string): string {
  const base = name.replace(/\.pdf$/i, "");
  return `${base}-unlocked.pdf`;
}

export async function unlockPdf(
  data: ArrayBuffer,
  password: string,
): Promise<Uint8Array> {
  if (!password) {
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
  if (!encrypted) {
    throw new Error("This PDF is not password-protected.");
  }

  try {
    const unlockedBytes = await decryptPDF(pdfBytes, password);

    if (!isPdfBytes(unlockedBytes)) {
      throw new Error("Unlocked PDF validation failed.");
    }

    return unlockedBytes;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Incorrect password")) {
        throw new Error("Incorrect password.");
      }

      if (
        error.message.includes("Password is required") ||
        error.message.includes("not password-protected") ||
        error.message.includes("not a valid PDF") ||
        error.message.includes("validation failed")
      ) {
        throw error;
      }
    }

    throw new Error("Failed to unlock PDF.");
  }
}

export async function validateUnlockPdfFile(file: File): Promise<string | null> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "Please upload a PDF file.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.`;
  }

  const pdfBytes = new Uint8Array(await file.arrayBuffer());

  if (!isPdfBytes(pdfBytes)) {
    return "This file appears corrupted or is not a valid PDF.";
  }

  const { encrypted } = await isEncrypted(pdfBytes);
  if (!encrypted) {
    return "This PDF is not password-protected.";
  }

  return null;
}
