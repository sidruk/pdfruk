import { MAX_FILE_SIZE } from "@/lib/pdf/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDF_SERVICE_URL =
  process.env.COMPRESS_SERVICE_URL ?? "http://127.0.0.1:8000";

function protectedFilename(name: string): string {
  const base = name.replace(/\.pdf$/i, "");
  return `${base}-protected.pdf`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const password = formData.get("password");
  const allowPrint = formData.get("allowPrint");
  const allowCopy = formData.get("allowCopy");

  if (!(file instanceof File)) {
    return Response.json({ error: "A PDF file is required." }, { status: 400 });
  }

  if (typeof password !== "string" || !password.trim()) {
    return Response.json({ error: "Password is required." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.` },
      { status: 400 },
    );
  }

  const upstream = new FormData();
  upstream.append("file", file, file.name);
  upstream.append("password", password);
  upstream.append("allowPrint", typeof allowPrint === "string" ? allowPrint : "true");
  upstream.append("allowCopy", typeof allowCopy === "string" ? allowCopy : "false");

  let response: Response;

  try {
    response = await fetch(`${PDF_SERVICE_URL}/protect`, {
      method: "POST",
      body: upstream,
      signal: AbortSignal.timeout(55_000),
    });
  } catch {
    return Response.json(
      {
        error:
          "PDF service is unavailable. Start the Python service with npm run dev:compress.",
      },
      { status: 503 },
    );
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;
    return Response.json(
      { error: payload?.detail ?? "Failed to protect PDF." },
      { status: response.status },
    );
  }

  const protectedPdf = await response.arrayBuffer();

  return new Response(protectedPdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${protectedFilename(file.name)}"`,
    },
  });
}
