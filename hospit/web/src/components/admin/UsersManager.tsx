"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, useToast } from "./fields";
import { useAdminI18n } from "./i18n";
import { createAccount, updateAccount, setAccountPassword, deleteAccount, type AccountPatch } from "@/app/admin/users-actions";
import { computePrice } from "@/lib/pricing";
import type { Account, AppRole, PricingConfig, SubStatus, Subscription } from "@/lib/types";

type At = (hy: string, en?: string) => string;
type Filter = "all" | "admin" | "client" | "pending" | "active";

const STATUS: { id: SubStatus; hy: string; en: string; cls: string }[] = [
  { id: "pending", hy: "Սպասում է ակտիվացման", en: "Awaiting activation", cls: "adm-badge-new" },
  { id: "active", hy: "Ակտիվ", en: "Active", cls: "adm-badge-on" },
  { id: "suspended", hy: "Կասեցված", en: "Suspended", cls: "adm-badge-danger" },
  { id: "expired", hy: "Ժամկետանց", en: "Expired", cls: "adm-badge-off" },
];

function errorText(code: string, at: At): string {
  const map: Record<string, [string, string]> = {
    self_demote: ["Չեք կարող ինքներդ Ձեզնից հանել ադմինի իրավասությունը։", "You cannot remove your own admin rights."],
    last_admin: ["Համակարգում պետք է մնա առնվազն մեկ ադմին։", "At least one admin must remain."],
    self_delete: ["Չեք կարող ջնջել Ձեր սեփական հաշիվը։", "You cannot delete your own account."],
    email_exists: ["Այս էլ. փոստով հաշիվ արդեն կա։", "An account with this email already exists."],
    bad_email: ["Սխալ էլ. փոստ։", "Invalid email."],
    pw_short: ["Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։", "Password must be at least 8 characters."],
    pw_long: ["Գաղտնաբառը շատ երկար է։", "Password is too long."],
    not_found: ["Օգտատերը չի գտնվել։", "User not found."],
  };
  const m = map[code];
  return m ? at(m[0], m[1]) : code;
}

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB");
}

function initials(a: Account) {
  const src = a.full_name || a.email;
  return src.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
}

function RoleSwitch({ value, onChange, disabled, at }: { value: AppRole; onChange: (r: AppRole) => void; disabled?: boolean; at: At }) {
  const opts: { id: AppRole; hy: string; en: string; hint: [string, string] }[] = [
    { id: "client", hy: "Սովորական օգտատեր", en: "Regular user", hint: ["Տեսնում է միայն իր անձնական էջը", "Sees only their personal page"] },
    { id: "admin", hy: "Ադմինիստրատոր", en: "Administrator", hint: ["Լիարժեք մուտք ադմինկա", "Full admin panel access"] },
  ];
  return (
    <div className="usr-roles" role="radiogroup">
      {opts.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} disabled={disabled}
          className={`usr-role${value === o.id ? " on" : ""}${o.id === "admin" ? " is-admin" : ""}`}
          onClick={() => onChange(o.id)}>
          <b>{at(o.hy, o.en)}</b>
          <span>{at(o.hint[0], o.hint[1])}</span>
        </button>
      ))}
    </div>
  );
}

function UserEditor({ account, pricing, isMe, at, onDone }: {
  account: Account; pricing: PricingConfig; isMe: boolean; at: At; onDone: (msg: string, close?: boolean) => void;
}) {
  const router = useRouter();
  const [f, setF] = useState<AccountPatch>({
    role: account.role, full_name: account.full_name, phone: account.phone,
    institution: account.institution, subscription: { ...account.subscription },
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [newPw, setNewPw] = useState("");

  const setSub = <K extends keyof Subscription>(k: K, v: Subscription[K]) => setF((x) => ({ ...x, subscription: { ...x.subscription, [k]: v } }));
  const sub = f.subscription;
  const calc = sub.plan ? computePrice(pricing, sub.plan, sub.employees, sub.addons) : null;
  const planCfg = pricing.plans.find((p) => p.id === sub.plan);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string, close = false) {
    setBusy(true); setErr("");
    try {
      const res = await fn();
      if (!res.ok) { setErr(errorText(res.error || "", at)); return false; }
      onDone(okMsg, close);
      router.refresh();
      return true;
    } catch (e: any) {
      setErr(e?.message || "error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function pickPlan(plan: Subscription["plan"]) {
    const p = pricing.plans.find((x) => x.id === plan);
    setF((x) => ({
      ...x,
      subscription: {
        ...x.subscription, plan,
        // նոր փաթեթ ընտրելիս՝ ներառված օգտատերերի քանակը որպես սկզբնական արժեք
        employees: x.subscription.employees || p?.includedEmployees || 0,
      },
    }));
  }

  return (
    <div className="usr-editor">
      <div className="usr-sec">
        <h4>{at("Իրավասություն", "Access level")}</h4>
        <RoleSwitch value={f.role} onChange={(r) => setF((x) => ({ ...x, role: r }))} disabled={isMe} at={at} />
        {isMe && <p className="usr-hint">{at("Սա Ձեր հաշիվն է. Ձեր իրավասությունը չեք կարող փոխել։", "This is your account; you cannot change your own access level.")}</p>}
      </div>

      <div className="usr-sec">
        <h4>{at("Անձնական տվյալներ", "Personal details")}</h4>
        <div className="adm-grid adm-cols3">
          <TextInput label={at("Անուն Ազգանուն", "Full name")} value={f.full_name} onChange={(v) => setF((x) => ({ ...x, full_name: v }))} />
          <TextInput label={at("Հեռախոս", "Phone")} value={f.phone} onChange={(v) => setF((x) => ({ ...x, phone: v }))} />
          <TextInput label={at("Բուժհաստատություն", "Institution")} value={f.institution} onChange={(v) => setF((x) => ({ ...x, institution: v }))} />
        </div>
      </div>

      <div className="usr-sec">
        <h4>{at("Փաթեթ և պայմաններ", "Plan & terms")}</h4>
        <p className="usr-hint" style={{ marginTop: -6, marginBottom: 14 }}>{at("Այս տվյալները օգտատերը տեսնում է իր անձնական էջում։", "The user sees these details on their personal page.")}</p>

        <div className="adm-grid adm-cols2">
          <div className="adm-field">
            <label className="adm-label">{at("Կարգավիճակ", "Status")}</label>
            <select className="adm-select" value={sub.status} onChange={(e) => setSub("status", e.target.value as SubStatus)}>
              {STATUS.map((s) => <option key={s.id} value={s.id}>{at(s.hy, s.en)}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">{at("Փաթեթ", "Plan")}</label>
            <select className="adm-select" value={sub.plan} onChange={(e) => pickPlan(e.target.value as Subscription["plan"])}>
              <option value="">{at("— Դեռ ընտրված չէ —", "— Not selected —")}</option>
              {pricing.plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {sub.plan && (
          <>
            <div className="adm-grid adm-cols3">
              <div className="adm-field">
                <label className="adm-label">{at("Օգտատերերի քանակ", "Number of users")}</label>
                <input className="adm-input" type="number" min={0} value={sub.employees} onChange={(e) => setSub("employees", Math.max(0, parseInt(e.target.value, 10) || 0))} />
                {planCfg && <div className="usr-hint">{at(`Ներառված է՝ ${planCfg.includedEmployees}`, `Included: ${planCfg.includedEmployees}`)}</div>}
              </div>
              <div className="adm-field">
                <label className="adm-label">{at("Սկիզբ", "Start date")}</label>
                <input className="adm-input" type="date" value={sub.start_date} onChange={(e) => setSub("start_date", e.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">{at("Ավարտ", "End date")}</label>
                <input className="adm-input" type="date" value={sub.end_date} min={sub.start_date || undefined} onChange={(e) => setSub("end_date", e.target.value)} />
                <div className="usr-hint">{at("Դատարկ՝ անժամկետ", "Empty = open-ended")}</div>
              </div>
            </div>

            <div className="adm-field">
              <label className="adm-label">{at("Լրացուցիչ մոդուլներ", "Additional modules")}</label>
              <div className="usr-mods">
                {pricing.addons.map((a) => {
                  const on = sub.addons.includes(a.id);
                  return (
                    <label key={a.id} className={`usr-mod${on ? " on" : ""}`}>
                      <input type="checkbox" checked={on} onChange={() => setSub("addons", on ? sub.addons.filter((x) => x !== a.id) : [...sub.addons, a.id])} />
                      {a.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="adm-field">
              <label className="adm-label">{at("Ամսական վճար (֏)", "Monthly fee (֏)")}</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input className="adm-input" style={{ flex: "1 1 180px" }} type="number" min={0} step={1000} value={sub.monthly_price}
                  onChange={(e) => setSub("monthly_price", Math.max(0, parseInt(e.target.value, 10) || 0))} />
                {calc && (
                  <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setSub("monthly_price", calc.finalPrice)}>
                    {at("Հաշվել ըստ գնացուցակի", "Use price list")}: {calc.finalPrice.toLocaleString("en-US")} ֏
                  </button>
                )}
              </div>
            </div>

            <TextInput label={at("Վճարման պայմաններ", "Payment terms")} value={sub.payment_terms} onChange={(v) => setSub("payment_terms", v)}
              help={at("Օր.՝ Ամսական, մինչև ամսի 5-ը, անկանխիկ", "e.g. Monthly, by the 5th, bank transfer")} />
            <div className="adm-field">
              <label className="adm-label">{at("Պայմանագրի պայմաններ", "Contract terms")}</label>
              <textarea className="adm-textarea" style={{ minHeight: 110 }} value={sub.terms} onChange={(e) => setSub("terms", e.target.value)} />
            </div>
          </>
        )}
      </div>

      {err && <div role="alert" className="usr-err">{err}</div>}

      <div className="usr-actions">
        <button type="button" className="adm-btn adm-btn-primary" disabled={busy}
          onClick={() => run(() => updateAccount(account.id, f), at("Պահպանված է ✓", "Saved ✓"))}>
          {busy ? "…" : at("Պահպանել", "Save")}
        </button>
      </div>

      <div className="usr-sec usr-danger-zone">
        <h4>{at("Մուտքի տվյալներ", "Sign-in")}</h4>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="adm-field" style={{ flex: "1 1 220px", marginBottom: 0 }}>
            <label className="adm-label">{at("Նոր գաղտնաբառ", "New password")}</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="adm-input" type="text" autoComplete="off" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={at("առնվազն 8 նիշ", "at least 8 characters")} />
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setNewPw(genPassword())} title={at("Ստեղծել", "Generate")}>⟳</button>
            </div>
          </div>
          <button type="button" className="adm-btn adm-btn-ghost" disabled={busy || !newPw}
            onClick={async () => { if (await run(() => setAccountPassword(account.id, newPw), at("Գաղտնաբառը փոխված է ✓", "Password changed ✓"))) setNewPw(""); }}>
            {at("Սահմանել գաղտնաբառը", "Set password")}
          </button>
        </div>
        <p className="usr-hint">{at("Նոր գաղտնաբառը հաղորդեք օգտատիրոջը անվտանգ ճանապարհով։", "Share the new password with the user through a secure channel.")}</p>

        {!isMe && (
          <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" style={{ marginTop: 10 }} disabled={busy}
            onClick={() => {
              if (!confirm(at(`Ջնջե՞լ ${account.email} հաշիվը։ Գործողությունը անդառնալի է։`, `Delete ${account.email}? This cannot be undone.`))) return;
              run(() => deleteAccount(account.id), at("Հաշիվը ջնջված է", "Account deleted"), true);
            }}>
            {at("Ջնջել հաշիվը", "Delete account")}
          </button>
        )}
      </div>
    </div>
  );
}

function CreateUser({ at, onDone, onCancel }: { at: At; onDone: (msg: string) => void; onCancel: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({ email: "", password: genPassword(), role: "client" as AppRole, full_name: "", phone: "", institution: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await createAccount(f);
      if (!res.ok) { setErr(errorText(res.error, at)); return; }
      onDone(at(`Հաշիվը ստեղծված է։ Մուտք՝ ${f.email} / ${f.password}`, `Account created. Sign-in: ${f.email} / ${f.password}`));
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="adm-card usr-create" onSubmit={submit}>
      <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Նոր օգտատեր", "New user")}</h3>
      <div className="usr-sec" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
        <RoleSwitch value={f.role} onChange={(r) => setF((x) => ({ ...x, role: r }))} at={at} />
      </div>
      <div className="adm-grid adm-cols2">
        <TextInput label={at("Էլ. փոստ (մուտքանուն)", "Email (login)")} type="email" value={f.email} onChange={(v) => set("email", v)} />
        <div className="adm-field">
          <label className="adm-label">{at("Գաղտնաբառ", "Password")}</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input className="adm-input" type="text" autoComplete="off" value={f.password} onChange={(e) => set("password", e.target.value)} />
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => set("password", genPassword())} title={at("Ստեղծել", "Generate")}>⟳</button>
          </div>
        </div>
      </div>
      <div className="adm-grid adm-cols3">
        <TextInput label={at("Անուն Ազգանուն", "Full name")} value={f.full_name} onChange={(v) => set("full_name", v)} />
        <TextInput label={at("Հեռախոս", "Phone")} value={f.phone} onChange={(v) => set("phone", v)} />
        <TextInput label={at("Բուժհաստատություն", "Institution")} value={f.institution} onChange={(v) => set("institution", v)} />
      </div>
      {err && <div role="alert" className="usr-err">{err}</div>}
      <div className="usr-actions">
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onCancel}>{at("Չեղարկել", "Cancel")}</button>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={busy || !f.email}>{busy ? "…" : at("Ստեղծել հաշիվ", "Create account")}</button>
      </div>
    </form>
  );
}

export default function UsersManager({ accounts, pricing, meId }: { accounts: Account[]; pricing: PricingConfig; meId: string }) {
  const { at } = useAdminI18n();
  const { show, node } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  const counts = useMemo(() => ({
    all: accounts.length,
    admin: accounts.filter((a) => a.role === "admin").length,
    client: accounts.filter((a) => a.role === "client").length,
    pending: accounts.filter((a) => a.role === "client" && a.subscription.status === "pending").length,
    active: accounts.filter((a) => a.role === "client" && a.subscription.status === "active").length,
  }), [accounts]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return accounts.filter((a) => {
      if (filter === "admin" && a.role !== "admin") return false;
      if (filter === "client" && a.role !== "client") return false;
      if (filter === "pending" && !(a.role === "client" && a.subscription.status === "pending")) return false;
      if (filter === "active" && !(a.role === "client" && a.subscription.status === "active")) return false;
      if (!needle) return true;
      return [a.email, a.full_name, a.institution, a.phone].some((v) => v.toLowerCase().includes(needle));
    });
  }, [accounts, filter, q]);

  const tabs: { id: Filter; hy: string; en: string }[] = [
    { id: "all", hy: "Բոլորը", en: "All" },
    { id: "pending", hy: "Նոր գրանցված", en: "New" },
    { id: "active", hy: "Ակտիվ հաճախորդներ", en: "Active clients" },
    { id: "client", hy: "Օգտատերեր", en: "Users" },
    { id: "admin", hy: "Ադմիններ", en: "Admins" },
  ];

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="adm-h1">{at("Օգտատերեր", "Users")}</h1>
          <p className="adm-sub">{at("Գրանցված անձինք, նրանց իրավասությունները և փաթեթները։", "Registered people, their access levels and plans.")}</p>
        </div>
        {!creating && <button className="adm-btn adm-btn-primary" onClick={() => { setCreating(true); setNotice(""); }}>+ {at("Ավելացնել օգտատեր", "Add user")}</button>}
      </div>

      {notice && (
        <div className="usr-notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="close">×</button>
        </div>
      )}

      {creating && <CreateUser at={at} onCancel={() => setCreating(false)} onDone={(m) => { setCreating(false); setNotice(m); }} />}

      <div className="adm-kpis">
        <div className="adm-kpi"><b>{counts.all}</b><span>{at("Ընդամենը", "Total")}</span></div>
        <div className="adm-kpi" style={counts.pending ? { borderColor: "rgba(59,130,246,.5)" } : undefined}><b>{counts.pending}</b><span>{at("Սպասում են ակտիվացման", "Awaiting activation")}</span></div>
        <div className="adm-kpi"><b>{counts.active}</b><span>{at("Ակտիվ հաճախորդ", "Active clients")}</span></div>
        <div className="adm-kpi"><b>{counts.admin}</b><span>{at("Ադմին", "Admins")}</span></div>
      </div>

      <div className="usr-toolbar">
        <div className="usr-tabs">
          {tabs.map((t) => (
            <button key={t.id} type="button" className={filter === t.id ? "on" : ""} onClick={() => setFilter(t.id)}>
              {at(t.hy, t.en)} <em>{counts[t.id]}</em>
            </button>
          ))}
        </div>
        <input className="adm-input usr-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={at("Որոնել՝ անուն, էլ. փոստ, հաստատություն…", "Search name, email, institution…")} />
      </div>

      {list.length === 0 && <div className="adm-card" style={{ textAlign: "center", color: "var(--a-dim)" }}>{at("Օգտատեր չի գտնվել։", "No users found.")}</div>}

      {list.map((a) => {
        const st = STATUS.find((s) => s.id === a.subscription.status)!;
        const plan = pricing.plans.find((p) => p.id === a.subscription.plan);
        const isOpen = open === a.id;
        const isMe = a.id === meId;
        return (
          <div key={a.id} className={`adm-item usr-item${isOpen ? " open" : ""}`}>
            <button type="button" className="usr-head" onClick={() => setOpen(isOpen ? null : a.id)} aria-expanded={isOpen}>
              <span className={`usr-avatar${a.role === "admin" ? " is-admin" : ""}`}>{initials(a)}</span>
              <span className="usr-main">
                <span className="adm-item-title">
                  {a.full_name || a.email}
                  {isMe && <span className="usr-me">{at("Դուք", "You")}</span>}
                </span>
                <span className="adm-item-meta">{a.email}{a.institution ? ` · ${a.institution}` : ""}</span>
              </span>
              <span className="usr-badges">
                <span className={`adm-badge ${a.role === "admin" ? "usr-badge-admin" : "adm-badge-off"}`}>{a.role === "admin" ? at("Ադմին", "Admin") : at("Օգտատեր", "User")}</span>
                {a.role === "client" && <span className={`adm-badge ${st.cls}`}>{at(st.hy, st.en)}</span>}
                {plan && <span className="adm-badge usr-badge-plan">{plan.name}</span>}
              </span>
              <span className="usr-dates">
                <span>{at("Գրանցվել է", "Joined")}: {fmtDate(a.created_at)}</span>
                <span>{at("Վերջին մուտք", "Last sign-in")}: {fmtDate(a.last_sign_in_at)}</span>
              </span>
              <svg className="usr-chev" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {isOpen && (
              <UserEditor account={a} pricing={pricing} isMe={isMe} at={at}
                onDone={(m, close) => { show(m); if (close) setOpen(null); }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
