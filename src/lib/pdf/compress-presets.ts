export type CompressPreset = "low" | "medium" | "high";

export type CompressSettings = {
  scale: number;
  jpegQuality: number;
};

export type CompressPresetDefinition = CompressSettings & {
  label: string;
  description: string;
};

export const COMPRESS_PRESETS: Record<CompressPreset, CompressPresetDefinition> = {
  low: {
    label: "Maximum compression",
    description: "Smallest file size, lower image quality",
    scale: 1,
    jpegQuality: 0.4,
  },
  medium: {
    label: "Balanced",
    description: "Good balance of size and quality",
    scale: 1.25,
    jpegQuality: 0.6,
  },
  high: {
    label: "High quality",
    description: "Larger file, sharper images",
    scale: 1.5,
    jpegQuality: 0.75,
  },
};

export function resolveCompressSettings(
  preset: CompressPreset,
): CompressSettings {
  const { scale, jpegQuality } = COMPRESS_PRESETS[preset];
  return { scale, jpegQuality };
}

export function compressedFilename(originalName: string): string {
  const baseName = originalName.replace(/\.pdf$/i, "");
  return `${baseName}-compressed.pdf`;
}
