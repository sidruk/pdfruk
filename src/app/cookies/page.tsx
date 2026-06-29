import Link from "next/link";

import { createStaticPage } from "@/lib/seo/create-static-page";
import { COOKIES_PAGE } from "@/lib/seo/static-pages";

const { metadata, StaticPageShell } = createStaticPage(COOKIES_PAGE);

export { metadata };

export default function CookiesPage() {
  return (
    <StaticPageShell>
      <p>
        This cookie policy explains what cookies are, how pdfruk uses them, and
        the choices you have. It should be read alongside our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a
        website. They help sites remember preferences, keep sessions secure, and
        understand how visitors use the service.
      </p>

      <h2>How we use cookies</h2>

      <h3>Essential cookies</h3>
      <p>
        These cookies are necessary for the Site to function. They may include
        cookies that remember your theme preference (light or dark mode) or
        support basic security features.
      </p>

      <h3>Analytics cookies</h3>
      <p>
        We may use Google Analytics or similar tools to collect aggregated,
        anonymous usage statistics — such as which pages are visited and how long
        users stay. This helps us improve pdfruk and prioritise the PDF tools
        our users need most.
      </p>

      <h3>What we do not use cookies for</h3>
      <ul>
        <li>Storing the contents of your PDF files.</li>
        <li>Tracking you across unrelated third-party websites for advertising.</li>
        <li>Requiring cookies to process PDFs in browser-based tools.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies through settings. Blocking
        all cookies may affect theme preferences and some site features, but
        core PDF tools that run in your browser — like{" "}
        <Link href="/merge">merge</Link> and <Link href="/split">split</Link> —
        will still work.
      </p>
      <p>
        To opt out of Google Analytics, you can install the{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Analytics Opt-out Browser Add-on
        </a>
        .
      </p>

      <h2>Updates</h2>
      <p>
        We may update this cookie policy when our practices change. Check the
        last updated date above for the current version.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies? Reach us via our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </StaticPageShell>
  );
}
