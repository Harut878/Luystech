"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { createClient } from "@/lib/supabase/client";

function notConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return !url || url.includes("XXXX");
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled = notConfigured();

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email") || "").trim(),
      password: String(fd.get("password") || ""),
    });
    if (error) {
      setError(/Invalid login/i.test(error.message) ? "Սխալ էլ. փոստ կամ գաղտնաբառ։" : error.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function onForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.resetPasswordForEmail(String(fd.get("email") || "").trim(), {
      redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    });
    setNotice("Եթե այս էլ. փոստով հաշիվ կա, ուղարկեցինք վերականգնման հղում։");
    setLoading(false);
  }

  return (
    <AuthShell>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>
        {mode === "login" ? "Ադմին մուտք" : "Գաղտնաբառի վերականգնում"}
      </h1>
      <p className="adm-sub" style={{ marginBottom: 22 }}>
        {mode === "login" ? "Մուտք գործեք կայքը կառավարելու համար։" : "Մուտքագրեք ձեր էլ. փոստը՝ վերականգնման հղում ստանալու համար։"}
      </p>

      {disabled && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(253,205,10,.12)", border: "1px solid rgba(253,205,10,.4)", fontSize: 13, marginBottom: 16, lineHeight: 1.5, color: "#fde68a" }}>
          ⚠️ Supabase-ը դեռ միացված չէ։ Կարգավորելուց հետո մուտքը կաշխատի։
        </div>
      )}
      {notice && <div style={{ padding: "11px 13px", borderRadius: 10, background: "rgba(52,211,153,.14)", border: "1px solid rgba(52,211,153,.4)", fontSize: 13.5, marginBottom: 16, color: "#6ee7b7" }}>✓ {notice}</div>}

      {mode === "login" ? (
        <form onSubmit={onLogin}>
          <div className="adm-field"><label className="adm-label">Էլ. փոստ</label><input className="adm-input" name="email" type="email" required placeholder="admin@luystech.am" /></div>
          <div className="adm-field"><label className="adm-label">Գաղտնաբառ</label><input className="adm-input" name="password" type="password" required placeholder="••••••••" /></div>
          {error && <div style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading || disabled} className="adm-btn adm-btn-primary" style={{ width: "100%" }}>{loading ? "…" : "Մուտք"}</button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" onClick={() => { setMode("forgot"); setError(""); }} style={{ background: "none", border: "none", color: "var(--a-blue)", fontFamily: "inherit", fontSize: 13.5, cursor: "pointer" }}>Մոռացե՞լ եք գաղտնաբառը</button>
          </div>
        </form>
      ) : (
        <form onSubmit={onForgot}>
          <div className="adm-field"><label className="adm-label">Էլ. փոստ</label><input className="adm-input" name="email" type="email" required placeholder="admin@luystech.am" /></div>
          {error && <div style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading || disabled} className="adm-btn adm-btn-primary" style={{ width: "100%" }}>{loading ? "…" : "Ուղարկել հղումը"}</button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" onClick={() => { setMode("login"); setError(""); setNotice(""); }} style={{ background: "none", border: "none", color: "var(--a-dim)", fontFamily: "inherit", fontSize: 13.5, cursor: "pointer" }}>← Վերադառնալ մուտքին</button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
