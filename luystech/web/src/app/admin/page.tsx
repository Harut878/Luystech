import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import type { ContactRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

async function count(db: any, table: string) {
  const { count } = await db.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function Dashboard() {
  const db = await adminDb();
  const [modules, industries, partners, reqTotal] = await Promise.all([
    count(db, "modules"), count(db, "industries"), count(db, "partners"), count(db, "contact_requests"),
  ]);
  const { count: newReq } = await db.from("contact_requests").select("*", { count: "exact", head: true }).eq("status", "new");
  const { data: recent } = await db.from("contact_requests").select("*").order("created_at", { ascending: false }).limit(5);
  const rows = (recent || []) as ContactRequest[];

  const kpis = [
    { n: newReq ?? 0, label: "Նոր հարցում", href: "/admin/requests" },
    { n: reqTotal, label: "Ընդամենը հարցում", href: "/admin/requests" },
    { n: modules, label: "BC մոդուլ", href: "/admin/modules" },
    { n: industries, label: "Ոլորտ", href: "/admin/industries" },
    { n: partners, label: "Գործընկեր", href: "/admin/partners" },
  ];

  return (
    <div>
      <h1 className="adm-h1">Բարի գալուստ 👋</h1>
      <p className="adm-sub">LuysTech-ի կառավարման վահանակ։ Ձախ մենյուից ընտրեք բաժինը՝ բովանդակությունը խմբագրելու համար։</p>

      <div className="adm-kpis">
        {kpis.map((k, i) => (
          <Link key={i} href={k.href} style={{ textDecoration: "none" }}>
            <div className="adm-kpi" style={{ cursor: "pointer" }}>
              <b style={{ color: k.label.includes("Նոր") && k.n > 0 ? "var(--a-blue)" : "var(--a-text)" }}>{k.n}</b>
              <span>{k.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="adm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Վերջին հարցումները</h3>
          <Link href="/admin/requests" style={{ color: "var(--a-blue)", textDecoration: "none", fontSize: 13.5, fontWeight: 600 }}>Բոլորը →</Link>
        </div>
        {rows.length === 0 ? (
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
