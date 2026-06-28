import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { extractFormFields, fillPdfForm } from "@/lib/pdf/forms";

async function createFormPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 500]);
  const form = doc.getForm();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const nameField = form.createTextField("fullName");
  nameField.setText("Jane Doe");
  nameField.addToPage(page, { x: 50, y: 400, width: 200, height: 24, font });

  const agreeField = form.createCheckBox("agree");
  agreeField.addToPage(page, { x: 50, y: 350, width: 20, height: 20 });

  return doc.save();
}

describe("forms", () => {
  it("extracts form fields from a PDF", async () => {
    const source = await createFormPdf();
    const fields = await extractFormFields(source.buffer as ArrayBuffer);

    expect(fields.some((field) => field.name === "fullName" && field.type === "text")).toBe(true);
    expect(fields.some((field) => field.name === "agree" && field.type === "checkbox")).toBe(true);
  });

  it("fills form fields", async () => {
    const source = await createFormPdf();
    const result = await fillPdfForm(source.buffer as ArrayBuffer, {
      fields: [
        { name: "fullName", value: "John Smith" },
        { name: "agree", value: true },
      ],
    });
    const fields = await extractFormFields(result.buffer as ArrayBuffer);
    const nameField = fields.find((field) => field.name === "fullName");
    const agreeField = fields.find((field) => field.name === "agree");

    expect(nameField?.value).toBe("John Smith");
    expect(agreeField?.value).toBe("true");
  });
});
