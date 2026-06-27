export function HeroVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none"
      aria-hidden
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-red/15 via-transparent to-brand-charcoal/5 blur-2xl dark:from-brand-red/20 dark:to-brand-charcoal/20" />

      <div className="relative flex aspect-square items-center justify-center sm:aspect-[4/3] lg:aspect-auto lg:min-h-[420px]">
        {/* Back document */}
        <div className="absolute right-4 top-8 w-[58%] rotate-6 rounded-xl border border-border/60 bg-card p-4 shadow-lg transition-transform duration-500 sm:right-8 sm:top-10">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-red/70" />
            <div className="h-2 w-16 rounded-full bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-muted" />
            <div className="h-2 w-[85%] rounded-full bg-muted" />
            <div className="h-2 w-[70%] rounded-full bg-muted" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="aspect-[4/3] rounded-md bg-brand-red/10" />
            <div className="aspect-[4/3] rounded-md bg-muted/80" />
          </div>
        </div>

        {/* Front document */}
        <div className="absolute left-2 top-16 w-[62%] -rotate-3 rounded-xl border border-border bg-card p-4 shadow-xl sm:left-4 sm:top-20">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-red text-[10px] font-bold text-white">
                PDF
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-14 rounded-full bg-brand-charcoal/20 dark:bg-foreground/20" />
                <div className="h-1.5 w-10 rounded-full bg-muted" />
              </div>
            </div>
            <div className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              Local
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-muted" />
            <div className="h-2 w-[90%] rounded-full bg-muted" />
            <div className="h-2 w-[75%] rounded-full bg-muted" />
            <div className="h-2 w-[60%] rounded-full bg-muted" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-brand-red/20 bg-brand-red/5 px-3 py-2">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-brand-red"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="text-[11px] font-medium text-brand-charcoal dark:text-foreground">
              Processed in your browser
            </span>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute bottom-6 left-0 rounded-xl border border-border bg-card px-3 py-2 shadow-md sm:bottom-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-brand-red"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Ready to download</p>
              <p className="text-xs font-semibold text-brand-charcoal dark:text-foreground">
                merged.pdf
              </p>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-md sm:top-4">
          <span className="text-brand-red">100%</span>
          <span className="text-muted-foreground"> private</span>
        </div>
      </div>
    </div>
  );
}
