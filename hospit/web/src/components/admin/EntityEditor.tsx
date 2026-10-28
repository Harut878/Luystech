"use client";

import { useState } from "react";
import { upsertRow, deleteRow } from "@/app/admin/actions";
import { MLInput, TextInput, NumberInput, BoolInput, IconPicker, ImageUpload, useToast, emptyML } from "./fields";
import { useAdminI18n, type Bi } from "./i18n";
import Icon from "@/components/site/Icon";
import type { ML, IconKey } from "@/lib/types";

export type Field =
  | { key: string; label: Bi; kind: "text"; inputType?: string; help?: Bi }
  | { key: string; label: Bi; kind: "ml"; area?: boolean; help?: Bi }
  | { key: string; label: Bi; kind: "number"; step?: number }
  | { key: string; label: Bi; kind: "bool" }
  | { key: string; label: Bi; kind: "icon" }
  | { key: string; label: Bi; kind: "image"; folder: string; help?: Bi };

type Row = Record<string, any>;

function newId() {
  try { return (crypto as any).randomUUID().slice(0, 8); } catch { return "id" + Math.random().toString(36).slice(2, 9); }
}

export default function EntityEditor({ table, title, sub, rows, fields, titleKey, defaults }: {
  table: string; title: Bi; sub: Bi; rows: Row[]; fields: Field[]; titleKey: string; defaults: Row;
}) {
  const { at } = useAdminI18n();
  const [list, setList] = useState<Row[]>(rows);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  const rowTitle = (r: Row) => {
    const v = r[titleKey];
    return typeof v === "object" && v ? v.hy || v.en || "—" : String(v ?? "—");
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
    if (!res.ok) { show(at("Սխալ: ", "Error: ") + (res.error || "")); return; }
    setList((prev) => {
      const i = prev.findIndex((x) => x.id === draft.id);
      if (i >= 0) { const c = [...prev]; c[i] = draft; return c; }
      return [...prev, draft];
    });
    show(at("Պահպանված է ✓", "Saved ✓"));
    cancel();
  }

  async function remove(r: Row) {
    if (!confirm(at(`Ջնջե՞լ «${rowTitle(r)}»-ը։`, `Delete “${rowTitle(r)}”?`))) return;
    const res = await deleteRow(table, r.id);
    if (!res.ok) { show(at("Սխալ: ", "Error: ") + (res.error || "")); return; }
    setList((prev) => prev.filter((x) => x.id !== r.id));
    show(at("Ջնջված է", "Deleted"));
  }

  const set = (k: string, v: any) => setDraft((d) => ({ ...(d as Row), [k]: v }));

  function renderForm() {
    if (!draft) return null;
    return (
      <div className="adm-card" style={{ border: "1px solid var(--a-blue)" }}>
        {fields.map((f) => {
          const label = at(f.label);
          const help = "help" in f && f.help ? at(f.help) : undefined;
          switch (f.kind) {
            case "ml": return <MLInput key={f.key} label={label} area={f.area} help={help} value={(draft[f.key] as ML) || emptyML} onChange={(v) => set(f.key, v)} />;
            case "text": return <TextInput key={f.key} label={label} type={f.inputType} help={help} value={draft[f.key] ?? ""} onChange={(v) => set(f.key, v)} />;
            case "number": return <NumberInput key={f.key} label={label} step={f.step} value={draft[f.key] ?? 0} onChange={(v) => set(f.key, v)} />;
            case "bool": return <BoolInput key={f.key} label={label} value={!!draft[f.key]} onChange={(v) => set(f.key, v)} />;
            case "icon": return <IconPicker key={f.key} label={label} value={(draft[f.key] as IconKey) || "patient"} onChange={(v) => set(f.key, v)} />;
            case "image": return <ImageUpload key={f.key} label={label} folder={f.folder} help={help} value={draft[f.key] ?? null} onChange={(v) => set(f.key, v)} />;
          }
        })}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>{busy ? "…" : at("Պահպանել", "Save")}</button>
          <button className="adm-btn adm-btn-ghost" onClick={cancel} disabled={busy}>{at("Չեղարկել", "Cancel")}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="adm-h1">{at(title)}</h1>
          <p className="adm-sub">{at(sub)}</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={startNew} disabled={editing === "__new__"}>+ {at("Ավելացնել", "Add")}</button>
      </div>

      {editing === "__new__" && renderForm()}

      {list.map((r) => (
        <div key={r.id}>
          {editing === r.id ? renderForm() : (
            <div className="adm-item">
              <div className="adm-item-head">
                <div className="adm-row" style={{ minWidth: 0 }}>
                  {r.icon && <span style={{ color: "var(--a-blue)", flex: "none" }}><Icon name={r.icon as IconKey} size={20} /></span>}
                  {r.emoji ? <span style={{ fontSize: 20, flex: "none" }}>{r.emoji}</span> : null}
                  {("logo_url" in r || "image_url" in r) && (r.logo_url || r.image_url) ? <img className="adm-thumb" src={r.logo_url || r.image_url} alt="" /> : null}
                  <div style={{ minWidth: 0 }}>
                    <div className="adm-item-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rowTitle(r)}</div>
                    {"sort" in r && <div className="adm-item-meta">{at("Հերթ.", "Order")} #{r.sort}</div>}
                  </div>
                </div>
                <div className="adm-row" style={{ flex: "none" }}>
                  {"active" in r && <span className={`adm-badge ${r.active ? "adm-badge-on" : "adm-badge-off"}`}>{r.active ? at("Ակտիվ", "Active") : at("Թաքն.", "Hidden")}</span>}
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => startEdit(r)}>{at("Խմբագրել", "Edit")}</button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(r)}>{at("Ջնջել", "Delete")}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {list.length === 0 && editing !== "__new__" && <p className="adm-sub">{at("Դեռ տվյալ չկա։ Սեղմեք «Ավելացնել»։", "No items yet. Click “Add”.")}</p>}
    </div>
  );
}
