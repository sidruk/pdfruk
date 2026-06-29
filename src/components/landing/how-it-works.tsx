import { Download, MousePointerClick, Upload } from "lucide-react";

import { LandingBg } from "@/components/landing/landing-bg";
import { SectionHeader } from "@/components/landing/section-header";

const STEPS = [
  {
    step: "01",
    icon: Upload,
    title: "Drop your files",
    description: "Drag PDFs into the tool or tap to browse from your device.",
    visual: (
      <div className="relative mx-auto h-28 w-full max-w-[180px]">
        <div className="absolute inset-x-0 bottom-0 rounded-xl border-2 border-dashed border-brand-red/30 bg-brand-red/5 p-4">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-5 w-5 text-brand-red/70" />
            <div className="h-1.5 w-16 rounded-full bg-brand-red/20" />
          </div>
        </div>
        <div className="absolute -right-2 top-0 w-[55%] rotate-6 rounded-lg border border-border/60 bg-card p-2 shadow-md">
          <div className="mb-1.5 h-1.5 w-8 rounded-full bg-muted" />
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full bg-muted" />
            <div className="h-1 w-3/4 rounded-full bg-muted" />
          </div>
        </div>
        <div className="absolute -left-1 top-3 w-[55%] -rotate-3 rounded-lg border border-border bg-card p-2 shadow-lg">
          <div className="mb-1 flex items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-brand-red text-[6px] font-bold text-white">
              PDF
            </div>
            <div className="h-1 w-6 rounded-full bg-muted" />
          </div>
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full bg-muted" />
            <div className="h-1 w-2/3 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    icon: MousePointerClick,
    title: "Choose an action",
    description:
      "Merge, split, rotate, or convert — all processing stays on your device.",
    visual: (
      <div className="relative mx-auto flex h-28 w-full max-w-[180px] flex-col items-center justify-center gap-2">
        <div className="flex gap-2">
          {["Merge", "Split", "Rotate"].map((label, i) => (
            <div
              key={label}
              className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold shadow-sm ${
                i === 0
                  ? "border-brand-red/40 bg-brand-red text-white shadow-brand-red/20"
                  : "border-border/60 bg-card text-muted-foreground"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <MousePointerClick className="h-5 w-5 text-brand-red/60" />
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
            On your device
          </span>
        </div>
      </div>
    ),
  },
  {
    step: "03",
    icon: Download,
    title: "Download instantly",
    description:
      "Get your finished PDF in seconds. No email, no sign-up required.",
    visual: (
      <div className="relative mx-auto flex h-28 w-full max-w-[180px] flex-col items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 ring-4 ring-brand-red/5">
          <Download className="h-5 w-5 text-brand-red" />
        </div>
        <div className="w-full rounded-xl border border-border bg-card p-3 shadow-md">
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
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Ready</p>
              <p className="text-xs font-semibold text-brand-charcoal dark:text-foreground">
                output.pdf
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
] as const;

export function HowItWorks() {
  return (
    <LandingBg variant="muted">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps. Zero uploads."
          description="Every tool follows the same simple flow — fast, private, and free."
          className="mb-14"
        />

        <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
          <div
            className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-[140px] hidden h-px bg-gradient-to-r from-brand-red/20 via-brand-red/40 to-brand-red/20 sm:block"
            aria-hidden
          />

          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative flex flex-col">
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/25 hover:shadow-lg dark:bg-card/70">
                  <div className="border-b border-border/40 bg-gradient-to-br from-muted/50 to-transparent px-6 py-8">
                    {item.visual}
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-bold tabular-nums text-brand-red/15 transition-colors group-hover:text-brand-red/25">
                        {item.step}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red ring-1 ring-brand-red/20">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-brand-charcoal dark:text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </section>
    </LandingBg>
  );
}
