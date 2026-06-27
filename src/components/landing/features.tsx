import { Globe, ShieldCheck, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Privacy first",
    description:
      "Files are processed locally in your browser. Nothing is uploaded to our servers.",
    accent: "bg-brand-red/10 text-brand-red",
  },
  {
    icon: Zap,
    title: "Instant results",
    description:
      "No queues or waiting. Merge, split, and edit PDFs as soon as you drop your files.",
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Globe,
    title: "Works everywhere",
    description:
      "Use pdfruk on desktop, tablet, or phone. No install, no account, completely free.",
    accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
] as const;

export function Features() {
  return (
    <section className="border-y border-border/60 bg-card/50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3 sm:gap-8 sm:px-6 sm:py-16">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.accent}`}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-charcoal dark:text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
