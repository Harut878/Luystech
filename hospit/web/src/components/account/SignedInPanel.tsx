"use client";

// Երբ բրաուզերում արդեն կա ակտիվ նստաշրջան՝ ավտոմատ չենք տանում ներս,
// այլ ցույց ենք տալիս ով է մուտք գործած և տալիս ենք ընտրություն։
import { useState } from "react";
import { signOut } from "@/app/auth/actions";
import { homeFor } from "@/lib/account";
import type { AppRole } from "@/lib/types";
import type { AccountDict } from "./dict";

// Սերվերից փոխանցվող նվազագույն տվյալներ
export type SessionMe = { email: string; full_name: string; role: AppRole };

export default function SignedInPanel({ user, d, onSignedOut }: { user: SessionMe; d: AccountDict; onSignedOut: () => void }) {
  const [busy, setBusy] = useState(false);
  const role = user.role;
  const name = user.full_name;

  async function switchAccount() {
    setBusy(true);
    // միայն այս բրաուզերից (այլ սարքերում մուտքը չի փակվում)
    await signOut().catch(() => {});
    setBusy(false);
    onSignedOut();
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 18px" }}>{d.signedInTitle}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: "var(--a-bg2)", border: "1px solid var(--a-border)", marginBottom: 18 }}>
        <span style={{
          width: 42, height: 42, flex: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 15, color: "#fff",
          background: role === "admin" ? "linear-gradient(135deg, var(--a-blue2), #0891b2)" : "rgba(148,163,184,.25)",
        }}>{(name || user.email || "?").trim().charAt(0).toUpperCase()}</span>
        <span style={{ minWidth: 0, display: "grid", gap: 2 }}>
          <span style={{ fontSize: 12, color: "var(--a-faint)" }}>{d.signedInAs} · {role === "admin" ? d.roleAdmin : d.roleClient}</span>
          {name && <span style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>}
          <span style={{ fontSize: 13.5, color: "var(--a-dim)", overflowWrap: "anywhere" }}>{user.email}</span>
        </span>
      </div>
      <a href={homeFor(role)} className="adm-btn adm-btn-primary" style={{ width: "100%", justifyContent: "center", textDecoration: "none", marginBottom: 10 }}>
        {d.continueBtn} → {role === "admin" ? d.adminPanel : d.myPage}
      </a>
      <button type="button" className="adm-btn adm-btn-ghost" style={{ width: "100%" }} disabled={busy} onClick={switchAccount}>
        {busy ? "…" : d.switchAccount}
      </button>
    </div>
  );
}
