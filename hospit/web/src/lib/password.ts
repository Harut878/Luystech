// Գաղտնաբառի հեշավորում (միայն սերվերում)։
// Նոր հեշեր՝ scrypt (Node-ի ներկառուցված, առանց native կախվածության).
//   scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>
// Supabase-ից ներմուծված bcrypt հեշերը ($2a$/$2b$/$2y$) նույնպես ընդունվում են
// և առաջին հաջող մուտքի ժամանակ փոխարինվում են scrypt-ով (տես needsRehash)։
// ⚠️ scripts/create-admin.mjs-ը օգտագործում է ճիշտ նույն ձևաչափը։
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

const N = 16384, R = 8, P = 1, KEYLEN = 64;

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (/^\$2[aby]\$/.test(stored)) {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(password, stored);
  }
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  const key = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export function needsRehash(stored: string): boolean {
  return !stored.startsWith(`scrypt$${N}$${R}$${P}$`);
}

export function passwordProblem(pw: string): "pw_short" | "pw_long" | null {
  if (pw.length < 8) return "pw_short";
  if (pw.length > 72) return "pw_long";
  return null;
}
