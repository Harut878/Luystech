"use client";

import { useState } from "react";
import { setRequestStatus, deleteRequest } from "@/app/admin/actions";
import { useToast } from "./fields";
import { useAdminI18n, L } from "./i18n";
import type { ContactRequest } from "@/lib/types";

const STATUS_CLS: Record<string, string> = { new: "adm-badge-new", contacted: "adm-badge-on", done: "adm-badge-off" };
const STATUS_LBL: Record<string, ReturnType<typeof L>> = {
  new: L("Նոր", "New"), contacted: L("Կապ հաստատված", "Contacted"), done: L("Ավարտված", "Done"),
};

export default function RequestsView({ rows }: { rows: ContactRequest[] }) {
  const { at, lang } = useAdminI18n();
  const [list, setList] = useState<ContactRequest[]>(rows);
  const { show, node } = useToast();

  async function change(id: string, status: "new" | "contacted" | "done") {
    setList((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    const res = await setRequestStatus(id, status);
    show(res.ok ? at("Թարմացված է ✓", "Updated ✓") : at("Սխալ", "Error"));
  }
  async function del(id: string) {
    if (!confirm(at("Ջնջե՞լ այս հարցումը։", "Delete this request?"))) return;
    setList((p) => p.filter((r) => r.id !== id));
    await deleteRequest(id);
    show(at("Ջնջված է", "Deleted"));
  }
  const locale = lang === "en" ? "en-US" : "hy-AM";

  return (
    <div>
      {node}
      <h1 className="adm-h1">{at("Կապի հարցումներ", "Contact requests")}</h1>
      <p className="adm-sub">{at("Կայքի կապի ձևից եկած հարցումները։ Ընդամենը՝ ", "Requests from the site contact form. Total: ")}{list.length}։</p>

      {list.length === 0 && <p className="adm-sub">{at("Դեռ հարցում չկա։", "No requests yet.")}</p>}

      {list.map((r) => (
        <div key={r.id} className="adm-card">
          <div className="adm-item-head" style={{ marginBottom: 10 }}>
            <div>
              <div className="adm-item-title">{r.name}{r.subject ? ` — ${r.subject}` : ""}</div>
              <div className="adm-item-meta">{new Date(r.created_at).toLocaleString(locale)}</div>
            </div>
            <span className={`adm-badge ${STATUS_CLS[r.status] || "adm-badge-new"}`}>{at(STATUS_LBL[r.status] || STATUS_LBL.new)}</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={{ color: "var(--a-faint)", fontSize: 12 }}>{at("Էլ. փոստ", "Email")}</span>
            <div><a href={`mailto:${r.email}`} style={{ color: "var(--a-blue)", textDecoration: "none" }}>{r.email}</a></div>
          </div>
          {r.message && <div style={{ background: "var(--a-bg2)", borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.55, color: "var(--a-dim)", marginBottom: 12, whiteSpace: "pre-wrap" }}>{r.message}</div>}
          <div className="adm-row" style={{ flexWrap: "wrap" }}>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => change(r.id, "new")}>{at("Նոր", "New")}</button>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => change(r.id, "contacted")}>{at("Կապ հաստատված", "Contacted")}</button>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => change(r.id, "done")}>{at("Ավարտված", "Done")}</button>
            <button className="adm-btn adm-btn-danger adm-btn-sm" style={{ marginInlineStart: "auto" }} onClick={() => del(r.id)}>{at("Ջնջել", "Delete")}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
