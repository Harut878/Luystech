// PostgreSQL կապ (միայն սերվերում)։ Միակ կարգավորումը՝ DATABASE_URL։
import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

// Ամսաթվերը՝ տողերով (ինչպես նախկինում Supabase-ը). timestamptz → ISO, date → "YYYY-MM-DD"։
// date-ը միտումնավոր չի դարձվում Date օբյեկտ՝ ժամային գոտու պատճառով մեկ օր շեղվելուց խուսափելու համար։
// (մոդուլը կարող է բեռնվել մի քանի անգամ, ուստի նախորդ parser-ը կարող է արդեն մերը լինել)
const parseTimestamptz = types.getTypeParser(types.builtins.TIMESTAMPTZ);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (v: string) => {
  const d: unknown = parseTimestamptz(v);
  return d instanceof Date ? d.toISOString() : String(d);
});
types.setTypeParser(types.builtins.DATE, (v: string) => v);

declare global {
  // dev-ում HMR-ի ժամանակ նոր pool չստեղծելու համար
  var __hospitPool: Pool | undefined;
}

export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// DATABASE_SSL: "require" (ստուգված վկայական) | "no-verify" (կառավարվող բազաներ ինքնաստորագրված վկայականով) | դատարկ (connection string-ով)
function sslOption() {
  const mode = (process.env.DATABASE_SSL || "").toLowerCase();
  if (mode === "require") return { rejectUnauthorized: true };
  if (mode === "no-verify") return { rejectUnauthorized: false };
  return undefined;
}

function pool(): Pool {
  if (!globalThis.__hospitPool) {
    if (!dbConfigured()) throw new Error("DATABASE_URL is not set");
    const p = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslOption(),
      max: Number(process.env.DATABASE_POOL_MAX) || 10,
      connectionTimeoutMillis: 5000,  // բազան անհասանելի է՝ արագ սխալ, ոչ թե «կախվել»
      idleTimeoutMillis: 30_000,
      statement_timeout: 15_000,
    });
    // անգործուն կապի սխալը չպետք է գցի սերվերը
    p.on("error", (err) => console.error("[db] idle client error:", err.message));
    globalThis.__hospitPool = p;
  }
  return globalThis.__hospitPool;
}

export async function q<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query<T>(text, params);
  return res.rows;
}

export async function q1<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try {
    await c.query("begin");
    const out = await fn(c);
    await c.query("commit");
    return out;
  } catch (err) {
    await c.query("rollback").catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}

// jsonb պարամետրերը միշտ որպես JSON տող (pg-ն JS զանգվածը կդարձնի Postgres array, ոչ JSON)
export function json(v: unknown): string {
  return JSON.stringify(v ?? null);
}
