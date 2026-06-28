export type CompressPreset = "low" | "medium" | "high";

export type CompressPresetDefinition = {
  label: string;
  description: string;
  ghostscriptProfile: "/screen" | "/ebook" | "/printer";
};

export const COMPRESS_PRESETS: Record<CompressPreset, CompressPresetDefinition> = {
  low: {
    label: "Maximum compression",
    description: "Smallest file — optimized for screen viewing (72 dpi)",
    ghostscriptProfile: "/screen",
  },
  medium: {
    label: "Balanced",
    description: "Good balance of size and quality (150 dpi)",
    ghostscriptProfile: "/ebook",
  },
  high: {
    label: "High quality",
    description: "Larger file with sharper images (300 dpi)",
    ghostscriptProfile: "/printer",
  },
};

export function compressedFilename(originalName: string): string {
  const baseName = originalName.replace(/\.pdf$/i, "");
  return `${baseName}-compressed.pdf`;
}
