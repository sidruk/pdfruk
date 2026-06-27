import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PopularTools } from "@/components/landing/popular-tools";
import { ToolCardGrid } from "@/components/landing/tool-card-grid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <PopularTools />
      <HowItWorks />
      <ToolCardGrid />
    </>
  );
}
