"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type PageThumbnailProps = {
  pageIndex: number;
  thumbnailUrl?: string;
  selected?: boolean;
  onClick?: () => void;
  onVisible?: (pageIndex: number) => void;
};

export function PageThumbnail({
  pageIndex,
  thumbnailUrl,
  selected = false,
  onClick,
  onVisible,
}: PageThumbnailProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !onVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(pageIndex);
          }
        });
      },
      { rootMargin: "100px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [onVisible, pageIndex]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors",
        selected
          ? "border-brand-red ring-2 ring-brand-red/30"
          : "hover:border-brand-red/40",
      )}
    >
      <div className="relative aspect-[3/4] w-full bg-muted">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={`Page ${pageIndex + 1}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading...
          </div>
        )}
        {selected ? (
          <span className="absolute right-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-xs font-medium text-white">
            Selected
          </span>
        ) : null}
      </div>
      <div className="border-t px-2 py-1.5 text-center text-xs font-medium">
        Page {pageIndex + 1}
      </div>
    </button>
  );
}
