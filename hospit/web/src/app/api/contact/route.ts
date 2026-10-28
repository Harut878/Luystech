import { NextResponse } from "next/server";
import { dbConfigured, q } from "@/lib/db";
import { sendMail } from "@/lib/mail";

// Կապի ձևից եկած հարցումը՝ պահում է DB-ում (contact_requests) + ոչ պարտադիր email
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const name = String(body.name || "").trim().slice(0, 200);
  const email = String(body.email || "").trim().slice(0, 254);
  const subject = String(body.subject || "").trim().slice(0, 300);
  const message = String(body.message || "").trim().slice(0, 10_000);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  // Բազան միացված չէ՝ ընդունում ենք առանց պահելու (կայքը չընկնի)
  if (!dbConfigured()) {
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    await q("insert into contact_requests (name, email, subject, message, status) values ($1, $2, $3, $4, 'new')",
      [name, email, subject, message]);
  } catch (err: any) {
    console.error("[contact] save failed:", err?.message || err);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  // Ոչ պարտադիր email ծանուցում (ձախողումը չի կասեցնում)
  const to = process.env.CONTACT_TO_EMAIL;
  if (to) await sendMail(to, `Նոր հարցում — ${subject || name}`, `Անուն: ${name}\nԷլ.փոստ: ${email}\nԹեմա: ${subject}\n\n${message}`);

  return NextResponse.json({ ok: true, stored: true });
}
