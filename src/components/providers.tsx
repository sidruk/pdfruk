"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {!isAdminRoute ? <Header /> : null}
      <main className={isAdminRoute ? "min-h-screen" : "min-h-[calc(100vh-8rem)]"}>
        {children}
      </main>
      {!isAdminRoute ? <Footer /> : null}
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
