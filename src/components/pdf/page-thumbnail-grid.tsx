"use client";

import { usePdfThumbnails } from "@/hooks/use-pdf-thumbnails";

import { PageThumbnail } from "@/components/pdf/page-thumbnail";

type PageThumbnailGridProps = {
  file: File;
  pageCount: number;
  selectedPages: number[];
  onTogglePage: (pageIndex: number) => void;
};

export function PageThumbnailGrid({
  file,
  pageCount,
  selectedPages,
  onTogglePage,
}: PageThumbnailGridProps) {
  const { pages, isLoading, renderThumbnail } = usePdfThumbnails(
    file,
    pageCount,
  );

  if (isLoading && pages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Loading page previews...</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {pages.map((page) => (
        <PageThumbnail
          key={page.pageIndex}
          pageIndex={page.pageIndex}
          thumbnailUrl={page.thumbnailUrl}
          selected={selectedPages.includes(page.pageIndex)}
          onClick={() => onTogglePage(page.pageIndex)}
          onVisible={renderThumbnail}
        />
      ))}
    </div>
  );
}
