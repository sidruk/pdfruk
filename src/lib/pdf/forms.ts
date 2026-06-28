import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
} from "pdf-lib";

import type { FillFormOptions, PdfFormField, PdfFormFieldType } from "@/types/pdf";

function getFieldType(field: { constructor: { name: string } }): PdfFormFieldType {
  if (field instanceof PDFTextField) return "text";
  if (field instanceof PDFCheckBox) return "checkbox";
  if (field instanceof PDFDropdown) return "dropdown";
  if (field instanceof PDFOptionList) return "dropdown";
  if (field instanceof PDFRadioGroup) return "radio";
  return "unknown";
}

function readFieldValue(field: ReturnType<ReturnType<PDFDocument["getForm"]>["getFields"]>[number]): string {
  if (field instanceof PDFTextField) {
    return field.getText() ?? "";
  }
  if (field instanceof PDFCheckBox) {
    return field.isChecked() ? "true" : "false";
  }
  if (field instanceof PDFDropdown) {
    return field.getSelected()?.[0] ?? "";
  }
  if (field instanceof PDFOptionList) {
    return field.getSelected()?.[0] ?? "";
  }
  if (field instanceof PDFRadioGroup) {
    return field.getSelected() ?? "";
  }
  return "";
}

function readFieldOptions(
  field: ReturnType<ReturnType<PDFDocument["getForm"]>["getFields"]>[number],
): string[] | undefined {
  if (field instanceof PDFDropdown) {
    return field.getOptions();
  }
  if (field instanceof PDFOptionList) {
    return field.getOptions();
  }
  if (field instanceof PDFRadioGroup) {
    return field.getOptions();
  }
  return undefined;
}

export async function extractFormFields(buffer: ArrayBuffer): Promise<PdfFormField[]> {
  const doc = await PDFDocument.load(buffer);
  const form = doc.getForm();
  const fields = form.getFields();

  return fields.map((field) => ({
    name: field.getName(),
    type: getFieldType(field),
    value: readFieldValue(field),
    options: readFieldOptions(field),
  }));
}

export async function fillPdfForm(
  buffer: ArrayBuffer,
  options: FillFormOptions,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  const form = doc.getForm();

  for (const { name, value } of options.fields) {
    const field = form.getFields().find((entry) => entry.getName() === name);
    if (!field) continue;

    if (field instanceof PDFTextField && typeof value === "string") {
      field.setText(value);
    } else if (field instanceof PDFCheckBox && typeof value === "boolean") {
      if (value) {
        field.check();
      } else {
        field.uncheck();
      }
    } else if (field instanceof PDFDropdown && typeof value === "string") {
      field.select(value);
    } else if (field instanceof PDFOptionList && typeof value === "string") {
      field.select(value);
    } else if (field instanceof PDFRadioGroup && typeof value === "string") {
      field.select(value);
    }
  }

  form.updateFieldAppearances();
  return doc.save();
}
