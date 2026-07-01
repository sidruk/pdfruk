import Link from "next/link";

export function MergePdfWithoutUploadingContent() {
  return (
    <>
      <p>
        Combining multiple PDFs is one of the most common document tasks —
        merging scanned pages, joining report chapters, or bundling invoices for
        accounting. The challenge is finding a merge tool that is fast, free, and
        does not require uploading confidential files to a remote server.
      </p>

      <h2>Why merge in the browser?</h2>
      <p>
        When you merge PDFs in your browser, each file stays on your computer
        until you download the combined result. pdfruk&apos;s{" "}
        <Link href="/merge">merge PDF tool</Link> uses client-side processing,
        so there is no upload step and no waiting for a server queue. For
        sensitive documents, that is a meaningful privacy advantage.
      </p>

      <h2>Step-by-step: merge PDFs with pdfruk</h2>
      <ol>
        <li>
          Open the <Link href="/merge">merge PDF</Link> tool on pdfruk.
        </li>
        <li>
          Drag and drop two or more PDF files into the upload area, or click to
          browse your device.
        </li>
        <li>
          Reorder files by dragging them in the list — the top file becomes the
          first pages of the merged document.
        </li>
        <li>Click <strong>Merge PDFs</strong> and wait a few seconds.</li>
        <li>Download your combined PDF directly to your device.</li>
      </ol>

      <h2>Tips for better results</h2>
      <ul>
        <li>
          <strong>Check page orientation:</strong> If pages appear sideways, use
          the <Link href="/rotate">rotate PDF</Link> tool first.
        </li>
        <li>
          <strong>Remove unwanted pages:</strong> Use{" "}
          <Link href="/delete-reorder">delete & reorder</Link> before merging if
          you only need specific pages from a file.
        </li>
        <li>
          <strong>Large files:</strong> Very large PDFs may take longer depending
          on your device and browser. Close unused tabs to free memory.
        </li>
        <li>
          <strong>Keep backups:</strong> Always retain originals before combining
          important documents.
        </li>
      </ul>

      <h2>Merge vs other approaches</h2>
      <p>
        Desktop software can merge PDFs offline, but it requires installation and
        updates. Cloud merge services are quick but upload your files. Browser
        merge strikes a balance: no install, no account, and no upload — just
        open the page and work.
      </p>

      <h2>What to do after merging</h2>
      <p>
        Once merged, you might want to add{" "}
        <Link href="/page-numbers">page numbers</Link> or{" "}
        <Link href="/sign-pdf">sign</Link> the final document. All of these tools
        are available free on pdfruk with the same privacy-first approach.
      </p>
    </>
  );
}
