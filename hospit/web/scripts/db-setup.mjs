// Բազայի նախապատրաստում՝ աղյուսակներ (db/schema.sql) + սկզբնական բովանդակություն (db/seed.sql)։
// Կարելի է գործարկել քանի անգամ ուզեք. եղած տվյալները չեն ջնջվում և չեն վերագրվում։
//   npm run db:setup              → schema + seed
//   npm run db:setup -- --no-seed → միայն schema
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, connect, fail, loadEnv } from "./_env.mjs";

loadEnv();
const withSeed = !process.argv.includes("--no-seed");

const db = await connect().catch(fail);
try {
  await db.query(readFileSync(join(ROOT, "db", "schema.sql"), "utf8"));
  console.log("✓ schema (db/schema.sql)");
  if (withSeed) {
    await db.query(readFileSync(join(ROOT, "db", "seed.sql"), "utf8"));
    console.log("✓ seed (db/seed.sql) — existing content was kept");
  }
  const { rows } = await db.query("select count(*)::int as n from users where role = 'admin'");
  if (rows[0].n === 0 && !process.env.ADMIN_EMAIL) {
    console.log("\n! No admin account yet. Create one:\n  npm run db:create-admin -- admin@example.com 'StrongPassword123' \"Full Name\"");
  }
} catch (err) {
  fail(err);
} finally {
  await db.end();
}
