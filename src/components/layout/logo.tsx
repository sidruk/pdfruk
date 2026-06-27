import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
};

export function Logo({ className, width = 160, height = 40 }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/logo.png"
        alt="pdfruk"
        width={width}
        height={height}
        priority
        className="h-auto w-auto"
        style={{ width, height: "auto" }}
      />
    </Link>
  );
}
