"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { trackGa4PageView } from "@/lib/analytics/ga4";

export function Ga4PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    trackGa4PageView(path);
  }, [pathname, searchParams]);

  return null;
}
