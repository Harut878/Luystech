"use client";

import { useState } from "react";
import { upsertRow, deleteRow } from "@/lib/api";
import { MLInput, TextInput, NumberInput, BoolInput, ImageUpload, useToast, emptyML } from "./fields";
import type { Story, StoryMetric } from "@/lib/types";

function newId() { try { return (crypto as any).randomUUID(); } catch { return "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10); } }
const emptyMetric = (): StoryMetric => ({ target: 0, suffix: "%", decimals: 0, label: { ...emptyML } });
const emptyStory = (n: number): Story => ({ id: newId(), name: "", logo_url: null, industry: { ...emptyML }, challenge: { ...emptyML }, solution: { ...emptyML }, metrics: [emptyMetric(), emptyMetric()], sort: n, active: true });

export default function StoriesEditor({ rows }: { rows: Story[] }) {
  const [list, setList] = useState<Story[]>(rows);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Story | null>(null);
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  const set = <K extends keyof Story>(k: K, v: Story[K]) => setDraft((d) => ({ ...(d as Story), [k]: v }));
  const setMetric = (i: number, patch: Partial<StoryMetric>) =>
    setDraft((d) => { if (!d) return d; const m = [...d.metrics]; m[i] = { ...m[i], ...patch }; return { ...d, metrics: m }; });

  async function save() {
    if (!draft) return;
    setBusy(true);
    const res = await upsertRow("stories", draft as any);
    setBusy(false);
    if (!res.ok) { show("Սխալ: " + (res.error || "")); return; }
    setList((prev) => { const i = prev.findIndex((x) => x.id === draft.id); if (i >= 0) { const c = [...prev]; c[i] = draft; return c; } return [...prev, draft]; });
    show("Պահպանված է ✓"); setEditing(null); setDraft(null);
  }
  async function remove(r: Story) {
    if (!confirm(`Ջնջե՞լ «${r.name}»-ը։`)) return;
    const res = await deleteRow("stories", r.id);
    if (!res.ok) { show("Սխալ"); return; }
    setList((prev) => prev.filter((x) => x.id !== r.id)); show("Ջնջված է");
  }

  async function toggleActive(r: Story) {
    const next = { ...r, active: !r.active };
    setList((prev) => prev.map((x) => (x.id === r.id ? next : x)));
    const res = await upsertRow("stories", next as any);
    if (!res.ok) { setList((prev) => prev.map((x) => (x.id === r.id ? r : x))); show("Սխալ"); return; }
    show(next.active ? "Միացված է — երևում է կայքում ✓" : "Անջատված է — թաքնված է կայքից");
  }

  function form() {
    if (!draft) return null;
    return (
      <div className="adm-card" style={{ border: "1px solid var(--a-blue)" }}>
        <TextInput label="Ընկերության անուն" value={draft.name} onChange={(v) => set("name", v)} />
        <ImageUpload label="Լոգո" folder="stories" value={draft.logo_url} onChange={(v) => set("logo_url", v)} />
        <MLInput label="Ոլորտ" value={draft.industry} onChange={(v) => set("industry", v)} />
        <MLInput label="Մարտահրավեր" value={draft.challenge} onChange={(v) => set("challenge", v)} area />
        <MLInput label="Լուծում" value={draft.solution} onChange={(v) => set("solution", v)} area />

        <div style={{ margin: "8px 0", fontSize: 13, fontWeight: 700, color: "var(--a-dim)" }}>Ցուցանիշներ (թվեր)</div>
        {draft.metrics.map((m, i) => (
          <div key={i} className="adm-item" style={{ background: "var(--a-bg2)" }}>
            <div className="adm-grid adm-cols3">
              <NumberInput label="Թիվ" value={m.target} step={0.1} onChange={(v) => setMetric(i, { target: v })} />
              <TextInput label="Վերջածանց" value={m.suffix} onChange={(v) => setMetric(i, { suffix: v })} />
              <NumberInput label="Տասնորդ." value={m.decimals} onChange={(v) => setMetric(i, { decimals: v })} />
            </div>
            <MLInput label="Ենթագիր" value={m.label} onChange={(v) => setMetric(i, { label: v })} />
            <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => set("metrics", draft.metrics.filter((_, j) => j !== i))}>Հեռացնել ցուցանիշը</button>
          </div>
        ))}
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => set("metrics", [...draft.metrics, emptyMetric()])}>+ Ավելացնել ցուցանիշ</button>

        <div style={{ marginTop: 14 }}><NumberInput label="Հերթականություն" value={draft.sort} onChange={(v) => set("sort", v)} /></div>
        <BoolInput label="Ակտիվ" value={draft.active} onChange={(v) => set("active", v)} />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>{busy ? "…" : "Պահպանել"}</button>
          <button className="adm-btn adm-btn-ghost" onClick={() => { setEditing(null); setDraft(null); }} disabled={busy}>Չեղարկել</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 className="adm-h1">Հաջողության պատմություններ</h1><p className="adm-sub">Հաճախորդների դեպքերի ուսումնասիրություններ՝ մարտահրավեր, լուծում և արդյունքներ։</p></div>
        <button className="adm-btn adm-btn-primary" onClick={() => { setDraft(emptyStory(list.length + 1)); setEditing("__new__"); }} disabled={editing === "__new__"}>+ Ավելացնել</button>
      </div>
      {editing === "__new__" && form()}
      {list.map((r) => (
        <div key={r.id}>
          {editing === r.id ? form() : (
            <div className="adm-item">
              <div className="adm-item-head">
                <div className="adm-row" style={{ minWidth: 0 }}>
                  {r.logo_url ? <img className="adm-thumb" src={r.logo_url} alt="" /> : null}
                  <div><div className="adm-item-title">{r.name || "—"}</div><div className="adm-item-meta">{r.industry?.am} · {r.metrics?.length || 0} ցուցանիշ</div></div>
                </div>
                <div className="adm-row" style={{ flex: "none" }}>
                  <button onClick={() => toggleActive(r)} title={r.active ? "Ցուցադրվում է կայքում — սեղմեք թաքցնելու համար" : "Թաքնված է — սեղմեք ցուցադրելու համար"}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "4px 2px" }}>
                    <span style={{ width: 42, height: 24, borderRadius: 999, background: r.active ? "var(--a-green)" : "var(--a-border2)", position: "relative", transition: ".2s", flex: "none" }}>
                      <span style={{ position: "absolute", top: 3, left: r.active ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: ".2s" }} />
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: r.active ? "var(--a-green)" : "var(--a-dim)", minWidth: 58, textAlign: "start" }}>{r.active ? "Կայքում" : "Թաքնված"}</span>
                  </button>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setDraft(JSON.parse(JSON.stringify(r))); setEditing(r.id); }}>Խմբագրել</button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(r)}>Ջնջել</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
