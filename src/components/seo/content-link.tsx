import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type ContentLinkProps = Omit<ComponentProps<typeof Link>, "target" | "rel">;

export function ContentLink({ className, ...props }: ContentLinkProps) {
  return (
    <Link
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "font-medium text-brand-red underline-offset-4 hover:underline",
        className,
      )}
      {...props}
    />
  );
}
