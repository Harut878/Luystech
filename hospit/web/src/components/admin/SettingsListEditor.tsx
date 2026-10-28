"use client";

// Ցուցակների խմբագրիչ, որոնք պահվում են app_settings-ում (FAQ, ինտեգրացիաներ)։
// Աշխատում է ճիշտ ինչպես EntityEditor-ը, բայց պահպանում է saveSettings-ով։
import { useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { MLInput, TextInput, NumberInput, BoolInput, ImageUpload, useToast, emptyML } from "./fields";
import { useAdminI18n } from "./i18n";
import type { Bi } from "./bi";
import type { Settings, ML } from "@/lib/types";

export type SListField =
  | { key: string; label: Bi; kind: "text"; inputType?: string; help?: Bi }
  | { key: string; label: Bi; kind: "ml"; area?: boolean; help?: Bi }
  | { key: string; label: Bi; kind: "number" }
  | { key: string; label: Bi; kind: "bool" }
  | { key: string; label: Bi; kind: "image"; folder: string; help?: Bi };

type Row = Record<string, any>;

function newId(prefix: string) {
  try { return prefix + "_" + (crypto as any).randomUUID().slice(0, 6); } catch { return prefix + "_" + Math.random().toString(36).slice(2, 8); }
}

export default function SettingsListEditor({ settings, listKey, title, sub, titleKey, fields, defaults, idPrefix }: {
  settings: Settings; listKey: "faqs" | "integrations";
  title: Bi; sub: Bi; titleKey: string; fields: SListField[]; defaults: Row; idPrefix: string;
}) {
  const { at } = useAdminI18n();
  const [list, setList] = useState<Row[]>(JSON.parse(JSON.stringify((settings as any)[listKey] || [])));
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  const rowTitle = (r: Row) => {
    const v = r[titleKey];
    const s = typeof v === "object" && v ? v.hy || v.en || "—" : String(v ?? "—");
    return s.length > 70 ? s.slice(0, 70) + "…" : s;
  };

  async function persist(next: Row[]) {
    setBusy(true);
    const res = await saveSettings({ ...settings, [listKey]: next });
    setBusy(false);
    if (!res.ok) { show(at("Սխալ: ", "Error: ") + (res.error || "")); return false; }
    show(at("Պահպանված է ✓", "Saved ✓"));
    return true;
  }

  function startNew() {
    setDraft({ ...JSON.parse(JSON.stringify(defaults)), id: newId(idPrefix), sort: list.length + 1 });
    setEditing("__new__");
  }
  function startEdit(r: Row) { setDraft(JSON.parse(JSON.stringify(r))); setEditing(r.id); }
  function cancel() { setEditing(null); setDraft(null); }

  async function save() {
    if (!draft) return;
    const i = list.findIndex((x) => x.id === draft.id);
    const next = i >= 0 ? list.map((x, j) => (j === i ? draft : x)) : [...list, draft];
    if (await persist(next)) { setList(next); cancel(); }
  }
  async function remove(r: Row) {
    if (!confirm(at(`Ջնջե՞լ «${rowTitle(r)}»-ը։`, `Delete “${rowTitle(r)}”?`))) return;
    const next = list.filter((x) => x.id !== r.id);
    if (await persist(next)) setList(next);
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
            case "number": return <NumberInput key={f.key} label={label} value={draft[f.key] ?? 0} onChange={(v) => set(f.key, v)} />;
            case "bool": return <BoolInput key={f.key} label={label} value={!!draft[f.key]} onChange={(v) => set(f.key, v)} />;
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
                  {r.logo_url ? <img className="adm-thumb" src={r.logo_url} alt="" /> : null}
                  <div style={{ minWidth: 0 }}>
                    <div className="adm-item-title">{rowTitle(r)}</div>
                    <div className="adm-item-meta">{at("Հերթ.", "Order")} #{r.sort}</div>
                  </div>
                </div>
                <div className="adm-row" style={{ flex: "none" }}>
                  <span className={`adm-badge ${r.active ? "adm-badge-on" : "adm-badge-off"}`}>{r.active ? at("Ակտիվ", "Active") : at("Թաքն.", "Hidden")}</span>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => startEdit(r)}>{at("Խմբագրել", "Edit")}</button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(r)} disabled={busy}>{at("Ջնջել", "Delete")}</button>
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
