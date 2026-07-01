import Link from "next/link";

import { createStaticPage } from "@/lib/seo/create-static-page";
import { PRIVACY_PAGE } from "@/lib/seo/static-pages";
import { SITE_CONTACT_EMAIL } from "@/lib/seo/site";

const { metadata, StaticPageShell } = createStaticPage(PRIVACY_PAGE);

export { metadata };

export default function PrivacyPage() {
  return (
    <StaticPageShell>
      <p>
        pdfruk (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides free
        PDF tools at pdfruk.com. This privacy policy describes how we collect,
        use, and protect information when you visit our website or use our
        online PDF merge, split, convert, and edit services.
      </p>

      <h2>PDF files and document content</h2>
      <p>
        For all tools, your PDF files are processed entirely in your browser and
        are never uploaded to our servers. We cannot access the content of files
        processed locally on your device — including when you{" "}
        <Link href="/merge">merge PDFs</Link>,{" "}
        <Link href="/split">split documents</Link>, or{" "}
        <Link href="/sign-pdf">add a signature</Link>.
      </p>

      <h2>Information we may collect</h2>
      <ul>
        <li>
          <strong>Usage analytics:</strong> We may use Google Analytics or similar
          services to understand how visitors use our site (pages viewed, device
          type, approximate location). This helps us improve our tools.
        </li>
        <li>
          <strong>Technical data:</strong> Standard server logs may include IP
          address, browser type, and referring URL for security and diagnostics.
        </li>
        <li>
          <strong>Contact information:</strong> If you reach out via WhatsApp,
          phone, or email, we retain your message only as long as needed to
          respond.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use cookies and similar technologies for essential site functionality,
        theme preferences, and analytics. See our{" "}
        <Link href="/cookies">cookie policy</Link> for details on what we use and
        how to opt out.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, maintain, and improve our website and PDF tools.</li>
        <li>To respond to enquiries and provide customer support.</li>
        <li>To monitor security and prevent abuse.</li>
        <li>To comply with legal obligations where applicable.</li>
      </ul>

      <h2>Data sharing</h2>
      <p>
        We do not sell your personal information. We may share limited data with
        service providers (such as hosting or analytics providers) who process
        data on our behalf under appropriate agreements. Learn more in our{" "}
        <Link href="/security">security overview</Link>.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, or
        delete personal data we hold about you. To exercise these rights, contact
        us at{" "}
        <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
      </p>

      <h2>Children</h2>
      <p>
        pdfruk is not directed at children under 13. We do not knowingly collect
        personal information from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &quot;last updated&quot;
        date at the top of this page indicates when it was last revised.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this privacy policy? Visit our{" "}
        <Link href="/contact">contact page</Link> or email{" "}
        <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
      </p>
    </StaticPageShell>
  );
}
