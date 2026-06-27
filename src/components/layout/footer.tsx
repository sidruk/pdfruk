import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <Logo width={140} height={36} />
        <p className="max-w-md text-sm text-muted-foreground">
          Free, privacy-first PDF tools. Your files never leave your device.
        </p>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} pdfruk. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
