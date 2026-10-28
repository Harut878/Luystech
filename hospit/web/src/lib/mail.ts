// Նամակներ Resend-ով (ոչ պարտադիր)։ Առանց RESEND_API_KEY-ի ոչինչ չի ուղարկվում, կայքը շարունակում է աշխատել։
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return false;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: process.env.MAIL_FROM || "HospIT <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
    if (error) {
      console.error("[mail] send failed:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("[mail] send failed:", err?.message || err);
    return false;
  }
}

// Կայքի հասցեն նամակների հղումների համար։ Միտումնավոր չի վերցվում Host header-ից
// (կեղծ Host-ով հարձակվողը կարող էր ստանալ գաղտնաբառի վերականգնման հղումը)։
export function siteUrl(): string | null {
  const u = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");
  return /^https?:\/\/[^/]+$/i.test(u) ? u : null;
}
