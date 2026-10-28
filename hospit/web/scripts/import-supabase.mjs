// Տվյալների տեղափոխում հին Supabase նախագծից նոր PostgreSQL բազա (մեկ անգամ)։
//
//   SOURCE_DATABASE_URL="postgresql://postgres.<ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres" \
//   npm run db:import-supabase
//
// SOURCE_DATABASE_URL — Supabase Dashboard → Connect → Session pooler (կամ Direct connection)։
// Նախ գործարկեք `npm run db:setup` նոր բազայի վրա (DATABASE_URL)։
//
// Ի՞նչ է տեղափոխվում
//   • բովանդակությունը (տեքստեր, կարգավորումներ, բոլոր ցուցակները) — փոխարինում է նոր բազայի սկզբնականին
//   • օգտատերերը auth.users-ից՝ իրենց ՆՈՒՅՆ գաղտնաբառերով (bcrypt հեշ), իրավասությամբ և բաժանորդագրությամբ
//   • կապի հարցումները և վիկտորինայի արդյունքները
//   • Supabase Storage-ում պահված նկարները՝ ներբեռնվում են media աղյուսակ, հղումները փոխվում են /media/... -ի
//
// Կրկին գործարկելը անվտանգ է. օգտատերերը թարմացվում են ըստ էլ. փոստի, հարցումները չեն կրկնապատկվում։
// Ընտրանքներ.  --dry-run  (միայն ցույց տալ, ինչ կտեղափոխվի)
import { connect, fail, loadEnv } from "./_env.mjs";

loadEnv();
const DRY = process.argv.includes("--dry-run");
if (!process.env.SOURCE_DATABASE_URL) fail("SOURCE_DATABASE_URL is not set (the old Supabase database connection string).");

const LISTS = {
  features:     ["id", "icon", "title", "desc", "sort", "active"],
  services:     ["id", "icon", "title", "desc", "bullets", "sort", "active"],
  partners:     ["id", "name", "logo_url", "sort", "active"],
  clients:      ["id", "name", "logo_url", "sort", "active"],
  about_values: ["id", "emoji", "title", "desc", "sort", "active"],
  timeline:     ["id", "year", "title", "desc", "sort", "active"],
  advantages:   ["id", "emoji", "title", "desc", "stat", "stat_label", "sort", "active"],
  comparisons:  ["id", "feature", "sort", "active"],
};
const JSON_COLS = new Set(["title", "desc", "bullets", "stat_label", "feature", "data", "answers"]);
const STORAGE_URL_RE = /https?:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s"'<>)\\]+/gi;
const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg", "image/avif": "avif", "image/x-icon": "ico" };
const BY_EXT = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", avif: "image/avif", ico: "image/x-icon" };

const src = await connect(process.env.SOURCE_DATABASE_URL, process.env.SOURCE_DATABASE_SSL || "no-verify").catch(fail);
const dst = await connect().catch(fail);

async function exists(table) {
  const { rows } = await src.query("select to_regclass($1) is not null as ok", [table]);
  return rows[0].ok;
}
async function read(table, cols, order = "id") {
  if (!(await exists(`public.${table}`))) { console.log(`  – ${table}: not found in source, skipped`); return []; }
  const { rows } = await src.query(`select ${cols.map((c) => `"${c}"`).join(", ")} from public.${table} order by ${order}`);
  return rows;
}

try {
  // ── 1. Կարդում ենք աղբյուրից ──
  console.log("Reading the Supabase database…");
  const texts = (await read("site_texts", ["id", "data"]))[0]?.data ?? null;
  const settings = (await read("app_settings", ["id", "data"]))[0]?.data ?? null;
  const lists = {};
  for (const [t, cols] of Object.entries(LISTS)) lists[t] = await read(t, cols);
  const requests = await read("contact_requests", ["id", "name", "email", "subject", "message", "status", "created_at"]);
  const quiz = await read("quiz_players", ["id", "name", "phone", "org", "score", "total_ms", "answers", "day", "winner", "created_at"]);
  const { rows: users } = await src.query(
    `select id, lower(email) as email, coalesce(encrypted_password, '') as password_hash,
            coalesce(raw_app_meta_data, '{}'::jsonb) as app, coalesce(raw_user_meta_data, '{}'::jsonb) as meta,
            created_at, last_sign_in_at
       from auth.users where email is not null and deleted_at is null order by created_at`);

  // ── 2. Նկարներ Supabase Storage-ից ──
  const blob = JSON.stringify({ texts, settings, lists });
  const urls = [...new Set(blob.match(STORAGE_URL_RE) || [])];
  const urlMap = new Map();
  console.log(`Found ${urls.length} image(s) in Supabase Storage`);
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const ext0 = url.split("?")[0].split(".").pop().toLowerCase();
      const type = EXT[(res.headers.get("content-type") || "").split(";")[0]] ? res.headers.get("content-type").split(";")[0] : BY_EXT[ext0];
      if (!type) throw new Error("not an image");
      if (DRY) { urlMap.set(url, `/media/<new>.${EXT[type]}`); continue; }
      const { rows } = await dst.query(
        "insert into media (filename, content_type, size, data) values ($1, $2, $3, $4) returning id",
        [decodeURIComponent(url.split("/").pop().split("?")[0]).slice(0, 200), type, buf.length, buf]);
      urlMap.set(url, `/media/${rows[0].id}.${EXT[type]}`);
      console.log(`  ✓ ${url.split("/").pop()}`);
    } catch (err) {
      console.warn(`  ! could not download ${url} (${err.message}) — the old link is kept`);
    }
  }
  const relink = (v) => {
    if (v == null || urlMap.size === 0) return v;
    let s = JSON.stringify(v);
    for (const [from, to] of urlMap) s = s.split(from).join(to);
    return JSON.parse(s);
  };

  console.log(`\nTo import: texts=${texts ? "yes" : "no"}, settings=${settings ? "yes" : "no"}, ` +
    Object.entries(lists).map(([t, r]) => `${t}=${r.length}`).join(", ") +
    `, users=${users.length}, requests=${requests.length}, quiz=${quiz.length}`);
  if (DRY) { console.log("\n--dry-run: nothing was written."); process.exit(0); }

  // ── 3. Գրում ենք նոր բազա (մեկ տրանզակցիայով) ──
  await dst.query("begin");
  if (texts) await dst.query("insert into site_texts (id, data) values (1, $1::jsonb) on conflict (id) do update set data = excluded.data", [JSON.stringify(relink(texts))]);
  if (settings) await dst.query("insert into app_settings (id, data) values (1, $1::jsonb) on conflict (id) do update set data = excluded.data", [JSON.stringify(relink(settings))]);

  for (const [t, cols] of Object.entries(LISTS)) {
    const rows = lists[t];
    if (!rows.length) continue; // աղբյուրում դատարկ է՝ թողնում ենք նոր բազայի սկզբնականը
    await dst.query(`delete from ${t}`);
    for (const r of rows) {
      const row = relink(r);
      const vals = cols.map((c) => (JSON_COLS.has(c) ? JSON.stringify(row[c] ?? null) : row[c]));
      await dst.query(
        `insert into ${t} (${cols.map((c) => `"${c}"`).join(", ")}) values (${cols.map((c, i) => `$${i + 1}${JSON_COLS.has(c) ? "::jsonb" : ""}`).join(", ")})`,
        vals);
    }
  }

  let adminCount = 0;
  for (const u of users) {
    const role = u.app?.role === "admin" ? "admin" : "client";
    if (role === "admin") adminCount++;
    // գաղտնաբառ չունեցող հաշիվ (օր.՝ հրավեր)՝ մուտքը անհնար է, մինչև ադմինը գաղտնաբառ սահմանի
    const hash = /^\$2[aby]\$/.test(u.password_hash) ? u.password_hash : "!";
    await dst.query(
      `insert into users (id, email, password_hash, role, full_name, phone, institution, subscription, created_at, last_sign_in_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
       on conflict (email) do update set password_hash = excluded.password_hash, role = excluded.role,
         full_name = excluded.full_name, phone = excluded.phone, institution = excluded.institution,
         subscription = excluded.subscription`,
      [u.id, u.email, hash, role,
       String(u.app?.full_name || u.meta?.full_name || "").slice(0, 100),
       String(u.app?.phone || "").slice(0, 30), String(u.app?.institution || "").slice(0, 150),
       JSON.stringify(u.app?.subscription && typeof u.app.subscription === "object" ? u.app.subscription : {}),
       u.created_at, u.last_sign_in_at]);
  }

  for (const r of requests) {
    await dst.query(
      `insert into contact_requests (id, name, email, subject, message, status, created_at)
       values ($1, $2, $3, $4, $5, $6, $7) on conflict (id) do nothing`,
      [r.id, r.name, r.email, r.subject, r.message, ["new", "contacted", "done"].includes(r.status) ? r.status : "new", r.created_at]);
  }
  for (const r of quiz) {
    await dst.query(
      `insert into quiz_players (id, name, phone, org, score, total_ms, answers, day, winner, created_at)
       values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10) on conflict do nothing`,
      [r.id, r.name, r.phone, r.org, r.score, r.total_ms, JSON.stringify(r.answers ?? []), r.day, r.winner, r.created_at]);
  }
  await dst.query("commit");

  console.log(`\n✓ Import finished: ${users.length} user(s) (${adminCount} admin), ${requests.length} request(s), ${quiz.length} quiz result(s), ${urlMap.size} image(s).`);
  console.log("  Users sign in with their existing Supabase passwords.");
} catch (err) {
  await dst.query("rollback").catch(() => {});
  fail(err);
} finally {
  await src.end().catch(() => {});
  await dst.end().catch(() => {});
}
