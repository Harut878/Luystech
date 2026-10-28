"use client";

import { useState } from "react";
import { setRequestStatus, deleteRequest } from "@/app/admin/actions";
import { useToast } from "./fields";
import type { ContactRequest } from "@/lib/types";

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Նոր", cls: "adm-badge-new" },
  contacted: { label: "Կապ հաստատված", cls: "adm-badge-on" },
  done: { label: "Ավարտված", cls: "adm-badge-off" },
};

type Filter = "all" | "new" | "contacted" | "done";
const FILTERS: [Filter, string][] = [["all", "Բոլորը"], ["new", "Նոր"], ["contacted", "Կապ հաստատված"], ["done", "Ավարտված"]];

export default function RequestsView({ rows }: { rows: ContactRequest[] }) {
  const [list, setList] = useState<ContactRequest[]>(rows);
  const [filter, setFilter] = useState<Filter>("all");
  const { show, node } = useToast();
  const count = (f: Filter) => (f === "all" ? list.length : list.filter((r) => r.status === f).length);
  const shown = filter === "all" ? list : list.filter((r) => r.status === filter);

  async function change(id: string, status: "new" | "contacted" | "done") {
    setList((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    const res = await setRequestStatus(id, status);
    show(res.ok ? "Թարմացված է ✓" : "Սխալ");
  }
  async function del(id: string) {
    if (!confirm("Ջնջե՞լ այս հարցումը։")) return;
    setList((p) => p.filter((r) => r.id !== id));
    await deleteRequest(id);
    show("Ջնջված է");
  }

  return (
    <div>
      {node}
      <h1 className="adm-h1">Կապի հարցումներ</h1>
      <p className="adm-sub">Կայքի կապի ձևից եկած հարցումները։ Ընդամենը՝ {list.length}։</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 18px" }}>
        {FILTERS.map(([f, label]) => {
          const on = filter === f;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)} className="adm-btn adm-btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: on ? "var(--a-blue)" : "transparent", color: on ? "#fff" : "var(--a-text)", border: on ? "1px solid var(--a-blue)" : "1px solid var(--a-border)" }}>
              {label}
              <span style={{ minWidth: 20, padding: "1px 7px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: on ? "rgba(255,255,255,.22)" : "var(--a-bg2)", color: on ? "#fff" : "var(--a-dim)" }}>{count(f)}</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 && <p className="adm-sub">Դեռ հարցում չկա։</p>}
      {list.length > 0 && shown.length === 0 && <p className="adm-sub">Այս կարգավիճակով հարցում չկա։</p>}

      {shown.map((r) => (
        <div key={r.id} className="adm-card">
          <div className="adm-item-head" style={{ marginBottom: 10 }}>
            <div>
              <div className="adm-item-title">{r.company} — {r.person}</div>
              <div className="adm-item-meta">{new Date(r.created_at).toLocaleString("hy-AM")}</div>
            </div>
            <span className={`adm-badge ${STATUS[r.status]?.cls || "adm-badge-new"}`}>{STATUS[r.status]?.label || r.status}</span>
          </div>
          <div className="adm-grid adm-cols2" style={{ marginBottom: 10 }}>
            <div><span style={{ color: "var(--a-faint)", fontSize: 12 }}>Հեռախոս</span><div><a href={`tel:${r.phone}`} style={{ color: "var(--a-blue)", textDecoration: "none" }}>{r.phone}</a></div></div>
            <div><span style={{ color: "var(--a-faint)", fontSize: 12 }}>Էլ. փոստ</span><div><a href={`mailto:${r.email}`} style={{ color: "var(--a-blue)", textDecoration: "none" }}>{r.email}</a></div></div>
          </div>
          {r.message && <div style={{ background: "var(--a-bg2)", borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.55, color: "var(--a-dim)", marginBottom: 12, whiteSpace: "pre-wrap" }}>{r.message}</div>}
          <div className="adm-row" style={{ flexWrap: "wrap" }}>
            {(["new", "contacted", "done"] as const).map((st) => (
              <button key={st} className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => change(r.id, st)}
                style={r.status === st ? { borderColor: "var(--a-blue)", color: "var(--a-blue)", fontWeight: 700 } : undefined}>{STATUS[st].label}</button>
            ))}
            <button className="adm-btn adm-btn-danger adm-btn-sm" style={{ marginInlineStart: "auto" }} onClick={() => del(r.id)}>Ջնջել</button>
          </div>
        </div>
      ))}
    </div>
  );
}
