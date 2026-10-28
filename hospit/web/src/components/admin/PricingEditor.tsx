"use client";

import { useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { TextInput, NumberInput, useToast } from "./fields";
import { useAdminI18n } from "./i18n";
import type { Settings, PricingConfig } from "@/lib/types";

// Հաշվիչի ինտերֆեյսի դաշտերը՝ [բանալի, հայերեն անուն, English name]
const LABEL_FIELDS: [string, string, string][] = [
  ["eyebrow", "Փոքր վերնագիր", "Eyebrow"], ["title", "Գլխավոր վերնագիր", "Main title"],
  ["monthlyFrom", "«Ամսական սկսած»", "“Monthly from”"], ["includedPrefix", "«Մինչև» (նախածանց)", "“Up to” (prefix)"],
  ["includedSuffix", "«օգտատեր ներառված»", "“users included”"], ["choosePlan", "Կոճակ՝ Ընտրել փաթեթը", "Button: Choose plan"],
  ["back", "«Վերադառնալ»", "“Back”"], ["basePackagePrefix", "«Բազային փաթեթ՝»", "“Base package:”"],
  ["employeeCount", "«Աշխատակիցների քանակ»", "“Number of employees”"], ["includedChip", "«Ներառված՝ մինչև»", "“Included: up to”"],
  ["extraChip", "«լրացուցիչ»", "“extra”"], ["summaryTitle", "«Գնային ամփոփում»", "“Price summary”"],
  ["basePackage", "«Բազային փաթեթ»", "“Base package”"], ["extraUsers", "«Լրացուցիչ օգտատերեր»", "“Extra users”"],
  ["subtotal", "«Ենթագումար»", "“Subtotal”"], ["total", "«Ընդհանուր»", "“Total”"],
  ["orderNow", "Կոճակ՝ Պատվիրել հիմա", "Button: Order now"], ["addonsTitle", "«Լրացուցիչ մոդուլներ»", "“Additional modules”"],
  ["smartTitle", "«Խելամիտ առաջարկ»", "“Smart suggestion”"],
  ["smartSub", "Առաջարկի ենթագիր", "Suggestion subtitle"], ["smartWhy", "«Ինչու՞ է ձեռնտու»", "“Why is it better”"],
  ["currentPrice", "«Ընթացիկ գին»", "“Current price”"], ["newPrice", "«Նոր գին»", "“New price”"],
  ["saveText", "«Խնայեք»", "“Save”"], ["noExtraFees", "«Առանց լրացուցիչ վճարների»", "“No extra fees”"],
  ["switchTo", "«Անցնել»", "“Switch to”"], ["backTo", "«Վերադառնալ» (փաթեթ)", "“Back to” (plan)"],
  ["formTitle", "Ձև՝ վերնագիր", "Form: title"], ["formPlan", "Ձև՝ «Փաթեթ՝»", "Form: “Plan:”"],
  ["fFirstName", "Ձև՝ Անուն", "Form: First name"], ["fLastName", "Ձև՝ Ազգանուն", "Form: Last name"],
  ["fPhone", "Ձև՝ Հեռախոս", "Form: Phone"], ["fEmail", "Ձև՝ Էլ. փոստ", "Form: Email"],
  ["fCompany", "Ձև՝ Կազմակերպություն", "Form: Company"], ["formNote", "Ձև՝ ծանոթագրություն", "Form: note"],
  ["submit", "Ձև՝ Ուղարկել", "Form: Submit"], ["submitting", "Ձև՝ «Մշակվում է...»", "Form: “Processing…”"],
  ["orCall", "«կամ զանգահարել՝»", "“or call:”"], ["required", "Սխալ՝ պարտադիր դաշտ", "Error: required"],
  ["badFormat", "Սխալ՝ ձևաչափ", "Error: bad format"], ["successMsg", "Հաջողության հաղորդագրություն", "Success message"],
];

export default function PricingEditor({ settings }: { settings: Settings }) {
  const { at } = useAdminI18n();
  const [p, setP] = useState<PricingConfig>(JSON.parse(JSON.stringify(settings.pricing)));
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  async function onSave() {
    setBusy(true);
    const res = await saveSettings({ ...settings, pricing: p });
    setBusy(false);
    show(res.ok ? at("Պահպանված է ✓", "Saved ✓") : at("Սխալ: ", "Error: ") + (res.error || ""));
  }

  const setPlan = (i: number, k: string, v: any) => setP((x) => ({ ...x, plans: x.plans.map((pl, j) => (j === i ? { ...pl, [k]: v } : pl)) }));
  const setAddon = (i: number, v: string) => setP((x) => ({ ...x, addons: x.addons.map((a, j) => (j === i ? { ...a, label: v } : a)) }));
  const setFeature = (i: number, k: "label" | "items", v: any) => setP((x) => ({ ...x, features: x.features.map((f, j) => (j === i ? { ...f, [k]: v } : f)) }));

  const saveBtn = <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : at("Պահպանել", "Save")}</button>;

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "sticky", top: 0, background: "var(--a-bg)", paddingBottom: 12, zIndex: 5 }}>
        <div>
          <h1 className="adm-h1">{at("Գնային հաշվարկ", "Pricing calculator")}</h1>
          <p className="adm-sub">{at("Փաթեթներ, գներ, մոդուլներ — գնային հաշվիչի ամբողջ բովանդակությունը (հայերեն)։", "Plans, prices, modules — all pricing calculator content (Armenian).")}</p>
        </div>
        {saveBtn}
      </div>

      {/* Plans */}
      {p.plans.map((pl, i) => (
        <div key={pl.id} className="adm-card">
          <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Փաթեթ", "Plan")} {i + 1} — {pl.shortLabel || pl.id}</h3>
          <div className="adm-grid adm-cols2">
            <TextInput label={at("Կատեգորիա (վերնագիր)", "Category (title)")} value={pl.name} onChange={(v) => setPlan(i, "name", v)} />
            <TextInput label={at("Լուծման անուն", "Solution name")} value={pl.shortLabel} onChange={(v) => setPlan(i, "shortLabel", v)} />
          </div>
          <div className="adm-field">
            <label className="adm-label">{at("Նկարագրություն", "Description")}</label>
            <textarea className="adm-textarea" value={pl.description} onChange={(e) => setPlan(i, "description", e.target.value)} />
          </div>
          <div className="adm-grid adm-cols3">
            <NumberInput label={at("Բազային գին (֏)", "Base price (֏)")} value={pl.basePrice} step={1000} onChange={(v) => setPlan(i, "basePrice", v)} />
            <NumberInput label={at("Ներառված օգտատեր", "Included users")} value={pl.includedEmployees} onChange={(v) => setPlan(i, "includedEmployees", v)} />
            <NumberInput label={at("Slider-ի առավելագույն", "Slider max")} value={pl.sliderMax} onChange={(v) => setPlan(i, "sliderMax", v)} />
          </div>
        </div>
      ))}

      {/* Global numbers */}
      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Լրացուցիչ օգտատեր և մոդուլների գին", "Extra user & module prices")}</h3>
        <NumberInput label={at("1 լրացուցիչ օգտատերի գին (֏)", "Price per extra user (֏)")} value={p.extraEmployeePrice} step={100} onChange={(v) => setP((x) => ({ ...x, extraEmployeePrice: v }))} />
        <div className="adm-grid adm-cols3">
          <NumberInput label={at("Մոդուլի գին՝ Ստարտ (֏)", "Module price: Start (֏)")} value={p.addonPriceByPlan.basic} step={1000} onChange={(v) => setP((x) => ({ ...x, addonPriceByPlan: { ...x.addonPriceByPlan, basic: v } }))} />
          <NumberInput label={at("Մոդուլի գին՝ Կլինիկա (֏)", "Module price: Clinic (֏)")} value={p.addonPriceByPlan.clinic} step={1000} onChange={(v) => setP((x) => ({ ...x, addonPriceByPlan: { ...x.addonPriceByPlan, clinic: v } }))} />
          <NumberInput label={at("Մոդուլի գին՝ Հիվանդանոց (֏)", "Module price: Hospital (֏)")} value={p.addonPriceByPlan.hospital} step={1000} onChange={(v) => setP((x) => ({ ...x, addonPriceByPlan: { ...x.addonPriceByPlan, hospital: v } }))} />
        </div>
      </div>

      {/* Add-ons */}
      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Լրացուցիչ մոդուլներ (անվանումներ)", "Additional modules (labels)")}</h3>
        {p.addons.map((a, i) => (
          <TextInput key={a.id} label={`${at("Մոդուլ", "Module")} ${i + 1}`} value={a.label} onChange={(v) => setAddon(i, v)} />
        ))}
      </div>

      {/* Core features */}
      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Հիմնական մոդուլներ (փաթեթներում ներառված)", "Core modules (included in plans)")}</h3>
        <p className="adm-sub" style={{ marginTop: 0 }}>{at("Յուրաքանչյուր կետը՝ առանձին տողում։", "Each item on its own line.")}</p>
        {p.features.map((f, i) => (
          <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < p.features.length - 1 ? "1px solid var(--a-border)" : "none" }}>
            <TextInput label={`${at("Խումբ", "Group")} ${i + 1} — ${at("վերնագիր", "title")}`} value={f.label} onChange={(v) => setFeature(i, "label", v)} />
            <div className="adm-field">
              <label className="adm-label">{at("Կետեր (մեկ տողում մեկը)", "Items (one per line)")}</label>
              <textarea className="adm-textarea" value={f.items.join("\n")} onChange={(e) => setFeature(i, "items", e.target.value.split("\n"))} onBlur={(e) => setFeature(i, "items", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
            </div>
          </div>
        ))}
      </div>

      {/* Guarantees + note */}
      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Երաշխիքներ և ծանոթագրություն", "Guarantees & note")}</h3>
        <div className="adm-field">
          <label className="adm-label">{at("Երաշխիքներ (մեկ տողում մեկը)", "Guarantees (one per line)")}</label>
          <textarea className="adm-textarea" value={p.guarantees.join("\n")} onChange={(e) => setP((x) => ({ ...x, guarantees: e.target.value.split("\n") }))} onBlur={(e) => setP((x) => ({ ...x, guarantees: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))} />
        </div>
        <TextInput label={at("Ներքևի ծանոթագրություն (*)", "Bottom note (*)")} value={p.serverNote} onChange={(v) => setP((x) => ({ ...x, serverNote: v }))} />
      </div>

      {/* Հաշվիչի ինտերֆեյսի տեքստերը */}
      <div className="adm-card">
        <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{at("Հաշվիչի տեքստերը", "Calculator texts")}</h3>
        <p className="adm-sub" style={{ marginTop: 0 }}>{at("Բոլոր վերնագրերը, կոճակները և ձևի դաշտերի անվանումները։", "All headings, buttons and form field labels.")}</p>
        <div className="adm-grid adm-cols2">
          {LABEL_FIELDS.map(([key, hy, en]) => (
            <TextInput key={key} label={at(hy, en)} value={(p.labels as any)[key] ?? ""}
              onChange={(v) => setP((x) => ({ ...x, labels: { ...x.labels, [key]: v } }))} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>{saveBtn}</div>
    </div>
  );
}
