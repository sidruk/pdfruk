"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RangePreviewThumbnailProps = {
  pageIndex: number;
  thumbnailUrl?: string;
  isLoading?: boolean;
  onVisible?: (pageIndex: number) => void;
  onRetry?: (pageIndex: number) => void;
};

function RangePreviewThumbnail({
  pageIndex,
  thumbnailUrl,
  isLoading = false,
  onVisible,
  onRetry,
}: RangePreviewThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [thumbnailUrl]);

  useEffect(() => {
    onVisible?.(pageIndex);
  }, [onVisible, pageIndex]);

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

  const showLoader = isLoading || !thumbnailUrl || imageError;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        className="w-28 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:w-32"
      >
        <div className="relative aspect-[3/4] w-full bg-white">
          {showLoader ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt=""
              className="h-full w-full object-contain p-1"
              onError={() => {
                setImageError(true);
                onRetry?.(pageIndex);
              }}
            />
          )}
        </div>
      </div>
      <span className="text-sm font-semibold text-brand-red">
        {pageIndex + 1}
      </span>
    </div>
  );
}

type SplitRangePreviewProps = {
  label: string;
  from: number;
  to: number;
  getThumbnailUrl: (pageIndex: number) => string | undefined;
  isPageLoading: (pageIndex: number) => boolean;
  onThumbnailVisible: (pageIndex: number) => void;
  onThumbnailRetry?: (pageIndex: number) => void;
};

export function SplitRangePreview({
  label,
  from,
  to,
  getThumbnailUrl,
  isPageLoading,
  onThumbnailVisible,
  onThumbnailRetry,
}: SplitRangePreviewProps) {
  const isSinglePage = from === to;
  const previewPages = isSinglePage ? [from] : [from, to];

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-sm font-semibold text-brand-charcoal">{label}</p>
      <div
        className={cn(
          "flex items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-white/50 px-6 py-6 sm:gap-6 sm:px-10",
          isSinglePage ? "min-w-[180px]" : "min-w-[280px]",
        )}
      >
        {previewPages.map((pageNumber, index) => (
          <div key={pageNumber} className="flex items-center gap-4 sm:gap-6">
            {!isSinglePage && index === 1 ? (
              <span
                className="pb-6 text-xl font-bold tracking-[0.2em] text-gray-400"
                aria-hidden
              >
                ···
              </span>
            ) : null}
            <RangePreviewThumbnail
              pageIndex={pageNumber - 1}
              thumbnailUrl={getThumbnailUrl(pageNumber - 1)}
              isLoading={isPageLoading(pageNumber - 1)}
              onVisible={onThumbnailVisible}
              onRetry={onThumbnailRetry}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
