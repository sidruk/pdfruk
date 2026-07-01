import Link from "next/link";

export function PasswordProtectPdfJobApplicationsContent() {
  return (
    <>
      <p>
        <strong>Short answer:</strong> password-protecting a job-application PDF
        adds a simple access barrier so your CV, cover letter, or portfolio
        isn&apos;t readable by anyone who intercepts the file or stumbles on an
        old download link. Use a strong, unique password, share it separately
        from the attachment, and pick a tool that encrypts the file on your own
        device so your application data never uploads to a third-party server.
      </p>
      <p>
        This guide covers when password protection makes sense for job seekers in
        2026, how to set it up step by step, and what recruiters expect when they
        receive a locked PDF.
      </p>

      <h2>Why password-protect a PDF for job applications?</h2>
      <p>
        A standard PDF attachment is easy to forward, archive, or leave on a
        shared drive long after you&apos;ve moved on. If your application includes
        personal details — home address, phone number, employment history,
        references, or salary expectations — that exposure can linger in places
        you never intended.
      </p>
      <p>
        Password protection does not make a file unbreakable, but it does raise
        the bar. Someone who receives the PDF without the password cannot open
        it. That is useful when:
      </p>
      <ul>
        <li>
          You email applications to a general inbox and want a modest safeguard
          against casual forwarding.
        </li>
        <li>
          Your CV includes sensitive identifiers you would not post publicly.
        </li>
        <li>
          You are applying in regulated sectors (finance, healthcare, legal)
          where hiring teams routinely handle confidential documents.
        </li>
        <li>
          You reuse a portfolio PDF across multiple employers and want control
          over who can open each copy.
        </li>
      </ul>
      <p>
        It is not a substitute for sending files only to legitimate recruiters
        or using an employer&apos;s secure portal — but it is a low-effort layer
        many candidates overlook.
      </p>

      <h2>What recruiters actually experience</h2>
      <p>
        Hiring teams process hundreds of PDFs. A locked file is fine as long as
        you make opening it frictionless:
      </p>
      <ul>
        <li>
          Put the password in the email body or cover-letter text — never only in
          the PDF filename.
        </li>
        <li>
          Use a readable password (not a string of random symbols that gets
          mangled on mobile). A passphrase like{" "}
          <code>March2026-Smith-App</code> is easier to type than{" "}
          <code>xK9#mP2!qR</code>.
        </li>
        <li>
          Name the file clearly: <code>Jane-Smith-CV.pdf</code>, not{" "}
          <code>document-final-v3.pdf</code>.
        </li>
        <li>
          Mention in one line that the attachment is password-protected and where
          to find the password.
        </li>
      </ul>
      <p>
        Some applicant-tracking systems strip attachments or flag encrypted PDFs.
        If an employer asks for an unprotected copy through their official portal,
        follow their process — password protection is your choice for direct
        email, not a battle with HR software.
      </p>

      <h2>How to password-protect a PDF (step by step)</h2>
      <p>
        You do not need Adobe Acrobat or a paid desktop licence. A browser-based
        tool that runs locally keeps your CV off someone else&apos;s servers:
      </p>
      <ol>
        <li>
          Open pdfruk&apos;s <Link href="/protect">Protect PDF</Link> tool.
        </li>
        <li>Upload your finished CV or application PDF.</li>
        <li>
          Enter a password and confirm it. Optionally restrict printing or
          copying if you want tighter control.
        </li>
        <li>
          Click protect and download the encrypted file. Processing happens
          entirely in your browser — your document and password are not sent to
          our servers.
        </li>
        <li>
          Email the protected PDF and share the password in the message body (or
          by phone if the employer prefers).
        </li>
      </ol>
      <p>
        If you need to combine a cover letter and CV first, use{" "}
        <Link href="/merge">Merge PDF</Link> (also browser-based) and then
        protect the merged file. Read our{" "}
        <Link href="/security">security overview</Link> for how client-side
        encryption works.
      </p>

      <h2>Choosing a password you can share safely</h2>
      <p>
        The password protects the file from casual access, not from the
        recruiter you are applying to. Treat it like a hotel-room key: useful
        for the intended recipient, not a secret you must guard forever.
      </p>
      <ul>
        <li>
          <strong>Do:</strong> use a unique password per application batch if you
          are worried about reuse.
        </li>
        <li>
          <strong>Do:</strong> avoid passwords you use for email or banking.
        </li>
        <li>
          <strong>Don&apos;t:</strong> embed the password inside the PDF
          metadata or filename alone.
        </li>
        <li>
          <strong>Don&apos;t:</strong> assume encryption hides the file from
          malware on a compromised recruiter machine — it only blocks opening
          without the key.
        </li>
      </ul>

      <h2>Browser-based vs cloud PDF encryptors</h2>
      <p>
        Many &quot;free protect PDF&quot; sites upload your CV to their servers,
        encrypt it there, and return a download. That means a copy of your
        application — including everything on page one — sat on infrastructure
        you did not choose, often under a vague retention policy.
      </p>
      <p>
        For job applications, client-side encryption is the stronger default: the
        file never leaves your laptop or phone during protection. You can verify
        this by loading the protect page, disconnecting from the internet, and
        completing the task — if it still works, nothing was uploaded.
      </p>

      <h2>When password protection is not enough</h2>
      <p>
        Skip password-only protection if you are sending highly classified
        material (you should not be emailing that anyway), if the employer
        mandates their portal, or if the PDF must be parsed automatically by
        screening software. In those cases, follow the employer&apos;s
        instructions or redact sensitive lines before sending.
      </p>
      <p>
        For typical 2026 job applications — CV, cover letter, certificates —
        a locally encrypted PDF plus a clear password in the email is a
        practical, privacy-conscious habit worth adopting.
      </p>

      <h2>Frequently asked questions</h2>
      <h3>Should I password-protect every job application?</h3>
      <p>
        Not necessarily. Use it when the PDF contains data you would not want
        forwarded casually, or when the employer accepts email attachments
        without an ATS upload step. Portal applications usually do not need it.
      </p>
      <h3>Can recruiters open password-protected PDFs on mobile?</h3>
      <p>
        Yes. Modern PDF viewers on iOS and Android open standard encrypted PDFs
        as long as you provide the password in plain text in your email.
      </p>
      <h3>Does pdfruk store my CV or password?</h3>
      <p>
        No. The protect tool encrypts your file in the browser. We do not receive
        your document contents or the password you set.
      </p>
      <h3>What if my PDF is already password-protected?</h3>
      <p>
        You will need to <Link href="/unlock">unlock</Link> it first (with the
        current password), make any edits, then protect it again with a new
        password for the application.
      </p>
    </>
  );
}
