"use server";

// Օգտատերերի կառավարում ադմինկայից՝ ստեղծել, իրավասություն փոխել,
// բաժանորդագրություն լրացնել, գաղտնաբառ սահմանել, ջնջել։
import { revalidatePath } from "next/cache";
import { json, q, q1 } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { hashPassword, passwordProblem } from "@/lib/password";
import { EMPTY_SUBSCRIPTION, normalizeSubscription, roleOf } from "@/lib/account";
import type { AppRole, Subscription } from "@/lib/types";

// error-ը կոդ է (UI-ը թարգմանում է), կամ բազայի հաղորդագրություն
export type UserActionError = "self_demote" | "last_admin" | "self_delete" | "email_exists" | "bad_email" | "pw_short" | "pw_long" | "not_found";
type Result = { ok: true } | { ok: false; error: UserActionError | string };

export type AccountPatch = {
  role: AppRole;
  full_name: string;
  phone: string;
  institution: string;
  subscription: Subscription;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function done(): Result {
  revalidatePath("/admin", "layout");
  return { ok: true };
}

function fail(err: any): Result {
  console.error("[users]", err?.message || err);
  return { ok: false, error: err?.message || "error" };
}

function clean(v: unknown, max: number) {
  return String(v ?? "").trim().slice(0, max);
}

async function adminCount(): Promise<number> {
  const row = await q1<{ n: number }>("select count(*)::int as n from users where role = 'admin'");
  return row?.n ?? 0;
}

async function currentRole(id: string): Promise<AppRole | null> {
  const row = await q1<{ role: string }>("select role from users where id = $1", [id]);
  return row ? roleOf(row) : null;
}

export async function createAccount(input: { email: string; password: string; role: AppRole; full_name: string; phone: string; institution: string }): Promise<Result> {
  await requireAdmin();
  const email = clean(input.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "bad_email" };
  const password = String(input.password || "");
  const pwErr = passwordProblem(password);
  if (pwErr) return { ok: false, error: pwErr };
  const role: AppRole = input.role === "admin" ? "admin" : "client";

  try {
    const row = await q1<{ id: string }>(
      `insert into users (email, password_hash, role, full_name, phone, institution, subscription)
       values ($1, $2, $3, $4, $5, $6, $7::jsonb)
       on conflict (email) do nothing
       returning id`,
      [email, await hashPassword(password), role, clean(input.full_name, 100),
       clean(input.phone, 30), clean(input.institution, 150), json(EMPTY_SUBSCRIPTION)],
    );
    if (!row) return { ok: false, error: "email_exists" };
  } catch (err) { return fail(err); }
  return done();
}

export async function updateAccount(id: string, patch: AccountPatch): Promise<Result> {
  const me = await requireAdmin();
  const role: AppRole = patch.role === "admin" ? "admin" : "client";

  try {
    const was = await currentRole(id);
    if (!was) return { ok: false, error: "not_found" };

    // Չի կարելի ինքդ քեզնից հանել ադմինի իրավունքը, և չի կարելի թողնել համակարգը առանց ադմինի
    if (was === "admin" && role !== "admin") {
      if (id === me.id) return { ok: false, error: "self_demote" };
      if ((await adminCount()) <= 1) return { ok: false, error: "last_admin" };
    }

    await q(
      `update users set role = $2, full_name = $3, phone = $4, institution = $5, subscription = $6::jsonb
       where id = $1`,
      [id, role, clean(patch.full_name, 100), clean(patch.phone, 30), clean(patch.institution, 150),
       json(normalizeSubscription(patch.subscription))],
    );
  } catch (err) { return fail(err); }
  return done();
}

export async function setAccountPassword(id: string, password: string): Promise<Result> {
  const me = await requireAdmin();
  const pw = String(password || "");
  const pwErr = passwordProblem(pw);
  if (pwErr) return { ok: false, error: pwErr };
  try {
    const row = await q1<{ id: string }>("update users set password_hash = $2 where id = $1 returning id", [id, await hashPassword(pw)]);
    if (!row) return { ok: false, error: "not_found" };
    // Նոր գաղտնաբառից հետո այդ օգտատիրոջ բոլոր բաց նստաշրջանները փակվում են
    // (ադմինն ինքն իր գաղտնաբառը փոխելիս՝ իր ընթացիկ նստաշրջանը չի փակվում)
    if (id !== me.id) await q("delete from sessions where user_id = $1", [id]);
  } catch (err) { return fail(err); }
  return done();
}

export async function deleteAccount(id: string): Promise<Result> {
  const me = await requireAdmin();
  if (id === me.id) return { ok: false, error: "self_delete" };
  try {
    const was = await currentRole(id);
    if (!was) return { ok: false, error: "not_found" };
    if (was === "admin" && (await adminCount()) <= 1) return { ok: false, error: "last_admin" };
    await q("delete from users where id = $1", [id]);
  } catch (err) { return fail(err); }
  return done();
}
