"use server";

import { revalidatePath } from "next/cache";
import { json, q, q1 } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Միայն այս աղյուսակների և սյունակների հետ է թույլատրված աշխատել (անվտանգություն).
// Սյունակների անունները SQL-ի մեջ են դրվում, ուստի դրանք երբեք չեն գալիս բրաուզերից։
const TABLE_COLUMNS = {
  features:     { text: ["icon"], json: ["title", "desc"] },
  services:     { text: ["icon"], json: ["title", "desc", "bullets"] },
  partners:     { text: ["name", "logo_url"], json: [] },
  clients:      { text: ["name", "logo_url"], json: [] },
  about_values: { text: ["emoji"], json: ["title", "desc"] },
  timeline:     { text: ["year"], json: ["title", "desc"] },
  advantages:   { text: ["emoji", "stat"], json: ["title", "desc", "stat_label"] },
  comparisons:  { text: [], json: ["feature"] },
} as const satisfies Record<string, { text: readonly string[]; json: readonly string[] }>;
type ListTable = keyof typeof TABLE_COLUMNS;

function isListTable(t: string): t is ListTable {
  return Object.prototype.hasOwnProperty.call(TABLE_COLUMNS, t);
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

// Բոլոր գործողությունների պատասխանը (error-ը՝ միայն ձախողման դեպքում)
export type ActionResult = { ok: boolean; error?: string };

function fail(err: any): ActionResult {
  console.error("[admin]", err?.message || err);
  return { ok: false, error: err?.message || "error" };
}

// ── Տեքստեր (ամբողջ 3-լեզու ծառը) ──
export async function saveTexts(data: any): Promise<ActionResult> {
  await requireAdmin();
  try {
    await q(`insert into site_texts (id, data) values (1, $1::jsonb)
             on conflict (id) do update set data = excluded.data`, [json(data)]);
  } catch (err) { return fail(err); }
  refresh();
  return { ok: true };
}

// ── Կարգավորումներ ──
export async function saveSettings(data: any): Promise<ActionResult> {
  await requireAdmin();
  try {
    await q(`insert into app_settings (id, data) values (1, $1::jsonb)
             on conflict (id) do update set data = excluded.data`, [json(data)]);
  } catch (err) { return fail(err); }
  refresh();
  return { ok: true };
}

// ── Ցուցակի տողի ավելացում/խմբագրում ──
export async function upsertRow(table: string, row: Record<string, any>): Promise<ActionResult> {
  if (!isListTable(table)) return { ok: false, error: "bad table" };
  await requireAdmin();
  const id = String(row?.id ?? "").trim().slice(0, 80);
  if (!id) return { ok: false, error: "missing id" };

  const cfg = TABLE_COLUMNS[table];
  const cols: string[] = ["id", "sort", "active"];
  const vals: string[] = ["$1", "$2", "$3"];
  const params: unknown[] = [id, Math.trunc(Number(row.sort) || 0), row.active !== false];
  for (const c of cfg.text) {
    params.push(row[c] == null ? null : String(row[c]));
    cols.push(`"${c}"`); vals.push(`$${params.length}`);
  }
  for (const c of cfg.json) {
    params.push(json(row[c]));
    cols.push(`"${c}"`); vals.push(`$${params.length}::jsonb`);
  }
  const updates = cols.slice(1).map((c) => `${c} = excluded.${c}`).join(", ");
  try {
    await q(`insert into ${table} (${cols.join(", ")}) values (${vals.join(", ")})
             on conflict (id) do update set ${updates}`, params);
  } catch (err) { return fail(err); }
  refresh();
  return { ok: true };
}

// ── Ցուցակի տողի ջնջում ──
export async function deleteRow(table: string, id: string): Promise<ActionResult> {
  if (!isListTable(table)) return { ok: false, error: "bad table" };
  await requireAdmin();
  try {
    await q(`delete from ${table} where id = $1`, [String(id)]);
  } catch (err) { return fail(err); }
  refresh();
  return { ok: true };
}

// ── Կապի հարցումներ ──
export async function setRequestStatus(id: string, status: "new" | "contacted" | "done"): Promise<ActionResult> {
  await requireAdmin();
  if (!["new", "contacted", "done"].includes(status)) return { ok: false, error: "bad status" };
  try {
    await q("update contact_requests set status = $2 where id = $1", [id, status]);
  } catch (err) { return fail(err); }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteRequest(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await q("delete from contact_requests where id = $1", [id]);
  } catch (err) { return fail(err); }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ── Նկարի վերբեռնում (պահվում է բազայի media աղյուսակում, բացվում է /media/<id>.<ext> հասցեով) ──
const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp",
  "image/gif": "gif", "image/svg+xml": "svg", "image/avif": "avif", "image/x-icon": "ico",
};
const EXT_TYPES: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  gif: "image/gif", svg: "image/svg+xml", avif: "image/avif", ico: "image/x-icon",
};

export async function uploadImage(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "no file" };
  if (file.size > 7 * 1024 * 1024) return { ok: false, error: "նկարը շատ մեծ է (առավելագույնը 7MB)" };
  const nameExt = (file.name.split(".").pop() || "").toLowerCase();
  const type = IMAGE_TYPES[file.type] ? file.type : EXT_TYPES[nameExt];
  if (!type) return { ok: false, error: "միայն նկարներ (PNG, JPG, WEBP, GIF, SVG, AVIF, ICO)" };
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const row = await q1<{ id: string }>(
      "insert into media (filename, content_type, size, data) values ($1, $2, $3, $4) returning id",
      [file.name.slice(0, 200), type, buf.length, buf],
    );
    return { ok: true, url: `/media/${row!.id}.${IMAGE_TYPES[type]}` };
  } catch (err) {
    return fail(err);
  }
}
