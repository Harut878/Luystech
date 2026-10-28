"use client";

import Link from "next/link";
import { useAdminI18n } from "./i18n";
import type { Bi } from "./bi";
import type { ContactRequest } from "@/lib/types";

type Kpi = { n: number; label: Bi; href: string; highlight?: boolean };

export default function DashboardView({ kpis, recent }: { kpis: Kpi[]; recent: ContactRequest[] }) {
  const { at, lang } = useAdminI18n();
  const locale = lang === "en" ? "en-US" : "hy-AM";
  return (
    <div>
      <h1 className="adm-h1">{at("Բարի գալուստ 👋", "Welcome 👋")}</h1>
      <p className="adm-sub">{at("HospIT-ի կառավարման վահանակ։ Ձախ մենյուից ընտրեք բաժինը՝ բովանդակությունը խմբագրելու համար։", "HospIT admin panel. Pick a section from the left menu to edit content.")}</p>

      <div className="adm-kpis">
        {kpis.map((k, i) => (
          <Link key={i} href={k.href} style={{ textDecoration: "none" }}>
            <div className="adm-kpi" style={{ cursor: "pointer" }}>
              <b style={{ color: k.highlight && k.n > 0 ? "var(--a-blue)" : "var(--a-text)" }}>{k.n}</b>
              <span>{at(k.label)}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="adm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{at("Վերջին հարցումները", "Recent requests")}</h3>
          <Link href="/admin/requests" style={{ color: "var(--a-blue)", textDecoration: "none", fontSize: 13.5, fontWeight: 600 }}>{at("Բոլորը →", "All →")}</Link>
        </div>
        {recent.length === 0 ? (
          <p className="adm-sub" style={{ margin: 0 }}>{at("Դեռ հարցում չկա։", "No requests yet.")}</p>
        ) : recent.map((r) => (
          <div key={r.id} className="adm-item" style={{ marginBottom: 8 }}>
            <div className="adm-item-head">
              <div><div className="adm-item-title">{r.name}{r.subject ? ` — ${r.subject}` : ""}</div><div className="adm-item-meta">{r.email}</div></div>
              <span className="adm-item-meta">{new Date(r.created_at).toLocaleDateString(locale)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
