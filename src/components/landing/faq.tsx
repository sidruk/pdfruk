import { LandingBg } from "@/components/landing/landing-bg";
import { SectionHeader } from "@/components/landing/section-header";
import { FaqAccordion } from "@/components/seo/faq-accordion";
import { FAQ_ITEMS } from "@/lib/seo/faq";

export function Faq() {
  return (
    <LandingBg variant="warm">
      <section
        id="faq"
        className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
      >
        <SectionHeader
          title="FAQ"
          description="Everything you need to know about pdfruk's free, privacy-first PDF tools."
          className="mb-10"
        />

        <FaqAccordion items={FAQ_ITEMS} showTitle={false} />
      </section>
    </LandingBg>
  );
}
