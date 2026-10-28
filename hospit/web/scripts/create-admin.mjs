// Ադմինի հաշվի ստեղծում (կամ եղածի գաղտնաբառի փոխում + ադմին դարձնել)։
//   npm run db:create-admin -- <email> <password> ["Full Name"]
// կամ միջավայրի փոփոխականներով՝ ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME (Docker-ի համար հարմար)։
// Գաղտնաբառի հեշի ձևաչափը նույնն է, ինչ src/lib/password.ts-ում։
import { randomBytes, scryptSync } from "node:crypto";
import { connect, fail, loadEnv } from "./_env.mjs";

// --if-missing՝ ոչինչ չանել, եթե բազայում արդեն կա գոնե մեկ ադմին (Docker-ի ամեն գործարկման համար)
loadEnv();
const ifMissing = process.argv.includes("--if-missing");
const [, , argEmail, argPassword, argName] = process.argv.filter((a) => a !== "--if-missing");
if (ifMissing && !argEmail && !process.env.ADMIN_EMAIL) process.exit(0);
const email = String(argEmail || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(argPassword || process.env.ADMIN_PASSWORD || "");
const fullName = String(argName || process.env.ADMIN_NAME || "").trim().slice(0, 100);

// Docker-ի գործարկման ժամանակ սխալ արժեքը չպետք է կանգնեցնի կայքը՝ միայն զգուշացում
const bad = (msg) => { if (ifMissing) { console.warn("! create-admin skipped:", msg); process.exit(0); } fail(msg); };
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) bad("usage: npm run db:create-admin -- <email> <password> [\"Full Name\"]");
if (password.length < 8 || password.length > 72) bad("password must be 8–72 characters");

const N = 16384, R = 8, P = 1;
const salt = randomBytes(16);
const key = scryptSync(password, salt, 64, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
const hash = `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;

const db = await connect().catch(fail);
try {
  if (ifMissing) {
    const { rows } = await db.query("select count(*)::int as n from users where role = 'admin'");
    if (rows[0].n > 0) { console.log("✓ admin already exists — ADMIN_EMAIL/ADMIN_PASSWORD ignored"); process.exit(0); }
  }
  const { rows } = await db.query(
    `insert into users (email, password_hash, role, full_name)
     values ($1, $2, 'admin', $3)
     on conflict (email) do update
       set password_hash = excluded.password_hash, role = 'admin',
           full_name = case when excluded.full_name <> '' then excluded.full_name else users.full_name end
     returning (xmax = 0) as created`,
    [email, hash, fullName],
  );
  // գաղտնաբառը փոխվել է՝ եղած նստաշրջանները փակում ենք
  if (!rows[0].created) await db.query("delete from sessions where user_id = (select id from users where email = $1)", [email]);
  console.log(rows[0].created ? `✓ admin created: ${email}` : `✓ ${email} is now an admin (password updated)`);
} catch (err) {
  fail(err);
} finally {
  await db.end();
}
