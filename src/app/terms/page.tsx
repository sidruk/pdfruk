import Link from "next/link";

import { createStaticPage } from "@/lib/seo/create-static-page";
import { TERMS_PAGE } from "@/lib/seo/static-pages";

const { metadata, StaticPageShell } = createStaticPage(TERMS_PAGE);

export { metadata };

export default function TermsPage() {
  return (
    <StaticPageShell>
      <p>
        By accessing or using pdfruk.com (&quot;the Site&quot;) and its free PDF
        tools, you agree to these terms and conditions. If you do not agree,
        please do not use the Site.
      </p>

      <h2>Service description</h2>
      <p>
        pdfruk provides free online PDF utilities including merge, split,
        convert, edit, sign, compress, and related tools. Most tools run in your
        browser; some operations may use server-assisted processing as described
        on the relevant tool pages and in our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Site for any unlawful purpose or to process illegal content.</li>
        <li>Attempt to disrupt, overload, or compromise our systems.</li>
        <li>Scrape, reverse engineer, or automate access in a way that harms the service.</li>
        <li>Infringe the intellectual property or privacy rights of others.</li>
      </ul>

      <h2>No warranty</h2>
      <p>
        The Site and tools are provided &quot;as is&quot; and &quot;as
        available&quot; without warranties of any kind, express or implied. We do
        not guarantee that tools will be error-free, uninterrupted, or suitable
        for every document or use case.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, pdfruk and its operators shall not
        be liable for any indirect, incidental, special, or consequential damages
        arising from your use of the Site, including loss of data, corrupted
        files, or business interruption. You are responsible for keeping backups
        of important documents before processing.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Site design, branding, and original content are owned by pdfruk. You
        retain all rights to PDF files and content you upload or create using our
        tools.
      </p>

      <h2>Third-party links</h2>
      <p>
        The Site may link to third-party websites (such as social media). We are
        not responsible for their content or privacy practices.
      </p>

      <h2>Changes</h2>
      <p>
        We may modify these terms at any time. Continued use of the Site after
        changes constitutes acceptance of the updated terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by applicable laws in the jurisdiction where
        pdfruk operates, without regard to conflict-of-law principles.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these terms, please visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </StaticPageShell>
  );
}
