// Հաշվի տվյալների ձևափոխում (server և client)։
//
// ԱՆՎՏԱՆԳՈՒԹՅՈՒՆ. իրավասությունը (role) վերցվում է ՄԻԱՅՆ users.role սյունակից,
// որը փոխում է միայն ադմինը (server action-ներով)։ Օգտատերը ինքը չի կարող այն փոխել։
import type { Account, AppRole, Subscription, SubStatus } from "./types";

// users աղյուսակի տողը (password_hash-ը երբեք չի փոխանցվում բրաուզերին)
export type UserRow = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  institution: string | null;
  subscription: unknown;
  created_at: Date | string | null;
  last_sign_in_at: Date | string | null;
};

const STATUSES: SubStatus[] = ["pending", "active", "suspended", "expired"];

export const EMPTY_SUBSCRIPTION: Subscription = {
  status: "pending", plan: "", employees: 0, addons: [], monthly_price: 0,
  start_date: "", end_date: "", payment_terms: "", terms: "",
};

export function roleOf(user: { role?: string | null } | null | undefined): AppRole {
  return user?.role === "admin" ? "admin" : "client";
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function iso(v: Date | string | null | undefined): string {
  if (!v) return "";
  return v instanceof Date ? v.toISOString() : String(v);
}

export function normalizeSubscription(raw: any): Subscription {
  const r = raw && typeof raw === "object" ? raw : {};
  // փաթեթի id. միայն անվտանգ նիշեր
  const plan = typeof r.plan === "string" && /^[a-z0-9_-]{1,40}$/.test(r.plan) ? r.plan : "";
  return {
    status: STATUSES.includes(r.status) ? r.status : "pending",
    plan,
    employees: Math.floor(num(r.employees)),
    addons: Array.isArray(r.addons) ? r.addons.filter((x: unknown) => typeof x === "string") : [],
    monthly_price: Math.floor(num(r.monthly_price)),
    start_date: str(r.start_date).slice(0, 10),
    end_date: str(r.end_date).slice(0, 10),
    payment_terms: str(r.payment_terms),
    terms: str(r.terms),
  };
}

export function toAccount(row: UserRow): Account {
  return {
    id: row.id,
    email: row.email || "",
    role: roleOf(row),
    full_name: str(row.full_name),
    phone: str(row.phone),
    institution: str(row.institution),
    subscription: normalizeSubscription(row.subscription),
    created_at: iso(row.created_at),
    last_sign_in_at: iso(row.last_sign_in_at) || null,
  };
}

// Միայն ներքին ուղիներ (/account, /admin...). արտաքին հղումներ չենք թույլատրում։
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

export function homeFor(role: AppRole): string {
  return role === "admin" ? "/admin" : "/account";
}
