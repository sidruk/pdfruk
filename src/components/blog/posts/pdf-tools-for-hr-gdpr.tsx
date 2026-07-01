import Link from "next/link";

export function PdfToolsForHrGdprContent() {
  return (
    <>
      <p>
        <strong>Short answer:</strong> HR teams handle some of the most
        sensitive personal data a company processes — CVs, contracts, medical
        notes, disciplinary records. Under the UK GDPR and EU GDPR (as of July
        2026), the PDF tools you choose matter because every upload to a
        third-party cloud editor can count as sharing personal data with a
        processor. Prefer tools that process files locally in the browser, avoid
        unnecessary uploads, and document what happens to employee documents at
        each step.
      </p>
      <p>
        This guide explains what HR and People teams should look for in PDF
        software, which GDPR principles apply, and how to merge, redact, sign,
        or protect employee files without creating compliance gaps.
      </p>

      <h2>Why PDF tools are a GDPR blind spot in HR</h2>
      <p>
        HR workflows are PDF-heavy: offer letters, policy acknowledgements,
        right-to-work checks, performance reviews, and exit paperwork. When a
        recruiter merges CVs on a random &quot;free PDF merger&quot; website,
        that action can trigger data-protection obligations people do not
        associate with a thirty-second drag-and-drop task.
      </p>
      <p>
        Under GDPR, personal data is any information relating to an identifiable
        person. A CV alone usually qualifies. Uploading it to an online tool
        typically means:
      </p>
      <ul>
        <li>
          You are <strong>disclosing</strong> candidate data to the tool
          provider (often as a data processor or, worse, an unvetted
          sub-processor).
        </li>
        <li>
          You may need a <strong>legal basis</strong> and, for processors,
          appropriate <strong>contracts (DPAs)</strong> and transfer safeguards
          if data leaves the UK/EEA.
        </li>
        <li>
          You must be able to explain retention — how long the provider keeps
          files, who can access them, and whether they are used for training or
          analytics.
        </li>
      </ul>
      <p>
        The ICO and EU supervisory authorities do not publish a list of
        &quot;approved PDF tools,&quot; but they do expect proportionate
        security and documented processing. A browser-based tool that never
        receives the file sidesteps a large class of processor risk for everyday
        tasks.
      </p>

      <h2>GDPR checklist for HR PDF workflows</h2>
      <p>
        Use this as a quick filter before rolling out any PDF utility to
        recruiters, HR business partners, or line managers:
      </p>
      <ol>
        <li>
          <strong>Data minimisation.</strong> Only process the pages or fields
          you need. Split or redact before sharing externally.
        </li>
        <li>
          <strong>Purpose limitation.</strong> Do not reuse candidate exports
          for unrelated marketing or analytics.
        </li>
        <li>
          <strong>Storage limitation.</strong> Delete local downloads and
          browser caches on shared machines after the task.
        </li>
        <li>
          <strong>Integrity and confidentiality.</strong> Prefer encryption in
          transit (HTTPS) and at rest where files must be stored. Password-protect
          sensitive packs when emailing is unavoidable.
        </li>
        <li>
          <strong>Processor due diligence.</strong> For any tool that uploads
          files, obtain a DPA, confirm sub-processors, and record the processing
          in your RoPA (record of processing activities).
        </li>
        <li>
          <strong>Staff training.</strong> &quot;Free online PDF&quot; is not a
          neutral phrase — it can mean your employee data is now on a server in
          another jurisdiction.
        </li>
      </ol>

      <h2>Upload-based vs browser-based tools</h2>
      <p>
        The architectural split matters more than the marketing copy:
      </p>
      <ul>
        <li>
          <strong>Server-side tools</strong> receive the full document. Even
          with a privacy policy promising deletion, you have shared personal data
          with a vendor. That is not automatically unlawful — but it must be
          governed.
        </li>
        <li>
          <strong>Client-side / browser-based tools</strong> process PDFs in
          memory on the user&apos;s device. For merge, split, edit, sign,
          watermark, protect, and unlock, pdfruk does not receive file contents.
          That aligns well with confidentiality expectations for HR documents
          without adding a new processor relationship for those tasks.
        </li>
      </ul>

      <h2>Common HR tasks and lower-risk approaches</h2>
      <h3>Merging application packs</h3>
      <p>
        Combining a CV, cover letter, and certificates is routine. Use a{" "}
        <Link href="/merge">browser-based merge</Link> so candidate data never
        leaves the recruiter&apos;s machine. Avoid consumer tools with unclear
        ownership or aggressive cookie tracking on pages that handle
        applications.
      </p>
      <h3>Splitting and redacting</h3>
      <p>
        Before disclosing part of a file to a hiring manager,{" "}
        <Link href="/split">split</Link> out only the relevant pages. Remove
        referee contact details or salary history when they are not needed for
        the stage.
      </p>
      <h3>Contracts and signatures</h3>
      <p>
        Employment contracts often need a signature. Client-side{" "}
        <Link href="/sign-pdf">signing</Link> keeps the draft contract off a
        third-party server during preparation. For legally qualified e-signature
        platforms with audit trails, use your organisation&apos;s approved
        vendor — pdfruk is suited to informal sign-offs and internal drafts, not
        replacing a certified QES provider where law requires it.
      </p>
      <h3>Password-protecting packs for email</h3>
      <p>
        When email is the only channel,{" "}
        <Link href="/protect">password-protect</Link> disciplinary or medical
        attachments and share passwords through a separate channel. Encryption
        runs locally on pdfruk — the password and file are not transmitted to
        us.
      </p>
      <h3>Onboarding forms</h3>
      <p>
        Use <Link href="/pdf-forms">fill form</Link> for standard PDF forms in
        the browser when employees complete paperwork on trusted devices, not
        on unattended kiosks.
      </p>

      <h2>What to document for your DPO or compliance team</h2>
      <p>
        Even with privacy-friendly tools, HR should keep lightweight records:
      </p>
      <ul>
        <li>Which tools are approved for which data categories (candidates vs
        employees vs special-category data).</li>
        <li>Whether each tool uploads data or processes locally.</li>
        <li>Retention and deletion steps for downloads and shared links.</li>
        <li>Whether managers may use personal devices or only managed laptops.</li>
      </ul>
      <p>
        pdfruk does not require accounts for core tools, which reduces another
        GDPR surface area (credential databases linking users to document
        activity). Read our <Link href="/privacy">privacy policy</Link> for site
        analytics and hosting — distinct from PDF file processing.
      </p>

      <h2>Red flags when evaluating &quot;HR PDF&quot; vendors</h2>
      <ul>
        <li>No clear data-processing agreement for EU/UK customers.</li>
        <li>Vague &quot;we may retain files to improve our service&quot; language.</li>
        <li>Mandatory sign-up that stores document metadata indefinitely.</li>
        <li>Watermarked outputs that embed vendor branding in employee records.</li>
        <li>No security page explaining upload vs local processing.</li>
        <li>AI features that train on uploaded HR documents without explicit
        consent and contractual guarantees.</li>
      </ul>

      <h2>Practical policy wording for HR teams</h2>
      <p>
        A one-paragraph acceptable-use note in your HR handbook goes a long way:
        approved tools only; no uploading candidate or employee personal data to
        unvetted websites; prefer browser-based processing; delete local copies
        after use; use company-managed e-sign for binding contracts. Point
        staff to internal guidance rather than leaving them to search &quot;merge
        PDF free&quot; during a hiring surge.
      </p>

      <h2>Frequently asked questions</h2>
      <h3>Is uploading a CV to an online PDF tool a GDPR breach?</h3>
      <p>
        Not automatically — but it is a processing activity that must be lawful,
        documented, and secured. Uploading to an unknown free site without a DPA
        is a common compliance gap, not a recommended practice.
      </p>
      <h3>Are browser-based PDF tools GDPR-compliant by default?</h3>
      <p>
        No tool is &quot;GDPR-certified&quot; in isolation. Local processing
        reduces processor risk for file contents, but you still need appropriate
        policies, device security, and lawful bases for handling personal data.
      </p>
      <h3>Can we use pdfruk for candidate CVs?</h3>
      <p>
        Many teams use client-side tools for merge, split, and protect tasks
        because files stay on the user&apos;s device. Your DPO should confirm fit
        with your policies, especially for special-category data where extra
        safeguards apply.
      </p>
      <h3>What about AI PDF summarisers for HR?</h3>
      <p>
        Treat them as high-risk: they typically upload full documents to model
        providers. pdfruk does not use your PDF content to train AI models. For
        HR, avoid pasting employee data into unapproved AI tools altogether.
      </p>
    </>
  );
}
