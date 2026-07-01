import Link from "next/link";

import { createStaticPage } from "@/lib/seo/create-static-page";
import { ABOUT_PAGE } from "@/lib/seo/static-pages";

const { metadata, StaticPageShell } = createStaticPage(ABOUT_PAGE);

export { metadata };

export default function AboutPage() {
  return (
    <StaticPageShell>
      <p>
        pdfruk was created to make everyday PDF tasks simple, fast, and private.
        Whether you need to merge contracts, split a report, convert images to
        PDF, or add a signature, our tools are free to use with no account
        required and no watermarks on your output.
      </p>

      <h2>Our mission</h2>
      <p>
        We believe document tools should respect your privacy. That is why all
        pdfruk utilities run entirely in your browser — your files stay on your
        device and are never uploaded for merge, split, edit, convert, sign, and
        similar tasks. Read how we protect your data on our{" "}
        <Link href="/security">security page</Link>.
      </p>

      <h2>What makes pdfruk different</h2>
      <ul>
        <li>
          <strong>Privacy-first:</strong> All tools run locally in your browser —
          your files are never uploaded to our servers.
        </li>
        <li>
          <strong>Truly free:</strong> No subscriptions, no paywalls, no hidden
          limits on basic features.
        </li>
        <li>
          <strong>Works everywhere:</strong> Modern browsers on desktop, tablet,
          and mobile — no software to install.
        </li>
        <li>
          <strong>Practical tools:</strong>{" "}
          <Link href="/merge">Merge</Link>, <Link href="/split">split</Link>,{" "}
          <Link href="/rotate">rotate</Link>, <Link href="/crop">crop</Link>,{" "}
          <Link href="/watermark">watermark</Link>,{" "}
          <Link href="/sign-pdf">sign</Link>, and more in one place.
        </li>
      </ul>

      <h2>Who we serve</h2>
      <p>
        pdfruk is used by students, freelancers, small businesses, and anyone who
        needs reliable PDF utilities without handing documents to unknown cloud
        services. From one-off tasks to daily document workflows, we aim to be
        the fastest path from problem to finished PDF.
      </p>

      <h2>Get in touch</h2>
      <p>
        We welcome feedback, feature ideas, and partnership enquiries. Visit our{" "}
        <Link href="/contact">contact page</Link>, explore tips on our{" "}
        <Link href="/blog">blog</Link>, or browse all tools on the{" "}
        <Link href="/#tools">homepage</Link>.
      </p>
    </StaticPageShell>
  );
}
