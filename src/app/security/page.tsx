import Link from "next/link";

import { createStaticPage } from "@/lib/seo/create-static-page";
import { SECURITY_PAGE } from "@/lib/seo/static-pages";

const { metadata, StaticPageShell } = createStaticPage(SECURITY_PAGE);

export { metadata };

export default function SecurityPage() {
  return (
    <StaticPageShell>
      <p>
        pdfruk is built around a simple principle: your PDFs should stay on your
        device whenever possible. Most of our free online PDF tools run entirely
        in your browser using client-side JavaScript — files are not uploaded to
        our servers for{" "}
        <Link href="/merge">merge</Link>, <Link href="/split">split</Link>,{" "}
        <Link href="/rotate">rotate</Link>, convert,{" "}
        <Link href="/edit-pdf">edit</Link>, <Link href="/sign-pdf">sign</Link>,{" "}
        <Link href="/watermark">watermark</Link>, <Link href="/protect">protect</Link>,{" "}
        <Link href="/unlock">unlock</Link>, or page-number tasks.
      </p>

      <h2>Browser-based PDF processing</h2>
      <p>
        When you use a client-side tool, your PDF is read and processed in
        memory inside your browser. The result is generated locally and
        downloaded directly to your device. We do not receive, store, or retain
        those files — making pdfruk one of the most private ways to work with
        PDFs online.
      </p>

      <h2>Server-assisted tools</h2>
      <p>
        A small number of tools — including{" "}
        <Link href="/compress">compress</Link> — may send files to a backend
        service to perform operations that are difficult to run reliably in the
        browser. When you use these tools:
      </p>
      <ul>
        <li>Files are transmitted over encrypted HTTPS connections.</li>
        <li>Processing is performed only to complete your requested task.</li>
        <li>Files are not kept longer than necessary to deliver the result.</li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell your documents or personal data.</li>
        <li>We do not require an account to use our free tools.</li>
        <li>We do not add watermarks to your output files.</li>
        <li>We do not use your PDF content to train AI models.</li>
      </ul>

      <h2>Your responsibilities</h2>
      <p>
        Because processing happens on your device or through a one-off server
        request, you remain in control of what you process. Use pdfruk on trusted
        devices, keep your browser updated, and avoid processing highly sensitive
        documents on shared or public computers. Read our{" "}
        <Link href="/privacy">privacy policy</Link> for full details on data
        handling.
      </p>

      <h2>Reporting security issues</h2>
      <p>
        If you discover a security vulnerability, please contact us via our{" "}
        <Link href="/contact">contact page</Link>. We take responsible disclosure
        seriously and will work to investigate and resolve verified issues
        promptly.
      </p>
    </StaticPageShell>
  );
}
