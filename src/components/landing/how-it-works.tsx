import { ArrowRight, Download, MousePointerClick, Upload } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Upload,
    title: "Drop your files",
    description: "Drag PDFs into the tool or tap to browse from your device.",
  },
  {
    step: "02",
    icon: MousePointerClick,
    title: "Choose an action",
    description: "Merge, split, rotate, or convert — all processing stays on your device.",
  },
  {
    step: "03",
    icon: Download,
    title: "Download instantly",
    description: "Get your finished PDF in seconds. No email, no sign-up required.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-10 space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-red">
          How it works
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-brand-charcoal dark:text-foreground sm:text-4xl">
          Three steps. Zero uploads.
        </h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Every tool follows the same simple flow — fast, private, and free.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 sm:gap-4">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="relative">
              {index < STEPS.length - 1 ? (
                <ArrowRight
                  className="absolute -right-3 top-10 hidden h-5 w-5 text-muted-foreground/40 sm:block"
                  aria-hidden
                />
              ) : null}
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-brand-red/20">
                    {item.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
