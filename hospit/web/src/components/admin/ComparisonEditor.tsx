"use client";

// «HospIT vs այլ համակարգեր» աղյուսակի ամբողջական խմբագրիչ։
// Համակարգերը = սյուներ (ավելացնել/ակտիվացնել/ջնջել), տողերը = հատկություններ։
import { useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { MLInput, NumberInput, BoolInput, useToast, emptyML } from "./fields";
import { useAdminI18n } from "./i18n";
import type { Settings, ComparisonConfig, CompareSystem, CompareRow } from "@/lib/types";

const VALUES: [string, string, string][] = [
  ["yes", "✓ Այո", "✓ Yes"],
  ["no", "✗ Ոչ", "✗ No"],
  ["partial", "— Մասամբ", "— Partial"],
];

function nid(prefix: string) {
  try { return prefix + "_" + (crypto as any).randomUUID().slice(0, 6); } catch { return prefix + "_" + Math.random().toString(36).slice(2, 8); }
}

export default function ComparisonEditor({ settings }: { settings: Settings }) {
  const { at } = useAdminI18n();
  const [c, setC] = useState<ComparisonConfig>(
    JSON.parse(JSON.stringify(settings.comparison || { systems: [], rows: [] }))
  );
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  async function onSave() {
    setBusy(true);
    const res = await saveSettings({ ...settings, comparison: c });
    setBusy(false);
    show(res.ok ? at("Պահպանված է ✓", "Saved ✓") : at("Սխալ: ", "Error: ") + (res.error || ""));
  }

  const setSys = (i: number, k: keyof CompareSystem, v: any) =>
    setC((x) => ({ ...x, systems: x.systems.map((sy, j) => (j === i ? { ...sy, [k]: v } : sy)) }));
  const setRow = (i: number, k: keyof CompareRow, v: any) =>
    setC((x) => ({ ...x, rows: x.rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)) }));
  const setCell = (i: number, sysId: string, v: string) =>
    setC((x) => ({ ...x, rows: x.rows.map((r, j) => (j === i ? { ...r, values: { ...r.values, [sysId]: v } } : r)) }));

  function addSystem() {
    const id = nid("sys");
    setC((x) => ({
      ...x,
      systems: [...x.systems, { id, name: { ...emptyML }, highlight: false, active: true, sort: x.systems.length + 1 }],
      rows: x.rows.map((r) => ({ ...r, values: { ...r.values, [id]: "no" } })),
    }));
  }
  function delSystem(i: number) {
    const sy = c.systems[i];
    if (!confirm(at("Ջնջե՞լ այս սյունը։", "Delete this column?"))) return;
    setC((x) => ({
      ...x,
      systems: x.systems.filter((_, j) => j !== i),
      rows: x.rows.map((r) => { const v = { ...r.values }; delete v[sy.id]; return { ...r, values: v }; }),
    }));
  }
  function addRow() {
    const values: Record<string, string> = {};
    c.systems.forEach((sy) => { values[sy.id] = "no"; });
    setC((x) => ({ ...x, rows: [...x.rows, { id: nid("row"), feature: { ...emptyML }, values, active: true, sort: x.rows.length + 1 }] }));
  }
  function delRow(i: number) {
    if (!confirm(at("Ջնջե՞լ այս տողը։", "Delete this row?"))) return;
    setC((x) => ({ ...x, rows: x.rows.filter((_, j) => j !== i) }));
  }

  const saveBtn = <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : at("Պահպանել", "Save")}</button>;

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "sticky", top: 0, background: "var(--a-bg)", paddingBottom: 12, zIndex: 5 }}>
        <div>
          <h1 className="adm-h1">{at("Համեմատության աղյուսակ", "Comparison table")}</h1>
          <p className="adm-sub">{at("«Ինչու մենք» էջի աղյուսակը՝ HospIT-ը այլ համակարգերի հետ։ Ավելացրեք համակարգեր (սյուներ) և հատկություններ (տողեր)։", "The Why Us page table comparing HospIT with other systems. Add systems (columns) and features (rows).")}</p>
        </div>
        {saveBtn}
      </div>

      <div className="adm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{at("Համակարգերը (սյուներ)", "Systems (columns)")}</h3>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={addSystem}>+ {at("Ավելացնել համակարգ", "Add system")}</button>
        </div>
        {c.systems.map((sy, i) => (
          <div key={sy.id} style={{ borderTop: "1px solid var(--a-border)", paddingTop: 14, marginTop: 14 }}>
            <MLInput label={at("Անվանում", "Name") + " " + (i + 1)} value={sy.name} onChange={(v) => setSys(i, "name", v)} />
            <div className="adm-grid adm-cols3">
              <NumberInput label={at("Հերթականություն", "Order")} value={sy.sort} onChange={(v) => setSys(i, "sort", v)} />
              <BoolInput label={at("Մեր համակարգն է (շեշտված)", "This is us (highlighted)")} value={sy.highlight} onChange={(v) => setSys(i, "highlight", v)} />
              <BoolInput label={at("Ակտիվ", "Active")} value={sy.active} onChange={(v) => setSys(i, "active", v)} />
            </div>
            <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => delSystem(i)}>{at("Ջնջել սյունը", "Delete column")}</button>
          </div>
        ))}
        {c.systems.length === 0 && <p className="adm-sub">{at("Համակարգ չկա։", "No systems yet.")}</p>}
      </div>

      <div className="adm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{at("Հատկությունները (տողեր)", "Features (rows)")}</h3>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={addRow}>+ {at("Ավելացնել տող", "Add row")}</button>
        </div>
        {c.rows.map((r, i) => (
          <div key={r.id} style={{ borderTop: "1px solid var(--a-border)", paddingTop: 14, marginTop: 14 }}>
            <MLInput label={at("Հատկություն", "Feature") + " " + (i + 1)} value={r.feature} onChange={(v) => setRow(i, "feature", v)} />
            <div className="adm-grid adm-cols2">
              {c.systems.map((sy) => {
                const cur = r.values?.[sy.id] ?? "no";
                const preset = VALUES.some((v) => v[0] === cur);
                return (
                  <div key={sy.id} className="adm-field">
                    <label className="adm-label">{sy.name.hy || sy.name.en || sy.id}</label>
                    <select className="adm-select" value={preset ? cur : "__text"} onChange={(e) => setCell(i, sy.id, e.target.value === "__text" ? "" : e.target.value)}>
                      {VALUES.map(([v, hy, en]) => <option key={v} value={v}>{at(hy, en)}</option>)}
                      <option value="__text">{at("Տեքստ…", "Text…")}</option>
                    </select>
                    {!preset && (
                      <input className="adm-input" style={{ marginTop: 6 }} value={cur} placeholder={at("Օր.՝ 5 րոպե", "e.g. 5 min")} onChange={(e) => setCell(i, sy.id, e.target.value)} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="adm-grid adm-cols2">
              <NumberInput label={at("Հերթականություն", "Order")} value={r.sort} onChange={(v) => setRow(i, "sort", v)} />
              <BoolInput label={at("Ակտիվ", "Active")} value={r.active} onChange={(v) => setRow(i, "active", v)} />
            </div>
            <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => delRow(i)}>{at("Ջնջել տողը", "Delete row")}</button>
          </div>
        ))}
        {c.rows.length === 0 && <p className="adm-sub">{at("Տող չկա։", "No rows yet.")}</p>}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>{saveBtn}</div>
    </div>
  );
}
