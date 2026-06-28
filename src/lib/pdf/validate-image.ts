import { MAX_FILE_SIZE } from "@/lib/pdf/constants";

export type ImageValidationErrorCode =
  | "too_large"
  | "invalid_type"
  | "corrupt";

export type ImageValidationError = {
  code: ImageValidationErrorCode;
  message: string;
  fileName: string;
};

function isAcceptedImage(file: File): boolean {
  const name = file.name.toLowerCase();
  if (file.type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return true;
  }
  if (file.type === "image/png" || name.endsWith(".png")) {
    return true;
  }
  return false;
}

export async function validateImageFile(
  file: File,
): Promise<ImageValidationError | null> {
  if (!isAcceptedImage(file)) {
    return {
      code: "invalid_type",
      message: "Only JPG and PNG images are supported.",
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
    const bitmap = await createImageBitmap(file);
    bitmap.close();
    return null;
  } catch {
    return {
      code: "corrupt",
      message: "This file appears corrupted or is not a valid image.",
      fileName: file.name,
    };
  }
}

export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}

export function imageValidationErrorMessage(
  error: ImageValidationError,
): string {
  return `${error.fileName}: ${error.message}`;
}
