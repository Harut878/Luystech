"use client";

import { useState } from "react";
import { upsertRow, deleteRow } from "@/app/admin/actions";
import { MLInput, TextInput, NumberInput, BoolInput, IconPicker, ImageUpload, useToast, emptyML } from "./fields";
import Icon from "@/components/site/Icon";
import type { ML, IconKey } from "@/lib/types";

export type Field =
  | { key: string; label: string; kind: "text"; inputType?: string; help?: string }
  | { key: string; label: string; kind: "ml"; area?: boolean; help?: string }
  | { key: string; label: string; kind: "number"; step?: number }
  | { key: string; label: string; kind: "bool" }
  | { key: string; label: string; kind: "icon" }
  | { key: string; label: string; kind: "select"; options: [string, string][]; help?: string }
  | { key: string; label: string; kind: "image"; folder: string; help?: string };

type Row = Record<string, any>;

function newId() {
  try { return (crypto as any).randomUUID(); } catch { return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10); }
}

export default function EntityEditor({ table, title, sub, rows, fields, titleKey, defaults }: {
  table: string; title: string; sub: string; rows: Row[]; fields: Field[]; titleKey: string; defaults: Row;
}) {
  const [list, setList] = useState<Row[]>(rows);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  const rowTitle = (r: Row) => {
    const v = r[titleKey];
    return typeof v === "object" && v ? v.am || v.en || "—" : String(v ?? "—");
  };

  function startNew() {
    const base: Row = { ...JSON.parse(JSON.stringify(defaults)), id: newId(), sort: (list.length + 1) };
    setDraft(base); setEditing("__new__");
  }
  function startEdit(r: Row) { setDraft(JSON.parse(JSON.stringify(r))); setEditing(r.id); }
  function cancel() { setEditing(null); setDraft(null); }

  async function save() {
    if (!draft) return;
    setBusy(true);
    const res = await upsertRow(table, draft);
    setBusy(false);
    if (!res.ok) { show("Սխալ: " + (res.error || "")); return; }
    setList((prev) => {
      const i = prev.findIndex((x) => x.id === draft.id);
      if (i >= 0) { const c = [...prev]; c[i] = draft; return c; }
      return [...prev, draft];
    });
    show("Պահպանված է ✓");
    cancel();
  }

  async function remove(r: Row) {
    if (!confirm(`Ջնջե՞լ «${rowTitle(r)}»-ը։`)) return;
    const res = await deleteRow(table, r.id);
    if (!res.ok) { show("Սխալ: " + (res.error || "")); return; }
    setList((prev) => prev.filter((x) => x.id !== r.id));
    show("Ջնջված է");
  }

  // Մեկ սեղմումով ON/OFF՝ ցուցադրե՞լ քարտը կայքում, թե՞ ոչ
  async function toggleActive(r: Row) {
    const next = { ...r, active: !r.active };
    setList((prev) => prev.map((x) => (x.id === r.id ? next : x)));
    const res = await upsertRow(table, next);
    if (!res.ok) { setList((prev) => prev.map((x) => (x.id === r.id ? r : x))); show("Սխալ: " + (res.error || "")); return; }
    show(next.active ? "Միացված է — երևում է կայքում ✓" : "Անջատված է — թաքնված է կայքից");
  }

  const set = (k: string, v: any) => setDraft((d) => ({ ...(d as Row), [k]: v }));

  function renderForm() {
    if (!draft) return null;
    return (
      <div className="adm-card" style={{ border: "1px solid var(--a-blue)" }}>
        {fields.map((f) => {
          switch (f.kind) {
            case "ml": return <MLInput key={f.key} label={f.label} area={f.area} help={f.help} value={(draft[f.key] as ML) || emptyML} onChange={(v) => set(f.key, v)} />;
            case "text": return <TextInput key={f.key} label={f.label} type={f.inputType} help={f.help} value={draft[f.key] ?? ""} onChange={(v) => set(f.key, v)} />;
            case "number": return <NumberInput key={f.key} label={f.label} step={f.step} value={draft[f.key] ?? 0} onChange={(v) => set(f.key, v)} />;
            case "bool": return <BoolInput key={f.key} label={f.label} value={!!draft[f.key]} onChange={(v) => set(f.key, v)} />;
            case "icon": return <IconPicker key={f.key} label={f.label} value={(draft[f.key] as IconKey) || "box"} onChange={(v) => set(f.key, v)} />;
            case "select": return (
              <div key={f.key} className="adm-field">
                <label className="adm-label">{f.label}</label>
                <select className="adm-select" value={draft[f.key] ?? f.options[0]?.[0]} onChange={(e) => set(f.key, e.target.value)}>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {f.help ? <div style={{ fontSize: 12, color: "var(--a-faint)", marginTop: 5 }}>{f.help}</div> : null}
              </div>
            );
            case "image": return <ImageUpload key={f.key} label={f.label} folder={f.folder} help={f.help} value={draft[f.key] ?? null} onChange={(v) => set(f.key, v)} />;
          }
        })}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>{busy ? "…" : "Պահպանել"}</button>
          <button className="adm-btn adm-btn-ghost" onClick={cancel} disabled={busy}>Չեղարկել</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="adm-h1">{title}</h1>
          <p className="adm-sub">{sub}</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={startNew} disabled={editing === "__new__"}>+ Ավելացնել</button>
      </div>

      {editing === "__new__" && renderForm()}

      {list.map((r) => (
        <div key={r.id}>
          {editing === r.id ? renderForm() : (
            <div className="adm-item">
              <div className="adm-item-head">
                <div className="adm-row" style={{ minWidth: 0 }}>
                  {r.icon && <span style={{ color: "var(--a-blue)", flex: "none" }}><Icon name={r.icon as IconKey} size={20} /></span>}
                  {("logo_url" in r || "image_url" in r) && (r.logo_url || r.image_url) ? <img className="adm-thumb" src={r.logo_url || r.image_url} alt="" /> : null}
                  <div style={{ minWidth: 0 }}>
                    <div className="adm-item-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rowTitle(r)}</div>
                    {"sort" in r && <div className="adm-item-meta">Հերթ. #{r.sort}</div>}
                  </div>
                </div>
                <div className="adm-row" style={{ flex: "none" }}>
                  {"active" in r && (
                    <button onClick={() => toggleActive(r)} title={r.active ? "Ցուցադրվում է կայքում — սեղմեք թաքցնելու համար" : "Թաքնված է — սեղմեք ցուցադրելու համար"}
                      style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "4px 2px" }}>
                      <span style={{ width: 42, height: 24, borderRadius: 999, background: r.active ? "var(--a-green)" : "var(--a-border2)", position: "relative", transition: ".2s", flex: "none" }}>
                        <span style={{ position: "absolute", top: 3, left: r.active ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: ".2s" }} />
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: r.active ? "var(--a-green)" : "var(--a-dim)", minWidth: 58, textAlign: "start" }}>{r.active ? "Կայքում" : "Թաքնված"}</span>
                    </button>
                  )}
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => startEdit(r)}>Խմբագրել</button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(r)}>Ջնջել</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {list.length === 0 && editing !== "__new__" && <p className="adm-sub">Դեռ տվյալ չկա։ Սեղմեք «Ավելացնել»։</p>}
    </div>
  );
}
