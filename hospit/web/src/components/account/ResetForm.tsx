"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { useSiteLang } from "@/components/account/dict";
import { resetPassword } from "@/app/auth/actions";
import { homeFor } from "@/lib/account";

// token-ը՝ էլ. նամակի հղումից (/reset-password?token=...)
export default function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const { lang, setLang, d } = useSiteLang();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError(d.errWeak); return; }
    setLoading(true); setError("");
    const res = await resetPassword(token, password).catch(() => null);
    if (!res || !res.ok) {
      const code = res?.code;
      setError(code === "link" ? d.linkError : code === "pw_short" ? d.errWeak : code === "pw_long" ? d.errLong : d.errGeneric);
      setLoading(false);
      return;
    }
    router.replace(homeFor(res.role));
    router.refresh();
  }

  return (
    <AuthShell lang={lang} setLang={setLang} backLabel={d.backToSite}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 18px" }}>{d.newPassword}</h1>
      {!token ? (
        <div>
          <div role="alert" style={{ fontSize: 13.5, color: "#fca5a5", marginBottom: 16, lineHeight: 1.5 }}>{d.linkError}</div>
          <a href="/login" className="adm-btn adm-btn-primary" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>{d.backToLogin}</a>
        </div>
      ) : (
      <form onSubmit={onSubmit}>
        <div className="adm-field">
          <label className="adm-label" htmlFor="rp-pw">{d.newPassword}</label>
          <input id="rp-pw" className="adm-input" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder={d.pwHint} />
        </div>
        {error && <div role="alert" style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} className="adm-btn adm-btn-primary" style={{ width: "100%" }}>{loading ? "…" : d.changePw}</button>
      </form>
      )}
    </AuthShell>
  );
}
