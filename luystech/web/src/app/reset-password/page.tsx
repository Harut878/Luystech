"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Գաղտնաբառը պետք է լինի առնվազն 6 նիշ։"); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/admin");
    router.refresh();
  }

  return (
    <AuthShell>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 18px" }}>Նոր գաղտնաբառ</h1>
      <form onSubmit={onSubmit}>
        <div className="adm-field"><label className="adm-label">Նոր գաղտնաբառ</label><input className="adm-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
        {error && <div style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} className="adm-btn adm-btn-primary" style={{ width: "100%" }}>{loading ? "…" : "Պահպանել"}</button>
      </form>
    </AuthShell>
  );
}
