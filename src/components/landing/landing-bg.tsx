import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LandingBgProps = {
  variant?: "default" | "muted" | "warm";
  className?: string;
  children: ReactNode;
};

export function LandingBg({
  variant = "default",
  className,
  children,
}: LandingBgProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {variant === "default" ? (
          <>
            <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-brand-red/8 blur-3xl dark:bg-brand-red/12" />
            <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-brand-charcoal/5 blur-3xl dark:bg-brand-charcoal/15" />
          </>
        ) : null}
        {variant === "muted" ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/40 to-transparent dark:via-muted/20" />
            <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-sky-500/8 blur-3xl" />
            <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-violet-500/8 blur-3xl" />
          </>
        ) : null}
        {variant === "warm" ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(214,26,26,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(214,26,26,0.12),transparent)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
          </>
        ) : null}
        <div className="landing-dot-grid absolute inset-0 opacity-[0.35] dark:opacity-[0.15]" />
      </div>
      {children}
    </div>
  );
}
