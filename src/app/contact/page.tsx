import Link from "next/link";
import { Globe, Mail, Phone } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createStaticPage } from "@/lib/seo/create-static-page";
import { buildContactPageJsonLd } from "@/lib/seo/metadata";
import { CONTACT_PAGE } from "@/lib/seo/static-pages";
import {
  SITE_CONTACT_EMAIL,
  SITE_FACEBOOK_URL,
  SITE_PHONE,
  SITE_WHATSAPP_URL,
} from "@/lib/seo/site";
import { cn } from "@/lib/utils";

const { metadata, StaticPageShell } = createStaticPage(CONTACT_PAGE);

export { metadata };

const CONTACT_CHANNELS = [
  {
    title: "WhatsApp",
    description: "Fastest way to reach us for support or questions.",
    href: SITE_WHATSAPP_URL,
    label: "Chat on WhatsApp",
    external: true,
    icon: WhatsAppIcon,
  },
  {
    title: "Phone",
    description: "Call us during business hours (GMT+5).",
    href: `tel:${SITE_PHONE}`,
    label: SITE_PHONE,
    external: false,
    icon: Phone,
  },
  {
    title: "Email",
    description: "For general enquiries, privacy requests, or press.",
    href: `mailto:${SITE_CONTACT_EMAIL}`,
    label: SITE_CONTACT_EMAIL,
    external: false,
    icon: Mail,
  },
  {
    title: "Facebook",
    description: "Follow updates and message us on Facebook.",
    href: SITE_FACEBOOK_URL,
    label: "pdfruk on Facebook",
    external: true,
    icon: Globe,
  },
] as const;

export default function ContactPage() {
  return (
    <StaticPageShell extraJsonLd={buildContactPageJsonLd()}>
      <p>
        Have a question about our free PDF tools, found a bug, or want to discuss
        a partnership? Choose the channel that works best for you. We typically
        respond within one business day.
      </p>

      <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
        {CONTACT_CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <Card key={channel.title} className="border-border/60 shadow-sm">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                  {channel.title === "WhatsApp" ? (
                    <Icon />
                  ) : (
                    <Icon className="h-5 w-5" aria-hidden />
                  )}
                </div>
                <CardTitle>{channel.title}</CardTitle>
                <CardDescription>{channel.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={channel.href}
                  {...(channel.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full justify-center",
                  )}
                >
                  {channel.label}
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2>Before you contact us</h2>
      <p>
        Many common questions are answered in our{" "}
        <Link href="/#faq">FAQ</Link> on the homepage. For security or privacy
        matters, you may also review our{" "}
        <Link href="/security">security</Link> and{" "}
        <Link href="/privacy">privacy</Link> pages.
      </p>

      <h2>Press & media</h2>
      <p>
        Journalists and bloggers can find logos, boilerplate, and media contact
        details on our <Link href="/press">press page</Link>.
      </p>
    </StaticPageShell>
  );
}
