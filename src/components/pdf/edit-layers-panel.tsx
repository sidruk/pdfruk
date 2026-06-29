"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  Info,
  Pencil,
  Trash2,
  Type,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { EditAnnotation, TextAnnotation } from "@/types/pdf";

const TEXT_PLACEHOLDER = "Your text here";

type EditLayersPanelProps = {
  currentPage: number;
  annotations: EditAnnotation[];
  selectedId: string | null;
  editingTextId: string | null;
  embedded?: boolean;
  onSelect: (id: string) => void;
  onEditText: (id: string) => void;
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

function getTextLabel(annotation: TextAnnotation, index: number): string {
  const trimmed = annotation.text.trim();
  if (!trimmed || trimmed === TEXT_PLACEHOLDER) {
    return `New Text ${index + 1}`;
  }
  return trimmed.length > 28 ? `${trimmed.slice(0, 28)}…` : trimmed;
}

function getAnnotationLabel(annotation: EditAnnotation, textIndex: number): string {
  if (annotation.type === "text") {
    return getTextLabel(annotation, textIndex);
  }
  if (annotation.type === "image") {
    if (annotation.sourceKind === "signature") return "Signature";
    if (annotation.sourceKind === "pdf") return "PDF page";
    return "Image";
  }
  if (annotation.type === "draw") return "Drawing";
  return annotation.shape.charAt(0).toUpperCase() + annotation.shape.slice(1);
}

export function EditLayersPanel({
  currentPage,
  annotations,
  selectedId,
  editingTextId,
  embedded = false,
  onSelect,
  onEditText,
  onRemove,
  onRemoveAll,
  onReorder,
}: EditLayersPanelProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const layers = [...annotations].reverse();

  const getLayerLabel = (annotation: EditAnnotation): string => {
    if (annotation.type === "text") {
      const textItems = annotations.filter((item) => item.type === "text");
      const index = textItems.findIndex((item) => item.id === annotation.id);
      return getTextLabel(annotation, index);
    }
    return getAnnotationLabel(annotation, 0);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    const fromIndex = annotations.length - 1 - dragIndex;
    const toIndex = annotations.length - 1 - targetIndex;
    onReorder(fromIndex, toIndex);
    setDragIndex(null);
  };

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-white",
        embedded
          ? "flex-1 border-b border-gray-200"
          : "relative z-10 hidden h-full w-64 shrink-0 border-r border-gray-200 sm:flex",
      )}
    >
      {!embedded ? (
        <div className="border-b border-gray-100 px-4 py-4">
          <h2 className="text-center text-lg font-bold text-brand-charcoal">
            Edit PDF
          </h2>
        </div>
      ) : (
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-semibold text-brand-charcoal">Fields</p>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
        <p>Reorder items to move them to the back or front.</p>
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-brand-charcoal">
          Page {currentPage + 1}
        </p>
        {annotations.length > 0 ? (
          <button
            type="button"
            onClick={onRemoveAll}
            className="text-sm font-medium text-red-500 hover:text-red-600"
          >
            Remove all
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            No items on this page yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {layers.map((annotation, index) => {
              const active =
                selectedId === annotation.id || editingTextId === annotation.id;

              return (
                <li
                  key={annotation.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 transition-colors",
                    active ? "bg-gray-100" : "hover:bg-gray-50",
                    dragIndex === index && "opacity-50",
                  )}
                >
                  <button
                    type="button"
                    aria-label="Reorder"
                    className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelect(annotation.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-dashed border-gray-300 bg-white text-xs font-semibold text-gray-600">
                      {annotation.type === "text" ? (
                        <Type className="h-3.5 w-3.5" />
                      ) : (
                        "A"
                      )}
                    </span>
                    <span className="truncate text-sm text-gray-800">
                      {getLayerLabel(annotation)}
                    </span>
                  </button>

                  {annotation.type === "text" ? (
                    <button
                      type="button"
                      aria-label="Edit text"
                      onClick={() => {
                        onSelect(annotation.id);
                        onEditText(annotation.id);
                      }}
                      className="rounded p-1.5 text-gray-500 hover:bg-white hover:text-gray-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => onRemove(annotation.id)}
                    className="rounded p-1.5 text-gray-500 hover:bg-white hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
