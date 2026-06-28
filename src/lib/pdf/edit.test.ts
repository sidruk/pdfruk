import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { applyEditAnnotations } from "@/lib/pdf/edit";
import { createTestPdf } from "@/lib/pdf/test-helpers";
import type { EditAnnotation } from "@/types/pdf";

describe("applyEditAnnotations", () => {
  it("applies text, draw, and shape annotations", async () => {
    const source = await createTestPdf(1);
    const annotations: EditAnnotation[] = [
      {
        id: "text-1",
        type: "text",
        pageIndex: 0,
        x: 0.1,
        y: 0.1,
        width: 0.3,
        height: 0.05,
        text: "Edited",
        fontSize: 14,
        fontFamily: "helvetica",
        bold: true,
        italic: false,
        rotation: 15,
        color: "#2563eb",
        strokeWidth: 2,
      },
      {
        id: "draw-1",
        type: "draw",
        pageIndex: 0,
        points: [
          { x: 0.2, y: 0.3 },
          { x: 0.25, y: 0.35 },
          { x: 0.3, y: 0.32 },
        ],
        color: "#dc2626",
        strokeWidth: 2,
      },
      {
        id: "shape-1",
        type: "shape",
        pageIndex: 0,
        shape: "rectangle",
        x1: 0.5,
        y1: 0.5,
        x2: 0.7,
        y2: 0.65,
        color: "#16a34a",
        strokeWidth: 2,
      },
    ];

    const result = await applyEditAnnotations(source.buffer as ArrayBuffer, annotations);
    const doc = await PDFDocument.load(result);

    expect(doc.getPageCount()).toBe(1);
  });

  it("returns unchanged page count when no annotations match", async () => {
    const source = await createTestPdf(2);
    const result = await applyEditAnnotations(source.buffer as ArrayBuffer, []);
    const doc = await PDFDocument.load(result);

    expect(doc.getPageCount()).toBe(2);
  });
});
