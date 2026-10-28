"use server";

// Մուտք, ելք, գաղտնաբառի փոփոխում և վերականգնում։
import { randomBytes } from "node:crypto";
import { dbConfigured, q, q1 } from "@/lib/db";
import { hashPassword, needsRehash, passwordProblem, verifyPassword } from "@/lib/password";
import { createSession, destroySession, getSessionUser, revokeOtherSessions, sha256 } from "@/lib/auth";
import { mailConfigured, sendMail, siteUrl } from "@/lib/mail";
import { roleOf } from "@/lib/account";
import type { AppRole } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESET_TTL_MIN = 60;

// ── Ուժային փորձերից պաշտպանություն. մեկ էլ. փոստի համար 15 րոպեում առավելագույնը 10 սխալ փորձ ──
const FAIL_WINDOW_MS = 15 * 60_000;
const FAIL_LIMIT = 10;
const failures = new Map<string, { n: number; since: number }>();

function tooManyFailures(key: string): boolean {
  const f = failures.get(key);
  if (!f) return false;
  if (Date.now() - f.since > FAIL_WINDOW_MS) { failures.delete(key); return false; }
  return f.n >= FAIL_LIMIT;
}

function noteFailure(key: string) {
  const f = failures.get(key);
  if (!f || Date.now() - f.since > FAIL_WINDOW_MS) failures.set(key, { n: 1, since: Date.now() });
  else f.n++;
  if (failures.size > 5000) failures.clear(); // հիշողությունը չլցվի
}

export type SignInResult = { ok: true; role: AppRole } | { ok: false; code: "creds" | "locked" | "unavailable" };

export async function signIn(emailRaw: string, password: string): Promise<SignInResult> {
  if (!dbConfigured()) return { ok: false, code: "unavailable" };
  const email = String(emailRaw || "").trim().toLowerCase().slice(0, 254);
  const pw = String(password || "");
  if (!EMAIL_RE.test(email) || !pw || pw.length > 200) return { ok: false, code: "creds" };
  if (tooManyFailures(email)) return { ok: false, code: "locked" };

  let user: { id: string; role: string; password_hash: string } | null;
  try {
    user = await q1("select id, role, password_hash from users where email = $1", [email]);
  } catch (err: any) {
    console.error("[auth] signIn db error:", err?.message || err);
    return { ok: false, code: "unavailable" };
  }
  // Գոյություն չունեցող օգտատիրոջ դեպքում էլ ենք հաշվում հեշ, որ պատասխանի ժամանակը չմատնի
  const ok = user ? await verifyPassword(pw, user.password_hash) : (await hashPassword(pw), false);
  if (!user || !ok) {
    noteFailure(email);
    return { ok: false, code: "creds" };
  }
  failures.delete(email);
  // Supabase-ից ներմուծված bcrypt հեշը թարմացնում ենք scrypt-ի
  if (needsRehash(user.password_hash)) {
    await q("update users set password_hash = $2 where id = $1", [user.id, await hashPassword(pw)]).catch(() => {});
  }
  await createSession(user.id);
  return { ok: true, role: roleOf(user) };
}

export async function signOut(): Promise<{ ok: true }> {
  await destroySession();
  return { ok: true };
}

export type ChangePasswordResult = { ok: true } | { ok: false; code: "auth" | "pw_short" | "pw_long" | "error" };

export async function changeOwnPassword(password: string): Promise<ChangePasswordResult> {
  const me = await getSessionUser();
  if (!me) return { ok: false, code: "auth" };
  const pw = String(password || "");
  const problem = passwordProblem(pw);
  if (problem) return { ok: false, code: problem };
  try {
    await q("update users set password_hash = $2 where id = $1", [me.id, await hashPassword(pw)]);
    await revokeOtherSessions(me.id);
    return { ok: true };
  } catch {
    return { ok: false, code: "error" };
  }
}

// Պատասխանը միշտ նույնն է՝ անկախ օգտատիրոջ գոյությունից (էլ. փոստերը չեն բացահայտվում)
export async function requestPasswordReset(emailRaw: string): Promise<{ ok: true; emailEnabled: boolean }> {
  const base = siteUrl();
  const emailEnabled = mailConfigured() && Boolean(base) && dbConfigured();
  const email = String(emailRaw || "").trim().toLowerCase().slice(0, 254);
  if (!emailEnabled || !EMAIL_RE.test(email)) return { ok: true, emailEnabled };
  try {
    const user = await q1<{ id: string }>("select id from users where email = $1", [email]);
    if (user) {
      const token = randomBytes(32).toString("base64url");
      await q("delete from password_resets where user_id = $1 or expires_at < now()", [user.id]);
      await q("insert into password_resets (token_hash, user_id, expires_at) values ($1, $2, now() + make_interval(mins => $3))",
        [sha256(token), user.id, RESET_TTL_MIN]);
      const link = `${base}/reset-password?token=${token}`;
      await sendMail(email, "HospIT — գաղտնաբառի վերականգնում / Password reset",
        `Գաղտնաբառը փոխելու համար բացեք այս հղումը (${RESET_TTL_MIN} րոպե).\n${link}\n\n` +
        `To set a new password open this link (valid ${RESET_TTL_MIN} minutes):\n${link}\n\n` +
        `Եթե Դուք չեք խնդրել վերականգնում, անտեսեք այս նամակը։ / If you did not request this, ignore this e-mail.`);
    }
  } catch (err: any) {
    console.error("[auth] reset request failed:", err?.message || err);
  }
  return { ok: true, emailEnabled };
}

export type ResetResult = { ok: true; role: AppRole } | { ok: false; code: "link" | "pw_short" | "pw_long" | "error" };

export async function resetPassword(token: string, password: string): Promise<ResetResult> {
  const t = String(token || "");
  if (!t || t.length > 200) return { ok: false, code: "link" };
  const pw = String(password || "");
  const problem = passwordProblem(pw);
  if (problem) return { ok: false, code: problem };
  try {
    const row = await q1<{ user_id: string; role: string }>(
      `update password_resets r set used_at = now()
         from users u
        where r.token_hash = $1 and r.used_at is null and r.expires_at > now() and u.id = r.user_id
       returning r.user_id, u.role`,
      [sha256(t)],
    );
    if (!row) return { ok: false, code: "link" };
    await q("update users set password_hash = $2 where id = $1", [row.user_id, await hashPassword(pw)]);
    await q("delete from sessions where user_id = $1", [row.user_id]);
    await createSession(row.user_id);
    return { ok: true, role: roleOf(row) };
  } catch (err: any) {
    console.error("[auth] reset failed:", err?.message || err);
    return { ok: false, code: "error" };
  }
}
