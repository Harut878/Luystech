// Սկրիպտների ընդհանուր օգնականներ՝ .env.local/.env կարդալ և PostgreSQL-ին միանալ։
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

// date սյունակները՝ տողով ("YYYY-MM-DD"), որ ժամային գոտին մեկ օր չշեղի
pg.types.setTypeParser(1082, (v) => v);

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Միջավայրի փոփոխականները (process.env-ն առաջնահերթ է, հետո .env.local, հետո .env)
export function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = join(ROOT, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m || process.env[m[1]] !== undefined) continue;
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

function sslFor(mode) {
  const m = (mode || "").toLowerCase();
  if (m === "require") return { rejectUnauthorized: true };
  if (m === "no-verify") return { rejectUnauthorized: false };
  return undefined;
}

export async function connect(url = process.env.DATABASE_URL, sslMode = process.env.DATABASE_SSL) {
  if (!url) {
    console.error("✗ DATABASE_URL is not set (put it in .env.local or the environment).");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: url, ssl: sslFor(sslMode) });
  await client.connect();
  return client;
}

export function fail(err) {
  console.error("✗", err?.message || err);
  process.exit(1);
}
