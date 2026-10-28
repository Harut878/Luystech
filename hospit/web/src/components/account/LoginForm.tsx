"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { useSiteLang } from "@/components/account/dict";
import SignedInPanel, { type SessionMe } from "@/components/account/SignedInPanel";
import { requestPasswordReset, signIn } from "@/app/auth/actions";
import { homeFor } from "@/lib/account";

const noticeBox: React.CSSProperties = { padding: "11px 13px", borderRadius: 10, background: "rgba(52,211,153,.14)", border: "1px solid rgba(52,211,153,.4)", fontSize: 13.5, marginBottom: 16, color: "#6ee7b7", lineHeight: 1.5 };
const linkBtn: React.CSSProperties = { background: "none", border: "none", fontFamily: "inherit", fontSize: 13.5, cursor: "pointer", padding: 0 };

// me — սերվերից. արդեն մուտք գործա՞ծ է՝ ավտոմատ ՉԵՆՔ տանում, այլ ցույց ենք տալիս ով է և տալիս ենք ընտրություն
export default function LoginForm({ me, disabled }: { me: SessionMe | null; disabled: boolean }) {
  const router = useRouter();
  const { lang, setLang, d } = useSiteLang();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionMe | null>(me);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn(String(fd.get("email") || ""), String(fd.get("password") || "")).catch(() => null);
    if (!res || !res.ok) {
      setError(res ? res.code : "unavailable");
      setLoading(false);
      return;
    }
    // Ուղղորդումը ըստ իրավասության. իրական ստուգումը կատարում է սերվերը ամեն էջում
    router.replace(homeFor(res.role));
    router.refresh();
  }

  async function onForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await requestPasswordReset(String(fd.get("email") || "")).catch(() => null);
    if (res?.emailEnabled) setNotice(d.linkSent);
    else setError("resetUnavailable");
    setLoading(false);
  }

  const errorText = ({
    creds: d.badCreds, locked: d.locked, unavailable: d.unavailable, resetUnavailable: d.resetUnavailable,
  } as Record<string, string>)[error] || (error ? d.errGeneric : "");

  if (session) {
    return (
      <AuthShell lang={lang} setLang={setLang} backLabel={d.backToSite}>
        <SignedInPanel user={session} d={d} onSignedOut={() => { setSession(null); router.refresh(); }} />
      </AuthShell>
    );
  }

  return (
    <AuthShell lang={lang} setLang={setLang} backLabel={d.backToSite}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>{mode === "login" ? d.loginTitle : d.forgotTitle}</h1>
      <p className="adm-sub" style={{ marginBottom: 22 }}>{mode === "login" ? d.loginSub : d.forgotSub}</p>

      {disabled && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(253,205,10,.12)", border: "1px solid rgba(253,205,10,.4)", fontSize: 13, marginBottom: 16, color: "#fde68a" }}>⚠️ {d.notConfigured}</div>
      )}
      {notice && <div style={noticeBox}>✓ {notice}</div>}

      {mode === "login" ? (
        <form onSubmit={onLogin}>
          <div className="adm-field"><label className="adm-label">{d.email}</label><input className="adm-input" name="email" type="email" autoComplete="email" required placeholder="name@clinic.am" /></div>
          <div className="adm-field"><label className="adm-label">{d.password}</label><input className="adm-input" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" /></div>
          {errorText && <div role="alert" style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>{errorText}</div>}
          <button type="submit" disabled={loading || disabled} className="adm-btn adm-btn-primary" style={{ width: "100%" }}>{loading ? "…" : d.loginBtn}</button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" onClick={() => { setMode("forgot"); setError(""); }} style={{ ...linkBtn, color: "var(--a-blue)" }}>{d.forgot}</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--a-border)", fontSize: 13.5, color: "var(--a-dim)" }}>
            {d.noAccount} <a href="/register" style={{ color: "var(--a-blue)", fontWeight: 700, textDecoration: "none" }}>{d.toRegister}</a>
          </div>
        </form>
      ) : (
        <form onSubmit={onForgot}>
          <div className="adm-field"><label className="adm-label">{d.email}</label><input className="adm-input" name="email" type="email" autoComplete="email" required placeholder="name@clinic.am" /></div>
          <button type="submit" disabled={loading || disabled} className="adm-btn adm-btn-primary" style={{ width: "100%" }}>{loading ? "…" : d.sendLink}</button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" onClick={() => { setMode("login"); setError(""); setNotice(""); }} style={{ ...linkBtn, color: "var(--a-dim)" }}>← {d.backToLogin}</button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
