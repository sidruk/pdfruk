"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TOOL_CATEGORIES,
  TOOLS,
  getToolsByCategory,
  type ToolDefinition,
} from "@/config/tools";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { label: "Merge PDF", href: "/merge" },
  { label: "Split PDF", href: "/split" },
  { label: "Edit PDF", href: "/edit-pdf" },
] as const;

const CONVERT_TOOLS = getToolsByCategory("Convert");

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "whitespace-nowrap text-xs font-bold uppercase tracking-wide transition-colors sm:text-[13px]",
        active
          ? "text-brand-red"
          : "text-brand-charcoal hover:text-brand-red",
      )}
    >
      {label}
    </Link>
  );
}

function NavDropdown({
  label,
  tools,
  active,
  grouped = false,
}: {
  label: string;
  tools: ToolDefinition[];
  active?: boolean;
  grouped?: boolean;
}) {
  const groupedCategories = grouped
    ? TOOL_CATEGORIES.map((category) => ({
        category,
        tools: tools.filter((tool) => tool.category === category),
      })).filter((group) => group.tools.length > 0)
    : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold uppercase tracking-wide outline-none transition-colors sm:text-[13px]",
          active
            ? "text-brand-red"
            : "text-brand-charcoal hover:text-brand-red",
        )}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        {grouped
          ? groupedCategories.map((group, index) => (
              <DropdownMenuGroup key={group.category}>
                <DropdownMenuLabel>{group.category}</DropdownMenuLabel>
                {group.tools.map((tool) => (
                  <DropdownMenuItem
                    key={tool.id}
                    render={<Link href={tool.href} />}
                  >
                    {tool.title}
                  </DropdownMenuItem>
                ))}
                {index < groupedCategories.length - 1 ? (
                  <DropdownMenuSeparator />
                ) : null}
              </DropdownMenuGroup>
            ))
          : tools.map((tool) => (
              <DropdownMenuItem key={tool.id} render={<Link href={tool.href} />}>
                {tool.title}
              </DropdownMenuItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  const isConvertActive = CONVERT_TOOLS.some((tool) => tool.href === pathname);

  return (
    <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
      {PRIMARY_LINKS.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          active={pathname === link.href}
        />
      ))}
      <NavDropdown
        label="Convert PDF"
        tools={CONVERT_TOOLS}
        active={isConvertActive}
      />
      <NavDropdown label="All PDF Tools" tools={TOOLS} grouped />
    </nav>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-brand-charcoal hover:bg-muted"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background px-4 py-4 shadow-md">
          <nav className="flex flex-col gap-4">
            {PRIMARY_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href}
                onClick={() => setOpen(false)}
              />
            ))}

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Convert PDF
              </p>
              {CONVERT_TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block text-sm font-medium",
                    pathname === tool.href
                      ? "text-brand-red"
                      : "text-brand-charcoal",
                  )}
                >
                  {tool.title}
                </Link>
              ))}
            </div>

            {TOOL_CATEGORIES.map((category) => {
              const categoryTools = getToolsByCategory(category);
              return (
                <div key={category} className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {category}
                  </p>
                  {categoryTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block text-sm font-medium",
                        pathname === tool.href
                          ? "text-brand-red"
                          : "text-brand-charcoal",
                      )}
                    >
                      {tool.title}
                    </Link>
                  ))}
                </div>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <div className="h-1 bg-brand-charcoal" aria-hidden />
      <div className="relative border-b border-border/80 bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:gap-8 sm:px-6">
          <Logo size="md" priority />
          <DesktopNav pathname={pathname} />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <MobileNav pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  );
}
