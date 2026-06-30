import Link from "next/link";

export function IsItSafeToMergePdfOnlineContent() {
  return (
    <>
      <p>
        <strong>Short answer:</strong> it depends entirely on whether the tool
        uploads your files. Most online PDF mergers send your documents to a
        remote server, combine them there, and send the result back. A
        browser-based tool does the whole job on your own device, so the file
        never travels anywhere. If your PDFs contain anything private —
        contracts, medical records, bank statements, ID scans — that
        distinction is the whole ballgame.
      </p>
      <p>
        This guide explains what actually happens to a PDF when you merge it
        online, how to tell the two approaches apart, and how to combine files
        without uploading them at all.
      </p>

      <h2>What happens when you merge a PDF on most websites</h2>
      <p>
        When you drop a file into a typical online merger, here&apos;s the
        sequence: your browser uploads the raw PDF bytes to the company&apos;s
        server, the server stitches the documents together, stores the result
        temporarily, and serves you a download link.
      </p>
      <p>
        That means, for at least a short window, your document physically sits
        on a machine you don&apos;t control. Most reputable services delete files
        after an hour or so, and many use encrypted connections — but you are
        still trusting their retention policy, their security, and their staff.
        For a meeting agenda, fine. For a signed NDA or a patient record,
        you&apos;re handing a copy of something confidential to a third party
        you can&apos;t audit.
      </p>
      <p>
        The uncomfortable part: from the user&apos;s side, a server-side tool
        and a browser-based tool look identical. Same drag-and-drop box, same
        &quot;Merge&quot; button. The difference is invisible unless you go
        looking — which is exactly why so many people assume &quot;online&quot;
        must mean &quot;uploaded.&quot;
      </p>

      <h2>Server-side vs. browser-based: the difference that matters</h2>
      <p>
        There are two fundamentally different ways to merge a PDF online, and
        the privacy gap between them is enormous.
      </p>
      <ul>
        <li>
          <strong>Server-side (the common way).</strong> Your file leaves your
          device, gets processed on someone else&apos;s computer, and comes
          back. Privacy depends on a stranger&apos;s policies.
        </li>
        <li>
          <strong>Browser-based / client-side (the private way).</strong> The
          merging code runs inside your browser using JavaScript. Your PDF is
          read into memory locally, combined locally, and offered back to you
          as a download — all without a single byte being transmitted. No
          upload endpoint ever receives the file. Close the tab and everything
          is gone, because nothing was ever stored anywhere but your own RAM.
        </li>
      </ul>
      <p>
        A genuinely client-side tool can even work with your Wi-Fi switched off
        after the page loads. That&apos;s the simplest litmus test there is.
      </p>

      <h2>How to tell if a PDF tool actually uploads your files</h2>
      <p>
        You don&apos;t have to take anyone&apos;s word for it. Three ways to
        check, from easiest to most thorough:
      </p>
      <ol>
        <li>
          <strong>Go offline.</strong> Load the page, then turn off your
          internet. If you can still merge a file and download the result, the
          work is happening locally. If it stalls, your files were going to a
          server.
        </li>
        <li>
          <strong>Watch the Network tab.</strong> Open your browser&apos;s
          developer tools (F12 or right-click → Inspect → Network), then merge a
          file. On a client-side tool you&apos;ll see no request carrying your
          PDF&apos;s data uploaded. On a server-side tool you&apos;ll see a
          large outgoing request — that&apos;s your document leaving.
         </li>
        <li>
          <strong>Read the security page and look for open source.</strong>{" "}
          Tools serious about privacy explain their architecture and, ideally,
          publish their code so anyone can audit it. Vague reassurance
          (&quot;we take your privacy seriously&quot;) with no technical detail
          is a yellow flag.
        </li>
      </ol>

      <h2>When does merging PDFs online actually become risky?</h2>
      <p>
        To be fair, server-side merging isn&apos;t automatically dangerous —
        most people merge harmless documents and nothing bad ever happens. The
        risk concentrates around a few situations:
      </p>
      <ul>
        <li>
          The document is confidential — legal, medical, financial, or anything
          with personal identifiers.
        </li>
        <li>
          You&apos;re on a shared or work network where you don&apos;t know the
          data-handling rules.
        </li>
        <li>
          The tool is unfamiliar — no clear company behind it, no security
          page, no privacy policy.
        </li>
        <li>
          You&apos;d be uploading repeatedly — every upload is another copy on
          another server.
        </li>
      </ul>
      <p>
        If none of those apply, a mainstream tool is probably fine. If any of
        them do, browser-based merging removes the risk entirely rather than
        asking you to trust it away.
      </p>

      <h2>Merge PDFs without uploading them</h2>
      <p>
        The cleanest way to avoid all of this is to use a tool that never
        uploads in the first place. pdfruk&apos;s{" "}
        <Link href="/merge">merge tool</Link> runs entirely in your browser —
        drop your files, drag them into the order you want, click merge, and
        download the combined PDF. The files stay on your device the whole time,
        there&apos;s no account or sign-up, and you can verify the no-upload
        claim yourself using any of the checks above.
      </p>
      <p>
        For confidential documents especially, &quot;it never left my
        device&quot; is a stronger guarantee than &quot;they promised to delete
        it.&quot; Read our <Link href="/security">security page</Link> for the
        full breakdown of how pdfruk handles your files.
      </p>

      <h2>Frequently asked questions</h2>
      <h3>Is it safe to merge bank statements or medical records online?</h3>
      <p>
        Only with a tool that processes files in your browser. Avoid any merger
        that uploads to a server for documents like these — use a client-side
        tool so the file never leaves your device.
      </p>
      <h3>Do free online PDF mergers steal your data?</h3>
      <p>
        Most reputable ones don&apos;t, but &quot;free&quot; plus &quot;uploads
        your file&quot; means you&apos;re trusting their policies. A
        browser-based tool sidesteps the question because there&apos;s nothing
        to steal in transit — the file is never sent.
      </p>
      <h3>Can I merge PDFs completely offline?</h3>
      <p>
        Yes. A true client-side tool keeps working after the page has loaded
        even with your internet disconnected, because all the processing
        happens on your own device.
      </p>
      <h3>How do I know a tool isn&apos;t uploading my PDF?</h3>
      <p>
        Disconnect your internet after the page loads and try to merge — if it
        works, it&apos;s local. Or open your browser&apos;s Network tab and
        confirm no request carries your file&apos;s data out.
      </p>
    </>
  );
}
