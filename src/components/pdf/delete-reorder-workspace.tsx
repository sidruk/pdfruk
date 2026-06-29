"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef } from "react";
import { FileText, GripVertical, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePdfThumbnails } from "@/hooks/use-pdf-thumbnails";
import { cn } from "@/lib/utils";
import type { PdfFile } from "@/types/pdf";

type SortablePageCardProps = {
  position: number;
  originalPageIndex: number;
  thumbnailUrl?: string;
  disabled?: boolean;
  canDelete: boolean;
  onDelete: (position: number) => void;
  onVisible: (pageIndex: number) => void;
};

function SortablePageCard({
  position,
  originalPageIndex,
  thumbnailUrl,
  disabled,
  canDelete,
  onDelete,
  onVisible,
}: SortablePageCardProps) {
  const visibilityRef = useRef<HTMLDivElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(originalPageIndex) });

  useEffect(() => {
    const element = visibilityRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(originalPageIndex);
          }
        });
      },
      { rootMargin: "100px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [onVisible, originalPageIndex]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "overflow-hidden rounded-lg border bg-card",
        isDragging && "z-10 opacity-80 shadow-lg",
      )}
    >
      <div ref={visibilityRef} className="relative aspect-[3/4] w-full bg-muted">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={`Page ${originalPageIndex + 1}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading...
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-brand-charcoal/80 px-2 py-0.5 text-xs font-medium text-white">
          {position + 1}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t px-2 py-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label={`Drag page ${originalPageIndex + 1}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <span className="flex-1 text-center text-xs text-muted-foreground">
          Was page {originalPageIndex + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled || !canDelete}
          aria-label={`Delete page ${originalPageIndex + 1}`}
          onClick={() => onDelete(position)}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

type DeleteReorderWorkspaceProps = {
  file: PdfFile;
  pageOrder: number[];
  disabled?: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDeletePage: (position: number) => void;
  onRemove: () => void;
};

export function DeleteReorderWorkspace({
  file,
  pageOrder,
  disabled = false,
  onReorder,
  onDeletePage,
  onRemove,
}: DeleteReorderWorkspaceProps) {
  const { pages, isLoading, renderThumbnail } = usePdfThumbnails(
    file.file,
    file.pageCount,
  );

  const thumbnailByPage = new Map(
    pages.map((page) => [page.pageIndex, page.thumbnailUrl]),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pageOrder.findIndex(
      (pageIndex) => String(pageIndex) === active.id,
    );
    const newIndex = pageOrder.findIndex(
      (pageIndex) => String(pageIndex) === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(oldIndex, newIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {pageOrder.length} of {file.pageCount} page
            {file.pageCount === 1 ? "" : "s"} selected
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

      <p className="text-sm text-muted-foreground">
        Drag pages to reorder. Use the trash icon to remove pages.
      </p>

      {isLoading && pageOrder.length > 0 && pages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading page previews...</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pageOrder.map((pageIndex) => String(pageIndex))}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {pageOrder.map((originalPageIndex, position) => (
                <SortablePageCard
                  key={originalPageIndex}
                  position={position}
                  originalPageIndex={originalPageIndex}
                  thumbnailUrl={thumbnailByPage.get(originalPageIndex)}
                  disabled={disabled}
                  canDelete={pageOrder.length > 1}
                  onDelete={onDeletePage}
                  onVisible={renderThumbnail}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
