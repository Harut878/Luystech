"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin, createAdminClient } from "@/lib/supabase/admin";

// Ամեն աղյուսակի ԹՈՒՅԼԱՏՐՎԱԾ սյուները (client-ից գրվող դաշտերի allowlist)։
// Այլ դաշտեր (անգամ եթե client-ը ուղարկի) անտեսվում են։
const COLUMNS: Record<string, string[]> = {
  modules: ["id", "icon", "image_url", "image_url_light", "title", "desc", "long", "video_url", "sort", "active"],
  benefits: ["id", "icon", "title", "desc", "sort", "active"],
  why_stats: ["id", "target", "suffix", "decimals", "label", "sort"],
  industries: ["id", "icon", "name", "desc", "sort", "active"],
  clients: ["id", "name", "logo_url", "logo_mode", "url", "sort", "active"],
  partners: ["id", "name", "logo_url", "logo_mode", "desc", "long", "link", "sort", "active"],
  stories: ["id", "name", "logo_url", "industry", "challenge", "solution", "metrics", "sort", "active"],
  proof: ["id", "target", "suffix", "label", "sort"],
};
const isListTable = (t: string) => Object.prototype.hasOwnProperty.call(COLUMNS, t);

// Նկարների վերբեռման սահմանափակումներ
const ALLOWED_MIME: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const ALLOWED_FOLDERS = ["modules", "clients", "partners", "stories"];

async function guard() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("unauthorized");
  return createAdminClient();
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

// ── Տեքստեր (ամբողջ 3-լեզու ծառը) ──
export async function saveTexts(data: any) {
  const db = await guard();
  const { error } = await db.from("site_texts").upsert({ id: 1, data });
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

// Կարճ Google Maps հղումը (maps.app.goo.gl / goo.gl) «բացում» ենք դեպի իրական հասցեն,
// որ iframe-ում ցուցադրվի (կարճ հղումն ուղիղ չի embed-վում)։
async function resolveMapLink(embed: unknown): Promise<unknown> {
  if (typeof embed !== "string") return embed;
  const m = embed.trim();
  if (!/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl)\//i.test(m)) return embed;
  try {
    const res = await fetch(m, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.url && /google\.[^/]+\/maps/i.test(res.url)) return res.url;
  } catch { /* ignore, պահում ենք ինչ կա */ }
  return embed;
}

// ── Կարգավորումներ ──
export async function saveSettings(data: any) {
  const db = await guard();
  if (data && typeof data === "object") data = { ...data, map_embed: await resolveMapLink(data.map_embed) };
  const { error } = await db.from("app_settings").upsert({ id: 1, data });
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

// ── Ամբողջ բաժնի տեսանելիություն կայքում (ON/OFF) ──
const SECTION_KEYS = ["about", "bc", "benefits", "stats", "industries", "clients", "partners", "stories", "proof", "demo"];
export async function setSection(key: string, on: boolean) {
  if (!SECTION_KEYS.includes(key)) return { ok: false, error: "bad key" };
  const db = await guard();
  const { data } = await db.from("app_settings").select("data").eq("id", 1).maybeSingle();
  const cur = (data?.data as any) || {};
  const sections = { ...(cur.sections || {}), [key]: on };
  const { error } = await db.from("app_settings").upsert({ id: 1, data: { ...cur, sections } });
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

// ── Ցուցակի տողի ավելացում/խմբագրում ──
export async function upsertRow(table: string, row: Record<string, any>) {
  if (!isListTable(table)) return { ok: false, error: "bad table" };
  const id = typeof row?.id === "string" ? row.id.trim() : "";
  if (!id || id.length > 64) return { ok: false, error: "bad id" };
  // Միայն allowlist-ի սյուները ենք վերցնում client-ից
  const clean: Record<string, any> = { id };
  for (const k of COLUMNS[table]) if (k !== "id" && k in row) clean[k] = row[k];
  const db = await guard();
  const { error } = await db.from(table).upsert(clean);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

// ── Ցուցակի տողի ջնջում ──
export async function deleteRow(table: string, id: string) {
  if (!isListTable(table)) return { ok: false, error: "bad table" };
  const db = await guard();
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

// ── Կապի հարցումներ ──
export async function setRequestStatus(id: string, status: "new" | "contacted" | "done") {
  const db = await guard();
  const { error } = await db.from("contact_requests").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteRequest(id: string) {
  const db = await guard();
  const { error } = await db.from("contact_requests").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ── Նկարի վերբեռնում (Storage → assets bucket) ──
export async function uploadImage(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  const db = await guard();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "no file" };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "նկարը շատ մեծ է (առավելագույնը 5MB)" };
  // MIME allowlist — միայն ռաստր նկարներ (SVG-ն արգելված է՝ XSS-ից խուսափելու համար)
  const mime = String(file.type || "").toLowerCase();
  const ext = ALLOWED_MIME[mime];
  if (!ext) return { ok: false, error: "միայն PNG, JPG, WEBP կամ GIF նկարներ են թույլատրված" };
  // folder allowlist
  const folder = String(formData.get("folder") || "");
  if (!ALLOWED_FOLDERS.includes(folder)) return { ok: false, error: "bad folder" };
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = new Uint8Array(await file.arrayBuffer());
  const { error } = await db.storage.from("assets").upload(path, buf, { contentType: mime, upsert: true });
  if (error) return { ok: false, error: error.message };
  const { data } = db.storage.from("assets").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
