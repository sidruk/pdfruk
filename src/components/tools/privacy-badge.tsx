"use client";

import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function PrivacyBadge({ label }: { label?: string }) {
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 border-brand-red/20 bg-brand-red/5 px-3 py-1 text-xs font-medium text-brand-charcoal"
    >
      <ShieldCheck className="h-3.5 w-3.5 text-brand-red" aria-hidden />
      {label ?? "Your files never leave your device"}
    </Badge>
  );
}
