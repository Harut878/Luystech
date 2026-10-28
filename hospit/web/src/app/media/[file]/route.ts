import { dbConfigured, q1 } from "@/lib/db";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /media/<uuid>.<ext> → ադմինկայից վերբեռնված նկարը (media աղյուսակից)
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const id = file.split(".")[0];
  if (!UUID_RE.test(id) || !dbConfigured()) return new Response("Not found", { status: 404 });

  let row: { content_type: string; data: Buffer } | null = null;
  try {
    row = await q1("select content_type, data from media where id = $1", [id]);
  } catch (err: any) {
    console.error("[media]", err?.message || err);
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!row) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": row.content_type,
    "Content-Length": String(row.data.length),
    // id-ն ամեն վերբեռնման համար նոր է, ուստի ֆայլը երբեք չի փոխվում
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  // SVG-ի ներսում script-ները չաշխատեն, եթե ֆայլը բացեն ուղիղ հասցեով
  if (row.content_type === "image/svg+xml") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  return new Response(new Uint8Array(row.data), { headers });
}
