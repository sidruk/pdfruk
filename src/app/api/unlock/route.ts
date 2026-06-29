import { MAX_FILE_SIZE } from "@/lib/pdf/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDF_SERVICE_URL =
  process.env.COMPRESS_SERVICE_URL ?? "http://127.0.0.1:8000";

function unlockedFilename(name: string): string {
  const base = name.replace(/\.pdf$/i, "");
  return `${base}-unlocked.pdf`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const password = formData.get("password");

  if (!(file instanceof File)) {
    return Response.json({ error: "A PDF file is required." }, { status: 400 });
  }

  if (typeof password !== "string" || !password) {
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

  let response: Response;

  try {
    response = await fetch(`${PDF_SERVICE_URL}/unlock`, {
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
      { error: payload?.detail ?? "Failed to unlock PDF." },
      { status: response.status },
    );
  }

  const unlockedPdf = await response.arrayBuffer();

  return new Response(unlockedPdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${unlockedFilename(file.name)}"`,
    },
  });
}
