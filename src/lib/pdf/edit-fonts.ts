import { StandardFonts } from "pdf-lib";

import type { EditFontFamily } from "@/types/pdf";

const CANVAS_FONTS: Record<EditFontFamily, string> = {
  helvetica: "Helvetica, Arial, sans-serif",
  times: '"Times New Roman", Times, serif',
  courier: '"Courier New", Courier, monospace',
};

export function resolveStandardFont(
  family: EditFontFamily,
  bold: boolean,
  italic: boolean,
): StandardFonts {
  if (family === "times") {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }

  if (family === "courier") {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }

  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

export function canvasFontFamily(family: EditFontFamily): string {
  return CANVAS_FONTS[family];
}

export function canvasFontStyle(bold: boolean, italic: boolean): string {
  const weight = bold ? "bold" : "normal";
  const style = italic ? "italic" : "normal";
  return `${weight} ${style}`;
}
