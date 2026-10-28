"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { login, me } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Եթե արդեն մուտք է գործած՝ ուղիղ ադմին
  useEffect(() => { me().then((r) => { if (r.ok) router.replace("/admin/"); }); }, [router]);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const r = await login(String(fd.get("email") || "").trim(), String(fd.get("password") || ""));
    if (!r.ok) {
      setError(r.error || "Սխալ էլ. փոստ կամ գաղտնաբառ։");
      setLoading(false);
      return;
    }
    router.replace("/admin/");
  }

  return (
    <AuthShell>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Ադմին մուտք</h1>
      <p className="adm-sub" style={{ marginBottom: 22 }}>Մուտք գործեք կայքը կառավարելու համար։</p>
      <form onSubmit={onLogin}>
        <div className="adm-field"><label className="adm-label">Էլ. փոստ</label><input className="adm-input" name="email" type="email" required autoComplete="username" placeholder="admin@luystech.am" /></div>
        <div className="adm-field"><label className="adm-label">Գաղտնաբառ</label><input className="adm-input" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" /></div>
        {error && <div style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} className="adm-btn adm-btn-primary" style={{ width: "100%" }}>{loading ? "…" : "Մուտք"}</button>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: "var(--a-faint)", lineHeight: 1.5 }}>
          Մոռացե՞լ եք գաղտնաբառը՝ դիմեք կայքի տեխնիկական ադմինիստրատորին։
        </p>
      </form>
    </AuthShell>
  );
}
