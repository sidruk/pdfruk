import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const LOGO_SIZES: Record<
  LogoSize,
  { width: number; height: number; className: string }
> = {
  sm: { width: 140, height: 36, className: "w-[140px]" },
  md: { width: 150, height: 38, className: "w-[150px]" },
  lg: { width: 160, height: 40, className: "w-[160px]" },
};

type LogoProps = {
  className?: string;
  size?: LogoSize;
  priority?: boolean;
};

export function Logo({ className, size = "lg", priority = false }: LogoProps) {
  const { width, height, className: sizeClassName } = LOGO_SIZES[size];

  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="pdfruk"
        width={width}
        height={height}
        className={cn("h-auto", sizeClassName)}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    </Link>
  );
}
