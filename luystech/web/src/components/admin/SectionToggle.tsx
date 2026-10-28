"use client";

import { useState } from "react";
import { setSection } from "@/app/admin/actions";
import { useToast } from "./fields";

// Ամբողջ բաժինը կայքում ցուցադրելու/թաքցնելու մեծ անջատիչ
export default function SectionToggle({ sectionKey, label, initial }: { sectionKey: string; label: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  async function flip() {
    const next = !on;
    setOn(next); setBusy(true);
    const r = await setSection(sectionKey, next);
    setBusy(false);
    if (!r.ok) { setOn(on); show("Սխալ: " + (r.error || "")); return; }
    show(next ? `«${label}» բաժինը միացված է ✓` : `«${label}» բաժինը թաքնված է կայքից`);
  }

  return (
    <div className="adm-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", border: on ? "1px solid var(--a-border)" : "1px solid rgba(239,68,68,.45)", background: on ? "var(--a-card)" : "rgba(239,68,68,.06)" }}>
      {node}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Ցուցադրել ամբողջ «{label}» բաժինը կայքում</div>
        <div className="adm-sub" style={{ margin: "4px 0 0" }}>{on ? "Այս բաժինը ներկայումս երևում է կայքում։" : "⚠️ Ամբողջ բաժինը թաքնված է — այցելուները չեն տեսնում։"}</div>
      </div>
      <button onClick={flip} disabled={busy} title={on ? "Սեղմեք՝ ամբողջ բաժինը թաքցնելու" : "Սեղմեք՝ ամբողջ բաժինը ցուցադրելու"}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", flex: "none" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: on ? "var(--a-green)" : "var(--a-red)" }}>{on ? "Միացված" : "Անջատված"}</span>
        <span style={{ width: 52, height: 30, borderRadius: 999, background: on ? "var(--a-green)" : "var(--a-border2)", position: "relative", transition: ".2s" }}>
          <span style={{ position: "absolute", top: 3, left: on ? 25 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", transition: ".2s" }} />
        </span>
      </button>
    </div>
  );
}
