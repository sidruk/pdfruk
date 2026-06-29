import { LandingBg } from "@/components/landing/landing-bg";
import { SectionHeader } from "@/components/landing/section-header";
import { FAQ_ITEMS } from "@/lib/seo/faq";

export function Faq() {
  return (
    <LandingBg variant="warm">
      <section
        id="faq"
        className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
      >
        <SectionHeader
          eyebrow="FAQ"
          title="Common questions"
          description="Everything you need to know about pdfruk's free, privacy-first PDF tools."
          className="mb-10"
        />

        <dl className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm dark:bg-card/70"
            >
              <dt className="text-base font-semibold text-brand-charcoal dark:text-foreground">
                {item.question}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </LandingBg>
  );
}
