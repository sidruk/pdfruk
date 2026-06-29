import { Features } from "@/components/landing/features";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PdfGuide } from "@/components/landing/pdf-guide";
import { PopularTools } from "@/components/landing/popular-tools";
import { ToolCardGrid } from "@/components/landing/tool-card-grid";
import { JsonLd } from "@/lib/seo/json-ld";
import {
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/metadata";
import { FAQ_ITEMS } from "@/lib/seo/faq";

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildWebSiteJsonLd(),
          buildFaqJsonLd(FAQ_ITEMS),
        ]}
      />
      <Hero />
      <Features />
      <PopularTools />
      <HowItWorks />
      <ToolCardGrid />
      <PdfGuide />
      <Faq />
    </>
  );
}
