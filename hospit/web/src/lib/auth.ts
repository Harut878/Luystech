// Նստաշրջաններ (միայն սերվերում)։
// Մուտքից հետո բրաուզերը ստանում է պատահական token httpOnly cookie-ում։ Բազայում պահվում է
// միայն դրա SHA-256 հեշը, ուստի բազայի արտահոսքի դեպքում էլ token-ները չեն բացահայտվում։
// Իրավասությունը կարդացվում է ամեն հարցման ժամանակ users.role-ից. փոփոխությունը գործում է անմիջապես։
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { dbConfigured, q, q1 } from "./db";
import { toAccount, type UserRow } from "./account";
import type { Account } from "./types";

export const SESSION_COOKIE = "hospit_session";
// JS-ի համար տեսանելի «ակնարկ» (առանց որևէ տվյալի)՝ միայն UI-ի համար. իրավունք չի տալիս
export const SIGNED_IN_HINT = "hospit_signed_in";
const SESSION_DAYS = 30;

export const USER_COLUMNS = "u.id, u.email, u.role, u.full_name, u.phone, u.institution, u.subscription, u.created_at, u.last_sign_in_at";

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

// HTTPS-ով աշխատելիս cookie-ն պետք է լինի Secure։ Պարզ HTTP-ով փորձարկելու համար՝ COOKIE_SECURE=false
function cookieSecure(): boolean {
  if (process.env.COOKIE_SECURE) return process.env.COOKIE_SECURE === "true";
  return process.env.NODE_ENV === "production";
}

// Ընթացիկ օգտատերը (մեկ հարցման ընթացքում՝ մեկ անգամ)
export const getSessionUser = cache(async (): Promise<Account | null> => {
  if (!dbConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 200) return null;
  try {
    const row = await q1<UserRow>(
      `select ${USER_COLUMNS} from sessions s join users u on u.id = s.user_id
       where s.id = $1 and s.expires_at > now()`,
      [sha256(token)],
    );
    return row ? toAccount(row) : null;
  } catch (err: any) {
    console.error("[auth] session lookup failed:", err?.message || err);
    return null;
  }
});

export async function getCurrentAdmin(): Promise<Account | null> {
  const user = await getSessionUser();
  return user && user.role === "admin" ? user : null;
}

// Server action-ների համար
export async function requireAdmin(): Promise<Account> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("unauthorized");
  return admin;
}

// Ադմին էջերի համար
export async function requireAdminPage(): Promise<Account> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect((await getSessionUser()) ? "/account" : "/login");
  return admin;
}

// Կանչվում է միայն server action-ներից կամ route handler-ներից (cookie գրելու համար)
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await q("insert into sessions (id, user_id, expires_at) values ($1, $2, $3)", [sha256(token), userId, expires]);
  await q("update users set last_sign_in_at = now() where id = $1", [userId]);
  // ժամկետանց նստաշրջանների մաքրում
  await q("delete from sessions where expires_at < now()").catch(() => {});
  const jar = await cookies();
  const base = { path: "/", sameSite: "lax" as const, secure: cookieSecure(), expires };
  jar.set(SESSION_COOKIE, token, { ...base, httpOnly: true });
  jar.set(SIGNED_IN_HINT, "1", { ...base, httpOnly: false });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && dbConfigured()) await q("delete from sessions where id = $1", [sha256(token)]).catch(() => {});
  jar.delete(SESSION_COOKIE);
  jar.delete(SIGNED_IN_HINT);
}

// Գաղտնաբառը փոխելուց հետո՝ օգտատիրոջ մյուս բոլոր նստաշրջանները փակվում են
export async function revokeOtherSessions(userId: string): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await q("delete from sessions where user_id = $1 and id <> $2", [userId, token ? sha256(token) : ""]);
}
