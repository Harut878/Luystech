"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { useSiteLang } from "@/components/account/dict";
import SignedInPanel, { type SessionMe } from "@/components/account/SignedInPanel";
import { registerAccount, type RegisterInput, type RegisterResult } from "@/app/account/actions";

type Field = keyof RegisterInput | "confirm";

export default function RegisterForm({ me, disabled }: { me: SessionMe | null; disabled: boolean }) {
  const router = useRouter();
  const { lang, setLang, d } = useSiteLang();
  const startedAt = useRef(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ field?: Field; text: string } | null>(null);

  const [session, setSession] = useState<SessionMe | null>(me);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) || "");
    if (get("password") !== get("confirm")) {
      setError({ field: "confirm", text: d.pwMismatch });
      return;
    }
    setLoading(true);
    const input: RegisterInput = {
      full_name: get("full_name"), institution: get("institution"), phone: get("phone"),
      email: get("email"), password: get("password"), website: get("website"),
      startedAt: startedAt.current,
    };
    const res = await registerAccount(input).catch((): RegisterResult => ({ ok: false, code: "error" }));
    if (!res.ok) {
      const byField: Partial<Record<Field, string>> = {
        full_name: d.errFull_name, institution: d.errInstitution, phone: d.errPhone, email: d.errEmail,
      };
      const text = res.code === "exists" ? d.errExists
        : res.code === "weak" ? d.errWeak
        : res.code === "invalid" && res.field ? (byField[res.field] || d.errGeneric)
        : d.errGeneric;
      setError({ field: res.field, text });
      setLoading(false);
      return;
    }
    // Հաշիվը ստեղծված է, և սերվերն արդեն բացել է նստաշրջանը
    router.replace("/account");
    router.refresh();
  }

  const bad = (f: Field): React.CSSProperties => (error?.field === f ? { borderColor: "rgba(239,68,68,.7)" } : {});

  if (session) {
    return (
      <AuthShell lang={lang} setLang={setLang} backLabel={d.backToSite}>
        <SignedInPanel user={session} d={d} onSignedOut={() => { setSession(null); startedAt.current = Date.now(); router.refresh(); }} />
      </AuthShell>
    );
  }

  return (
    <AuthShell lang={lang} setLang={setLang} backLabel={d.backToSite} wide>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>{d.regTitle}</h1>
      <p className="adm-sub" style={{ marginBottom: 22 }}>{d.regSub}</p>
      {disabled && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(253,205,10,.12)", border: "1px solid rgba(253,205,10,.4)", fontSize: 13, marginBottom: 16, color: "#fde68a" }}>⚠️ {d.notConfigured}</div>
      )}

      <form onSubmit={onSubmit} noValidate={false}>
        {/* honeypot — տեսանելի չէ մարդկանց */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
          <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
        </div>

        <div className="adm-field"><label className="adm-label">{d.fullName}</label>
          <input className="adm-input" style={bad("full_name")} name="full_name" autoComplete="name" required minLength={2} maxLength={100} /></div>
        <div className="adm-field"><label className="adm-label">{d.institution}</label>
          <input className="adm-input" style={bad("institution")} name="institution" autoComplete="organization" required minLength={2} maxLength={150} /></div>
        <div className="adm-grid adm-cols2" style={{ columnGap: 12, rowGap: 0 }}>
          <div className="adm-field"><label className="adm-label">{d.phone}</label>
            <input className="adm-input" style={bad("phone")} name="phone" type="tel" autoComplete="tel" required placeholder="+374 ..." maxLength={30} /></div>
          <div className="adm-field"><label className="adm-label">{d.email}</label>
            <input className="adm-input" style={bad("email")} name="email" type="email" autoComplete="email" required maxLength={254} /></div>
        </div>
        <div className="adm-grid adm-cols2" style={{ columnGap: 12, rowGap: 0 }}>
          <div className="adm-field"><label className="adm-label">{d.password}</label>
            <input className="adm-input" style={bad("password")} name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} placeholder={d.pwHint} /></div>
          <div className="adm-field"><label className="adm-label">{d.confirmPassword}</label>
            <input className="adm-input" style={bad("confirm")} name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={72} /></div>
        </div>

        {error && <div role="alert" style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12, lineHeight: 1.5 }}>{error.text}</div>}

        <button type="submit" disabled={loading || disabled} className="adm-btn adm-btn-primary" style={{ width: "100%" }}>{loading ? "…" : d.regBtn}</button>
        <p style={{ fontSize: 12, color: "var(--a-faint)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>{d.regAgree}</p>

        <div style={{ textAlign: "center", marginTop: 14, paddingTop: 16, borderTop: "1px solid var(--a-border)", fontSize: 13.5, color: "var(--a-dim)" }}>
          {d.haveAccount} <a href="/login" style={{ color: "var(--a-blue)", fontWeight: 700, textDecoration: "none" }}>{d.toLogin}</a>
        </div>
      </form>
    </AuthShell>
  );
}
