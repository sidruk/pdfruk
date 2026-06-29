import { Globe, ShieldCheck, Zap } from "lucide-react";

import { LandingBg } from "@/components/landing/landing-bg";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Privacy first",
    description:
      "Files are processed locally in your browser. Nothing is uploaded to our servers.",
    accent: "from-brand-red/20 to-brand-red/5",
    iconColor: "text-brand-red",
    glow: "bg-brand-red/20",
  },
  {
    icon: Zap,
    title: "Instant results",
    description:
      "No queues or waiting. Merge, split, and edit PDFs as soon as you drop your files.",
    accent: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-600 dark:text-amber-400",
    glow: "bg-amber-500/20",
  },
  {
    icon: Globe,
    title: "Works everywhere",
    description:
      "Use pdfruk on desktop, tablet, or phone. No install, no account, completely free.",
    accent: "from-sky-500/20 to-sky-500/5",
    iconColor: "text-sky-600 dark:text-sky-400",
    glow: "bg-sky-500/20",
  },
] as const;

export function Features() {
  return (
    <LandingBg variant="warm">
      <section className="border-y border-border/40 bg-card/30 backdrop-blur-sm dark:bg-card/20">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:grid-cols-3 sm:gap-6 sm:px-6 sm:py-16">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-red/20 hover:shadow-md dark:bg-card/60"
              >
                <div
                  className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${feature.glow} opacity-60`}
                  aria-hidden
                />
                <div className="relative flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} ring-1 ring-border/50`}
                  >
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} aria-hidden />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-brand-charcoal dark:text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </LandingBg>
  );
}
