"use client";

// HospIT — Գնային հաշվիչ։ ԼՈԳԻԿԱՆ նույնն է hospit.am-ի աղբյուրին,
// ԻՆՏԵՐՖԵՅՍԸ՝ մեր թեմայով, ԲՈՎԱՆԴԱԿՈՒԹՅՈՒՆԸ՝ ադմինից (config prop)։
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Check, Stethoscope, Building2, Activity, BedDouble, Wallet, ClipboardCheck,
  CalendarClock, FlaskConical, ScanLine, BarChart3, Database, ArrowRight,
  Sparkles, Phone, Mail, X, TrendingUp, RefreshCw,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import type { PricingConfig, PlanKey } from "@/lib/types";
import { computePrice, type Priced } from "@/lib/pricing";

// Կապի տվյալները գալիս են ադմինի «Կապ և կարգավորումներ» բաժնից

const GREEN = "oklch(62% 0.17 155)";
const ROSE = "oklch(60% 0.2 18)";

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

// Դիզայն (icon + շեշտագույն) ըստ փաթեթի — կոդում է
const PLAN_META: Record<PlanKey, { icon: LucideIcon; accent: string }> = {
  basic: { icon: Sparkles, accent: "oklch(64% 0.12 180)" },
  clinic: { icon: Stethoscope, accent: "var(--accent)" },
  hospital: { icon: Building2, accent: "oklch(55% 0.19 285)" },
};
const FEATURE_ICONS: LucideIcon[] = [Activity, BedDouble, Wallet, ClipboardCheck];
const ADDON_ICONS: Record<string, LucideIcon> = { "online-booking": CalendarClock, lis: FlaskConical, pacs: ScanLine, bi: BarChart3, hs1c: Database };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
}
function formatPrice(price: number): string { return price.toLocaleString("en-US"); }

type FullPlan = { id: PlanKey; name: string; shortLabel: string; description: string; basePrice: number; includedEmployees: number; sliderMax: number; icon: LucideIcon; accent: string };

type PriceCtxType = {
  order: PlanKey[];
  plans: Record<PlanKey, FullPlan>;
  addons: { id: string; label: string; icon: LucideIcon }[];
  features: { label: string; items: string[]; icon: LucideIcon }[];
  guarantees: string[]; serverNote: string; extraPrice: number;
  L: PricingConfig["labels"]; phone: string; email: string;
  addonPrice: (plan: PlanKey) => number;
  compute: (plan: PlanKey, emp: number, sel: Set<string>) => Priced;
};
const PriceCtx = createContext<PriceCtxType>(null!);
const usePrice = () => useContext(PriceCtx);

function buildCtx(config: PricingConfig, phone: string, email: string): PriceCtxType {
  const order = config.plans.map((p) => p.id);
  const plans = {} as Record<PlanKey, FullPlan>;
  config.plans.forEach((p) => { plans[p.id] = { ...p, ...PLAN_META[p.id] }; });
  const addons = config.addons.map((a) => ({ ...a, icon: ADDON_ICONS[a.id] || Database }));
  const features = config.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] || Activity }));
  const addonPrice = (plan: PlanKey) => config.addonPriceByPlan[plan] ?? 0;
  // Բանաձևը՝ @/lib/pricing-ում (նույնն է ադմինկայի ավտոմատ հաշվարկի համար)
  const compute = (planKey: PlanKey, employeeCount: number, sel: Set<string>): Priced => computePrice(config, planKey, employeeCount, sel)!;
  return { order, plans, addons, features, guarantees: config.guarantees, serverNote: config.serverNote, extraPrice: config.extraEmployeePrice,
           L: config.labels, phone, email, addonPrice, compute };
}

// Պատվերի ամփոփում՝ ընդհանուր հիվանդանոցների և կլինիկաների համար (PDF + հայտի նամակ)
type OrderSummary = {
  planName: string;
  basePrice: number;
  employees?: number;                                     // միայն հիվանդանոցներ
  extra?: { count: number; unit: number; cost: number };  // լրացուցիչ օգտատերեր (հիվանդանոցներ)
  addons: { label: string; price: number }[];
  subtotal: number; total: number;
};

function generatePricingPDF(ctx: PriceCtxType, order: OrderSummary) {
  const doc = new jsPDF();
  doc.setFontSize(20); doc.text("HospIT - Pricing Proposal", 105, 20, { align: "center" });
  doc.setFontSize(14); doc.text(`Selected Plan: ${order.planName}`, 20, 40);
  doc.setFontSize(10); let y = 55;
  doc.text(`Base Package: ${formatPrice(order.basePrice)} AMD`, 20, y); y += 8;
  if (order.employees !== undefined) { doc.text(`Number of Employees: ${order.employees}`, 20, y); y += 6; }
  if (order.extra && order.extra.count > 0) { doc.text(`Extra Employees (${order.extra.count} x ${order.extra.unit}): +${formatPrice(order.extra.cost)} AMD`, 20, y); y += 6; }
  if (order.addons.length > 0) {
    y += 5; doc.setFontSize(12); doc.text("Additional Modules:", 20, y); y += 8; doc.setFontSize(10);
    order.addons.forEach((a) => { doc.text(`- ${a.label}: ${formatPrice(a.price)} AMD`, 25, y); y += 6; });
  }
  y += 5; doc.text(`Subtotal: ${formatPrice(order.subtotal)} AMD`, 20, y); y += 8;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text(`TOTAL: ${formatPrice(order.total)} AMD`, 20, y);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Contact: " + ctx.phone, 20, 280); doc.text("Email: " + ctx.email, 20, 286);
  return doc;
}

const cardStyle: React.CSSProperties = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-md)" };
const innerBox: React.CSSProperties = { background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 14 };
function tint(color: string, pct: number) { return `color-mix(in oklch, ${color} ${pct}%, transparent)`; }

// ═══════════════════════ PLAN SELECTOR ═══════════════════════
function PlanSelector({ onSelect }: { onSelect: (p: PlanKey) => void }) {
  const { order, plans, features, L } = usePrice();
  return (
    <section style={{ paddingTop: 140, paddingBottom: 100 }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="eyebrow reveal shown" style={{ marginBottom: 16 }}>{L.eyebrow}</div>
          <h1 className="section-title reveal shown" style={{ margin: "0 auto", maxWidth: 760 }}>{L.title}</h1>
        </div>
        <div className="r-pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, alignItems: "stretch" }}>
          {order.map((key) => {
            const cfg = plans[key]; const Icon = cfg.icon;
            return (
              <div key={key} onClick={() => onSelect(key)} className="hp-plan-card"
                style={{ ...cardStyle, padding: 32, display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={24} strokeWidth={2} color="#fff" /></div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1.25, overflowWrap: "break-word" }}>{cfg.name}</h3>
                    <p style={{ fontSize: 14, fontWeight: 600, color: cfg.accent, marginTop: 2 }}>{cfg.shortLabel}</p>
                  </div>
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--text-2)", marginBottom: 20, minHeight: 68 }}>{cfg.description}</p>
                <div style={{ ...innerBox, padding: "18px 20px", marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{L.monthlyFrom}</span>
                    <span style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>{formatPrice(cfg.basePrice)}</span>
                    <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-2)" }}>֏</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{L.includedPrefix} {cfg.includedEmployees} {L.includedSuffix}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24, flex: 1 }}>
                  {features.map((f) => { const FIcon = f.icon; return (
                    <div key={f.label}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}><FIcon size={18} strokeWidth={2} color={cfg.accent} /><span style={{ fontSize: 14.5 }}>{f.label}</span></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 4 }}>
                        {f.items.map((it) => (<div key={it} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: "var(--text-2)" }}><Check size={15} strokeWidth={2.5} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} /><span>{it}</span></div>))}
                      </div>
                    </div>
                  ); })}
                </div>
                <button className="btn" style={{ width: "100%", justifyContent: "center", gap: 8, background: cfg.accent, color: "#fff", padding: "14px 24px", fontSize: 15, fontWeight: 700 }}>{L.choosePlan} <ArrowRight size={18} strokeWidth={2} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════ PLAN CUSTOMIZER ═══════════════════════
function PlanCustomizer({ plan, onBack, onPlanSwitch, previousPlan }: { plan: PlanKey; onBack: () => void; onPlanSwitch?: (p: PlanKey) => void; previousPlan?: PlanKey | null }) {
  const ctx = usePrice();
  const cfg = ctx.plans[plan]; const PlanIcon = cfg.icon;
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [employeeCount, setEmployeeCount] = useState(cfg.includedEmployees);
  const [showDialog, setShowDialog] = useState(false);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const current = ctx.compute(plan, employeeCount, selectedAddOns);

  type Reason = "cheaper-with-same-coverage" | "cheaper-with-more-coverage" | "same-price-more-coverage" | "slightly-more-but-better-value" | "removes-extra-fees";
  let suggestion: { key: PlanKey; data: Priced; savings: number; reason: Reason; extraCapacity: number } | null = null;
  if (employeeCount > cfg.includedEmployees || selectedAddOns.size > 0) {
    for (const otherKey of ctx.order.filter((k) => k !== plan)) {
      const otherCfg = ctx.plans[otherKey]; const otherPrice = ctx.compute(otherKey, employeeCount, selectedAddOns);
      const priceDiff = current.finalPrice - otherPrice.finalPrice; const capacityDiff = otherCfg.includedEmployees - cfg.includedEmployees;
      let reason: Reason | null = null; let ok = false;
      if (priceDiff > 0 && capacityDiff >= 0) { reason = "cheaper-with-more-coverage"; ok = true; }
      else if (priceDiff > 0 && otherCfg.includedEmployees >= employeeCount) { reason = "cheaper-with-same-coverage"; ok = true; }
      else if (Math.abs(priceDiff) < 10000 && capacityDiff > 100) { reason = "same-price-more-coverage"; ok = true; }
      else if (current.extraEmployees > 0 && otherPrice.extraEmployees === 0 && priceDiff > -50000) { reason = "removes-extra-fees"; ok = true; }
      else if (priceDiff < 0 && priceDiff > -100000 && capacityDiff > 200 && otherPrice.extraEmployees === 0) { reason = "slightly-more-but-better-value"; ok = true; }
      if (ok && reason) { if (!suggestion || priceDiff > suggestion.savings) suggestion = { key: otherKey, data: otherPrice, savings: priceDiff, reason, extraCapacity: capacityDiff }; }
    }
  }

  const toggleAddOn = (id: string) => setSelectedAddOns((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const chip = (bg: string, color: string, text: string) => (<span style={{ padding: "6px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: bg, color }}>{text}</span>);

  return (
    <section style={{ paddingTop: 120, paddingBottom: 100 }}>
      <div id="hospit-customizer" className="container">
        <button onClick={onBack} style={{ marginBottom: 24, background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", fontFamily: "inherit", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
          <ArrowRight size={16} strokeWidth={2} style={{ transform: "rotate(180deg)" }} /> {ctx.L.back}
        </button>
        <div className="r-cust-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
          {/* Plan info */}
          <div id="hospit-snap-plan" style={{ ...cardStyle, padding: 32, order: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: cfg.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><PlanIcon size={30} strokeWidth={2} color="#fff" /></div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: "clamp(17px,2.4vw,28px)", fontWeight: 800, color: "var(--text)", overflowWrap: "break-word", lineHeight: 1.25 }}>{cfg.name}</h2>
                <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 4 }}>{ctx.L.basePackagePrefix} <span style={{ whiteSpace: "nowrap" }}>{formatPrice(cfg.basePrice)} ֏</span></p>
              </div>
            </div>
            <div className="r-cust-feats" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {ctx.features.map((f) => { const Icon = f.icon; return (
                <div key={f.label} style={{ ...innerBox, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, color: "var(--text)" }}><Icon size={18} strokeWidth={2} color={cfg.accent} /><span style={{ fontSize: 14.5 }}>{f.label}</span></div>
                  <div style={{ marginTop: 8, paddingLeft: 4, display: "flex", flexDirection: "column", gap: 5 }}>
                    {f.items.map((it) => (<div key={it} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-2)" }}><Check size={14} strokeWidth={2.5} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} />{it}</div>))}
                  </div>
                </div>
              ); })}
            </div>
            <div style={{ ...innerBox, borderWidth: 2, padding: 24, marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{ctx.L.employeeCount}</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: cfg.accent }}>{employeeCount}</span>
              </div>
              <input type="range" min={1} max={cfg.sliderMax} value={employeeCount} onChange={(e) => setEmployeeCount(Number(e.target.value))} style={{ width: "100%", accentColor: cfg.accent, cursor: "pointer", height: 8 }} />
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                {employeeCount <= cfg.includedEmployees ? chip(tint(GREEN, 15), GREEN, `${ctx.L.includedChip} ${cfg.includedEmployees} ${ctx.L.includedSuffix}`) : chip("var(--bg-card)", "var(--text-2)", `Ներառված՝ մինչև ${cfg.includedEmployees} օգտատեր`)}
                {current.extraEmployees > 0 && chip(tint(cfg.accent, 15), cfg.accent, `+${current.extraEmployees} ${ctx.L.extraChip} × ${ctx.extraPrice} ֏ = ${formatPrice(current.employeeCost)} ֏`)}
              </div>
            </div>
          </div>
          {/* Price summary */}
          <div style={{ ...cardStyle, padding: 24, order: 2, display: "flex", flexDirection: "column", position: "sticky", top: 88 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>{ctx.L.summaryTitle}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}><span>{ctx.L.basePackage}</span><span style={{ fontWeight: 600 }}>{formatPrice(current.basePrice)} ֏</span></div>
              {current.extraEmployees > 0 && (<div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}><span>{ctx.L.extraUsers} ({current.extraEmployees})</span><span style={{ fontWeight: 600 }}>+{formatPrice(current.employeeCost)} ֏</span></div>)}
              {selectedAddOns.size > 0 && (<>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {Array.from(selectedAddOns).map((id) => { const a = ctx.addons.find((x) => x.id === id); if (!a) return null; return (<div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--text-2)", gap: 12 }}><span>{a.label}</span><span style={{ whiteSpace: "nowrap" }}>+{formatPrice(ctx.addonPrice(plan))} ֏</span></div>); })}
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", justifyContent: "space-between", color: "var(--text)" }}><span>{ctx.L.subtotal}</span><span style={{ fontWeight: 600 }}>{formatPrice(current.subtotal)} ֏</span></div>
              </>)}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ borderTop: "2px solid var(--border-strong)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{ctx.L.total}</span>
                <div style={{ textAlign: "right" }}><span style={{ fontSize: 28, fontWeight: 800, color: "var(--text)" }}>{formatPrice(current.finalPrice)}</span><span style={{ color: "var(--text-muted)", marginLeft: 4 }}>֏</span></div>
              </div>
              <button onClick={() => setShowDialog(true)} className="btn btn-primary" style={{ marginTop: 24, width: "100%", justifyContent: "center", gap: 8, padding: "15px 24px", fontSize: 16, fontWeight: 700 }}>{ctx.L.orderNow} <ArrowRight size={18} strokeWidth={2} /></button>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "var(--text-muted)" }}>
                {ctx.guarantees.map((g) => (<div key={g} style={{ display: "flex", alignItems: "center", gap: 8 }}><Check size={16} strokeWidth={2.5} color={GREEN} />{g}</div>))}
              </div>
            </div>
          </div>
          {/* Add-ons */}
          <div id="hospit-snap-addons" style={{ ...cardStyle, padding: 32, order: 3 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 20 }}>
              <h3 style={{ fontSize: "clamp(19px,2.2vw,24px)", fontWeight: 700, color: "var(--text)" }}>{ctx.L.addonsTitle}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ctx.addons.map((a) => { const isSel = selectedAddOns.has(a.id); const AIcon = a.icon; return (
                <label key={a.id} onClick={() => toggleAddOn(a.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 14, cursor: "pointer", border: `2px solid ${isSel ? cfg.accent : "var(--border)"}`, background: isSel ? tint(cfg.accent, 8) : "transparent", transition: "all .18s ease" }}>
                  <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, border: `2px solid ${isSel ? cfg.accent : "var(--border-strong)"}`, background: isSel ? cfg.accent : "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>{isSel && <Check size={18} strokeWidth={3} color="#fff" />}</span>
                  <span className="hp-addon-inner" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minWidth: 0 }}>
                    <span className="hp-addon-left" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, background: isSel ? "var(--bg-card)" : "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center" }}><AIcon size={20} strokeWidth={2} /></span>
                      <span style={{ fontSize: 14.5, fontWeight: 500, color: isSel ? "var(--text)" : "var(--text-2)", minWidth: 0, overflowWrap: "break-word" }}>{a.label}</span>
                    </span>
                    <span style={{ fontSize: 14.5, fontWeight: 700, whiteSpace: "nowrap", color: isSel ? cfg.accent : "var(--text-2)" }}>+{formatPrice(ctx.addonPrice(plan))} ֏</span>
                  </span>
                </label>
              ); })}
            </div>
            <p style={{ marginTop: 20, fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>{ctx.serverNote}</p>
          </div>
          {/* Smart suggestion */}
          {suggestion && (
            <div style={{ order: 4 }}>
              <div style={{ ...cardStyle, border: `2px solid ${tint(GREEN, 45)}`, background: tint(GREEN, 6), padding: 24, height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={20} strokeWidth={2.5} color="#fff" /></div>
                  <div><h4 style={{ fontWeight: 700, color: "var(--text)" }}>{ctx.L.smartTitle}</h4><p style={{ fontSize: 12.5, color: GREEN }}>{ctx.L.smartSub}</p></div>
                </div>
                <div style={{ ...innerBox, background: "var(--bg-card)", padding: 16, marginBottom: 16 }}>
                  <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.6, marginBottom: 12 }}><strong style={{ color: GREEN }}>{employeeCount} օգտատերերի</strong> համար <strong style={{ color: ctx.plans[suggestion.key].accent }}>{ctx.plans[suggestion.key].name}</strong>-ը ավելի ձեռնտու ընտրություն է։</p>
                  <div style={{ background: tint(GREEN, 10), borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{ctx.L.smartWhy}</p>
                    <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
                      {suggestion.reason === "cheaper-with-more-coverage" && <>Ավելի էժան է <strong>{formatPrice(suggestion.savings)} ֏-ով</strong> և ներառում է մինչև <strong>{ctx.plans[suggestion.key].includedEmployees} օգտատեր</strong> (ձեր ընթացիկ փաթեթում՝ {cfg.includedEmployees})</>}
                      {suggestion.reason === "cheaper-with-same-coverage" && <>Նույն ծածկույթով ավելի էժան է <strong>{formatPrice(suggestion.savings)} ֏-ով</strong></>}
                      {suggestion.reason === "same-price-more-coverage" && <>Գրեթե նույն գնով ստանում եք <strong>{suggestion.extraCapacity} լրացուցիչ օգտատեր</strong> ներառված</>}
                      {suggestion.reason === "removes-extra-fees" && <>Վերացնում է լրացուցիչ օգտատերերի վճարը՝ {employeeCount} օգտատերը լրիվ ներառված է բազային փաթեթում</>}
                      {suggestion.reason === "slightly-more-but-better-value" && <>Միայն <strong>{formatPrice(-suggestion.savings)} ֏ ավելի</strong>, բայց ներառում է մինչև <strong>{ctx.plans[suggestion.key].includedEmployees} օգտատեր</strong> առանց լրացուցիչ վճարների</>}
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                    <div style={{ background: "var(--bg-alt)", borderRadius: 10, padding: 8 }}><p style={{ color: "var(--text-muted)", marginBottom: 2 }}>{ctx.L.currentPrice}</p><p style={{ fontWeight: 700, color: "var(--text)" }}>{formatPrice(current.finalPrice)} ֏</p></div>
                    <div style={{ background: tint(GREEN, 14), borderRadius: 10, padding: 8 }}><p style={{ color: GREEN, marginBottom: 2 }}>{ctx.L.newPrice}</p><p style={{ fontWeight: 700, color: GREEN }}>{formatPrice(suggestion.data.finalPrice)} ֏</p>{suggestion.savings > 0 ? <p style={{ fontSize: 10.5, color: GREEN, marginTop: 2 }}>↓ {ctx.L.saveText} {formatPrice(suggestion.savings)} ֏</p> : <p style={{ fontSize: 10.5, color: GREEN, marginTop: 2 }}>{ctx.L.noExtraFees}</p>}</div>
                  </div>
                </div>
                {onPlanSwitch && (<button onClick={() => onPlanSwitch(suggestion!.key)} className="btn" style={{ width: "100%", justifyContent: "center", gap: 8, background: GREEN, color: "#fff", padding: "13px 20px", fontWeight: 700, marginTop: "auto" }}><Sparkles size={18} strokeWidth={2} />{ctx.L.switchTo} {ctx.plans[suggestion.key].name}<ArrowRight size={18} strokeWidth={2.5} /></button>)}
              </div>
            </div>
          )}
          {previousPlan && onPlanSwitch && (<div style={{ order: 5 }}><button onClick={() => onPlanSwitch(previousPlan)} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", gap: 8, padding: "12px 20px", fontSize: 14 }}><RefreshCw size={16} strokeWidth={2.5} />{ctx.L.backTo} {ctx.plans[previousPlan].name}</button></div>)}
        </div>
      </div>
      {showDialog && <ContactDialog onClose={() => setShowDialog(false)} order={{
        planName: cfg.name, basePrice: current.basePrice, employees: employeeCount,
        extra: { count: current.extraEmployees, unit: ctx.extraPrice, cost: current.employeeCost },
        addons: Array.from(selectedAddOns).flatMap((id) => { const a = ctx.addons.find((x) => x.id === id); return a ? [{ label: a.label, price: ctx.addonPrice(plan) }] : []; }),
        subtotal: current.subtotal, total: current.finalPrice,
      }} />}
    </section>
  );
}

// ═══════════════════════ CONTACT DIALOG ═══════════════════════
function ContactDialog({ onClose, order }: { onClose: () => void; order: OrderSummary }) {
  const ctx = usePrice();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const planName = order.planName;
  useEffect(() => { const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = ctx.L.required; if (!form.lastName.trim()) e.lastName = ctx.L.required;
    if (!form.phone.trim()) e.phone = ctx.L.required;
    if (!form.email.trim()) e.email = ctx.L.required; else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = ctx.L.badFormat;
    if (!form.company.trim()) e.company = ctx.L.required;
    setErrors(e); return Object.keys(e).length === 0;
  };
  const captureScreenshot = async (): Promise<Blob | null> => {
    const planEl = document.getElementById("hospit-snap-plan"); const addonsEl = document.getElementById("hospit-snap-addons"); if (!planEl || !addonsEl) return null;
    const bg = getComputedStyle(document.body).backgroundColor || "#f8fafc";
    const opts = { backgroundColor: bg, pixelRatio: 2, cacheBust: true, filter: (node: Node) => !(node instanceof HTMLElement && node.getAttribute("role") === "dialog") };
    try {
      const [planUrl, addonsUrl] = await Promise.all([toPng(planEl, opts), toPng(addonsEl, opts)]);
      const [imgA, imgB] = await Promise.all([loadImage(planUrl), loadImage(addonsUrl)]);
      const gap = 32; const width = Math.max(imgA.width, imgB.width); const height = imgA.height + imgB.height + gap;
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const c = canvas.getContext("2d"); if (!c) return null;
      c.fillStyle = bg; c.fillRect(0, 0, width, height); c.drawImage(imgA, (width - imgA.width) / 2, 0); c.drawImage(imgB, (width - imgB.width) / 2, imgA.height + gap);
      return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
    } catch (err) { console.error("Screenshot failed", err); return null; }
  };
  const submitToGoogleForm = () => {
    const formId = "1FAIpQLSdfoGZvKkPPGqXqZeSGZWmGeDpbCorzSsc41tN05UrERKVG-w";
    const params = new URLSearchParams();
    params.append("entry.1100791368", form.firstName); params.append("entry.1691900881", form.lastName); params.append("entry.508985036", form.phone); params.append("entry.1123501175", form.email); params.append("entry.1854352082", form.company);
    return fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString() }).catch((err) => console.error("Google Form submit failed", err));
  };
  const submitToFormsubmit = async (screenshotBlob: Blob | null, pdfBlob: Blob | null) => {
    const fd = new FormData();
    fd.append("_subject", `HospIT նոր հայտ — ${planName} — ${form.company}`); fd.append("_captcha", "false"); fd.append("_template", "table");
    fd.append("name", `${form.firstName} ${form.lastName}`); fd.append("first_name", form.firstName); fd.append("last_name", form.lastName);
    fd.append("phone", form.phone); fd.append("email", form.email); fd.append("company", form.company); fd.append("plan", planName);
    fd.append("base_price", `${formatPrice(order.basePrice)} AMD`);
    if (order.employees !== undefined) fd.append("employees", String(order.employees));
    if (order.extra && order.extra.count > 0) fd.append("extra_employees", `${order.extra.count} × ${order.extra.unit} = ${formatPrice(order.extra.cost)} AMD`);
    if (order.addons.length > 0) fd.append("addons", order.addons.map((a) => `${a.label} (+${formatPrice(a.price)} AMD)`).join(", "));
    fd.append("subtotal", `${formatPrice(order.subtotal)} AMD`);
    fd.append("total", `${formatPrice(order.total)} AMD`);
    const safeCompany = form.company.replace(/[^a-zA-Z0-9_-]/g, "_") || "client";
    if (screenshotBlob) fd.append("attachment", new File([screenshotBlob], `HospIT_Package_${safeCompany}.png`, { type: "image/png" }));
    if (pdfBlob) fd.append("attachment", new File([pdfBlob], `HospIT_Pricing_${safeCompany}.pdf`, { type: "application/pdf" }));
    try { await fetch("https://formsubmit.co/el/dutamu", { method: "POST", mode: "no-cors", body: fd }); } catch (err) { console.error("Formsubmit failed", err); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!validate() || submitting) return; setSubmitting(true);
    const pdfBlob: Blob | null = generatePricingPDF(ctx, order).output("blob") ?? null;
    const screenshotBlob = await captureScreenshot();
    await Promise.all([submitToFormsubmit(screenshotBlob, pdfBlob), submitToGoogleForm()]);
    setSubmitting(false); onClose();
    setTimeout(() => { alert(ctx.L.successMsg); }, 200);
  };
  const field = (key: keyof typeof form, label: string, type = "text", ph = "") => (
    <div>
      <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>{label} <span style={{ color: ROSE }}>*</span></label>
      <input className="input-field" type={type} placeholder={ph} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={errors[key] ? { borderColor: ROSE } : undefined} />
      {errors[key] && <p style={{ marginTop: 4, fontSize: 12, color: ROSE }}>{errors[key]}</p>}
    </div>
  );
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(6,12,22,0.6)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", width: "min(520px,100%)", maxHeight: "90vh", overflowY: "auto", ...cardStyle, borderRadius: 24, padding: "clamp(24px,4vw,36px)", boxShadow: "var(--shadow-lg)" }}>
        <button onClick={onClose} aria-label="X" style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", border: "none", background: "var(--bg-alt)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} strokeWidth={2} /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: 16, background: GREEN, alignItems: "center", justifyContent: "center" }}><Mail size={28} strokeWidth={2} color="#fff" /></div>
          <h3 style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{ctx.L.formTitle}</h3>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-2)" }}>{ctx.L.formPlan} <strong>{planName}</strong></p>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }} noValidate>
          <div className="r-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{field("firstName", ctx.L.fFirstName)}{field("lastName", ctx.L.fLastName)}</div>
          {field("phone", ctx.L.fPhone, "tel", "+374 ...")}
          {field("email", ctx.L.fEmail, "email", "example@mail.com")}
          {field("company", ctx.L.fCompany)}
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", background: "var(--bg-alt)", borderRadius: 10, padding: 12, border: "1px solid var(--border)", lineHeight: 1.5 }}>{ctx.L.formNote}</p>
          <button type="submit" disabled={submitting} className="btn" style={{ width: "100%", justifyContent: "center", gap: 8, background: GREEN, color: "#fff", padding: "14px 24px", fontSize: 16, fontWeight: 700, opacity: submitting ? 0.6 : 1 }}><Mail size={18} strokeWidth={2} />{submitting ? ctx.L.submitting : ctx.L.submit}{!submitting && <ArrowRight size={18} strokeWidth={2} />}</button>
          <a href={`tel:${ctx.phone.replace(/\s/g, "")}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, color: "var(--text-2)", textDecoration: "none" }}><Phone size={16} strokeWidth={2} />{ctx.L.orCall} {ctx.phone}</a>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════ ROOT ═══════════════════════
export default function PricingCalc({ config, phone, email }: { config: PricingConfig; phone: string; email: string }) {
  const ctx = useMemo(() => buildCtx(config, phone, email), [config, phone, email]);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [previousPlan, setPreviousPlan] = useState<PlanKey | null>(null);
  return (
    <PriceCtx.Provider value={ctx}>
      <div className="page-enter">
        {!selectedPlan ? (
          <PlanSelector onSelect={(p) => { setSelectedPlan(p); setPreviousPlan(null); }} />
        ) : (
          <PlanCustomizer key={selectedPlan} plan={selectedPlan} previousPlan={previousPlan}
            onBack={() => { setSelectedPlan(null); setPreviousPlan(null); }}
            onPlanSwitch={(np) => { setPreviousPlan(selectedPlan); setSelectedPlan(np); }} />
        )}
      </div>
    </PriceCtx.Provider>
  );
}
