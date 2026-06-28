"use client";

import { FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PdfFile, PdfFormField } from "@/types/pdf";

type FormsWorkspaceProps = {
  file: PdfFile;
  fields: PdfFormField[];
  disabled?: boolean;
  onFieldChange: (name: string, value: string | boolean) => void;
  onRemove: () => void;
};

function FormFieldInput({
  field,
  disabled,
  onChange,
}: {
  field: PdfFormField;
  disabled?: boolean;
  onChange: (value: string | boolean) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
        <Label htmlFor={field.name} className="font-normal">
          {field.name}
        </Label>
        <Switch
          id={field.name}
          checked={field.value === "true"}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      </div>
    );
  }

  if (
    (field.type === "dropdown" || field.type === "radio") &&
    field.options &&
    field.options.length > 0
  ) {
    return (
      <div className="space-y-2">
        <Label htmlFor={field.name}>{field.name}</Label>
        <Select
          value={field.value || field.options[0]}
          disabled={disabled}
          onValueChange={(value) => onChange(value ?? "")}
        >
          <SelectTrigger id={field.name} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{field.name}</Label>
      <Input
        id={field.name}
        value={field.value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function FormsWorkspace({
  file,
  fields,
  disabled = false,
  onFieldChange,
  onRemove,
}: FormsWorkspaceProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {fields.length} fillable field{fields.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div>
          <h2 className="text-sm font-medium">Form fields</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the fields below, then download the completed PDF.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <FormFieldInput
              key={field.name}
              field={field}
              disabled={disabled}
              onChange={(value) => onFieldChange(field.name, value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
