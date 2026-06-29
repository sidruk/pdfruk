import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-card/80 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -left-32 bottom-0 h-48 w-48 rounded-full bg-brand-red/8 blur-3xl dark:bg-brand-red/12" />
        <div className="absolute -right-24 top-0 h-40 w-40 rounded-full bg-brand-charcoal/5 blur-3xl dark:bg-brand-charcoal/15" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center sm:px-6">
        <Logo width={140} height={36} />
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Free, privacy-first PDF tools. Your files never leave your device.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          100% browser-based · No uploads
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} pdfruk. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
