"use server";

import { dbConfigured, json, q1 } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { EMPTY_SUBSCRIPTION } from "@/lib/account";

export type RegisterInput = {
  full_name: string;
  institution: string;
  phone: string;
  email: string;
  password: string;
  website: string;    // honeypot. իրական մարդը չի տեսնում և չի լրացնում
  startedAt: number;  // ձևը բացելու պահը. ռոբոտները լրացնում են ակնթարթորեն
};

export type RegisterError = "invalid" | "exists" | "weak" | "error";
export type RegisterResult = { ok: true } | { ok: false; code: RegisterError; field?: keyof RegisterInput };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[0-9+()\-\s]{5,30}$/;

// Գրանցում։ Իրավասությունը միշտ «client» է (դրվում է սերվերում), օգտատերը չի կարող ինքն իրեն ադմին նշանակել։
// Հաջող գրանցումից հետո օգտատերը անմիջապես մուտք է գործում։
export async function registerAccount(input: RegisterInput): Promise<RegisterResult> {
  const full_name = String(input.full_name || "").trim();
  const institution = String(input.institution || "").trim();
  const phone = String(input.phone || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");

  // Ռոբոտների պարզ զտիչ. հաջողություն ենք ձևացնում, որ չհուշենք
  if (input.website) return { ok: true };
  if (!input.startedAt || Date.now() - Number(input.startedAt) < 2500) return { ok: false, code: "error" };

  if (full_name.length < 2 || full_name.length > 100) return { ok: false, code: "invalid", field: "full_name" };
  if (institution.length < 2 || institution.length > 150) return { ok: false, code: "invalid", field: "institution" };
  if (!PHONE_RE.test(phone)) return { ok: false, code: "invalid", field: "phone" };
  if (email.length > 254 || !EMAIL_RE.test(email)) return { ok: false, code: "invalid", field: "email" };
  if (password.length < 8 || password.length > 72) return { ok: false, code: "weak", field: "password" };

  if (!dbConfigured()) return { ok: false, code: "error" };
  try {
    const row = await q1<{ id: string }>(
      `insert into users (email, password_hash, role, full_name, phone, institution, subscription)
       values ($1, $2, 'client', $3, $4, $5, $6::jsonb)
       on conflict (email) do nothing
       returning id`,
      [email, await hashPassword(password), full_name, phone, institution, json(EMPTY_SUBSCRIPTION)],
    );
    if (!row) return { ok: false, code: "exists", field: "email" };
    await createSession(row.id);
  } catch (err: any) {
    console.error("registerAccount:", err?.message || err);
    return { ok: false, code: "error" };
  }
  return { ok: true };
}
