import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/content";

// ── Չարաշահման դեմ պաշտպանություն ──
const RATE = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000; // 10 րոպե
const MAX_PER_WINDOW = 5;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (RATE.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) { RATE.set(ip, arr); return true; }
  arr.push(now); RATE.set(ip, arr);
  if (RATE.size > 5000) { for (const [k, v] of RATE) { if (!v.some((t) => now - t < WINDOW_MS)) RATE.delete(k); } }
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cap = (s: unknown, n: number) => String(s ?? "").trim().slice(0, n);

// Կապի ձևից եկած հարցումը՝ պահում է DB-ում (contact_requests) + ոչ պարտադիր email
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "too many requests" }, { status: 429 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  // Honeypot — բոտերը լրացնում են այս թաքնված դաշտը. լուռ ընդունում ենք առանց պահելու
  if (cap(body.website, 1) !== "") return NextResponse.json({ ok: true, stored: false });

  const company = cap(body.company, 200);
  const person = cap(body.person, 200);
  const phone = cap(body.phone, 60);
  const email = cap(body.email, 200);
  const message = cap(body.message, 2000);

  if (!company || !person || !phone || !email) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "bad email" }, { status: 400 });

  // Եթե Supabase-ը դեռ միացված չէ՝ ընդունում ենք առանց պահելու (կայքը չընկնի)
  if (!supabaseConfigured()) return NextResponse.json({ ok: true, stored: false });

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("contact_requests").insert({ company, person, phone, email, message, status: "new" });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  // Ոչ պարտադիր email ծանուցում
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (key && to) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(key);
      await resend.emails.send({
        from: "LuysTech <onboarding@resend.dev>",
        to,
        subject: `Նոր հարցում — ${company}`,
        text: `Ընկերություն: ${company}\nԱնձ: ${person}\nՀեռախոս: ${phone}\nԷլ.փոստ: ${email}\n\n${message}`,
      });
    } catch { /* email ձախողումը չի կասեցնում */ }
  }

  return NextResponse.json({ ok: true, stored: true });
}
