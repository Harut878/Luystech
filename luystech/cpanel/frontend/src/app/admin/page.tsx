"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboard } from "@/lib/api";
import type { ContactRequest } from "@/lib/types";

type Dash = { counts: { modules: number; industries: number; partners: number; requests: number; newRequests: number }; recent: ContactRequest[] };

export default function Dashboard() {
  const [d, setD] = useState<Dash | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getDashboard().then((r) => { if (r.ok) setD(r as unknown as Dash); else setErr(r.error || "Սխալ"); });
  }, []);

  const c = d?.counts;
  const kpis = [
    { n: c?.newRequests ?? 0, label: "Նոր հարցում", href: "/admin/requests/" },
    { n: c?.requests ?? 0, label: "Ընդամենը հարցում", href: "/admin/requests/" },
    { n: c?.modules ?? 0, label: "BC մոդուլ", href: "/admin/modules/" },
    { n: c?.industries ?? 0, label: "Ոլորտ", href: "/admin/industries/" },
    { n: c?.partners ?? 0, label: "Գործընկեր", href: "/admin/partners/" },
  ];
  const rows = d?.recent || [];

  return (
    <div>
      <h1 className="adm-h1">Բարի գալուստ 👋</h1>
      <p className="adm-sub">LuysTech-ի կառավարման վահանակ։ Ձախ մենյուից ընտրեք բաժինը՝ բովանդակությունը խմբագրելու համար։</p>
      {err && <p className="adm-sub" style={{ color: "#fca5a5" }}>{err}</p>}

      <div className="adm-kpis">
        {kpis.map((k, i) => (
          <Link key={i} href={k.href} style={{ textDecoration: "none" }}>
            <div className="adm-kpi" style={{ cursor: "pointer" }}>
              <b style={{ color: k.label.includes("Նոր") && k.n > 0 ? "var(--a-blue)" : "var(--a-text)" }}>{d ? k.n : "…"}</b>
              <span>{k.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="adm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Վերջին հարցումները</h3>
          <Link href="/admin/requests/" style={{ color: "var(--a-blue)", textDecoration: "none", fontSize: 13.5, fontWeight: 600 }}>Բոլորը →</Link>
        </div>
        {!d ? (
          <p className="adm-sub" style={{ margin: 0 }}>Բեռնվում է…</p>
        ) : rows.length === 0 ? (
          <p className="adm-sub" style={{ margin: 0 }}>Դեռ հարցում չկա։</p>
        ) : rows.map((r) => (
          <div key={r.id} className="adm-item" style={{ marginBottom: 8 }}>
            <div className="adm-item-head">
              <div><div className="adm-item-title">{r.company} — {r.person}</div><div className="adm-item-meta">{r.phone} · {r.email}</div></div>
              <span className="adm-item-meta">{new Date(r.created_at).toLocaleDateString("hy-AM")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
