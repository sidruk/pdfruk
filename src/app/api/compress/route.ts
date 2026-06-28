import { MAX_FILE_SIZE } from "@/lib/pdf/constants";
import { compressedFilename } from "@/lib/pdf/compress-presets";
import type { CompressPreset } from "@/types/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const COMPRESS_SERVICE_URL =
  process.env.COMPRESS_SERVICE_URL ?? "http://127.0.0.1:8000";

const VALID_PRESETS = new Set<CompressPreset>(["low", "medium", "high"]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const preset = formData.get("preset");

  if (!(file instanceof File)) {
    return Response.json({ error: "A PDF file is required." }, { status: 400 });
  }

  if (typeof preset !== "string" || !VALID_PRESETS.has(preset as CompressPreset)) {
    return Response.json({ error: "Invalid compression preset." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.` },
      { status: 400 },
    );
  }

  const upstream = new FormData();
  upstream.append("file", file, file.name);
  upstream.append("preset", preset);

  let response: Response;

  try {
    response = await fetch(`${COMPRESS_SERVICE_URL}/compress`, {
      method: "POST",
      body: upstream,
      signal: AbortSignal.timeout(55_000),
    });
  } catch {
    return Response.json(
      {
        error:
          "Compression service is unavailable. Start the Python service with npm run dev:compress.",
      },
      { status: 503 },
    );
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;
    return Response.json(
      { error: payload?.detail ?? "Failed to compress PDF." },
      { status: response.status },
    );
  }

  const compressed = await response.arrayBuffer();
  const originalSize = Number(response.headers.get("X-Original-Size") ?? file.size);
  const compressedSize = Number(
    response.headers.get("X-Compressed-Size") ?? compressed.byteLength,
  );

  return new Response(compressed, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${compressedFilename(file.name)}"`,
      "X-Original-Size": String(originalSize),
      "X-Compressed-Size": String(compressedSize),
    },
  });
}
