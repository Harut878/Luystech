"use client";

import { useEffect, useState } from "react";
import "./account.css";
import { useSiteLang } from "./dict";
import { changeOwnPassword } from "@/app/auth/actions";
import type { Account, Lang, PlanKey } from "@/lib/types";

type PlanInfo = { id: PlanKey; name: string; shortLabel: string };

const LANGS: Lang[] = ["hy", "en", "ru"];

function fmtMoney(n: number) {
  return n.toLocaleString("en-US");
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : "";
}

const DAY = 86_400_000;

function periodInfo(start: string, end: string) {
  if (!start || !end) return null;
  const s = Date.parse(start), e = Date.parse(end);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;
  const now = Date.now();
  const pct = Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
  const left = Math.max(0, Math.ceil((e - now) / DAY));
  return { pct, left };
}

export default function AccountView({ account, plans, addons, contact, logo }: {
  account: Account;
  plans: PlanInfo[];
  addons: { id: string; label: string }[];
  contact: { phone: string; email: string };
  logo: string;
}) {
  const { lang, setLang, d } = useSiteLang();
  const sub = account.subscription;
  const plan = plans.find((p) => p.id === sub.plan);
  const modules = sub.addons.map((id) => addons.find((a) => a.id === id)?.label).filter(Boolean) as string[];
  const period = periodInfo(sub.start_date, sub.end_date);
  const firstName = account.full_name.split(" ")[0] || account.email;

  // Առաջընթացի գիծը լցվում է էջը բացվելուց հետո (անիմացիա)
  const [barPct, setBarPct] = useState(0);
  useEffect(() => {
    if (!period) return;
    const t = setTimeout(() => setBarPct(period.pct), 120);
    return () => clearTimeout(t);
  }, [period?.pct]);

  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.length < 8) { setPwMsg({ ok: false, text: d.errWeak }); return; }
    setPwBusy(true);
    const res = await changeOwnPassword(pw).catch(() => null);
    setPwBusy(false);
    if (!res || !res.ok) {
      setPwMsg({ ok: false, text: res?.code === "pw_short" ? d.errWeak : res?.code === "pw_long" ? d.errLong : d.errGeneric });
      return;
    }
    setPw("");
    setPwMsg({ ok: true, text: d.pwChanged });
  }

  const statusBadge = <span className={`acc-status acc-status-${sub.status}`}>{d.status[sub.status]}</span>;

  return (
    <div className="adm-body" style={{ position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: "-18%", left: "-10%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,.22), transparent 65%)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,.14), transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <header className="acc-top">
        <div className="acc-top-in">
          <a href="/" aria-label="HospIT"><img src={logo} alt="HospIT" style={{ height: 26, width: "auto", display: "block" }} /></a>
          <a href="/" className="adm-btn adm-btn-ghost adm-btn-sm acc-site-link" style={{ textDecoration: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" /></svg>
            <span>{d.toSite}</span>
          </a>
          <span className="acc-spacer" />
          <div style={{ display: "flex", background: "var(--a-bg2)", border: "1px solid var(--a-border)", borderRadius: 100, padding: 2 }}>
            {LANGS.map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} style={{
                padding: "3px 9px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                background: lang === l ? "var(--a-blue)" : "transparent", color: lang === l ? "#fff" : "var(--a-dim)",
              }}>{l}</button>
            ))}
          </div>
          {account.role === "admin" && <a href="/admin" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ textDecoration: "none" }}>{d.adminPanel}</a>}
          <form action="/auth/signout" method="post">
            <button type="submit" className="adm-btn adm-btn-ghost adm-btn-sm">{d.signOut}</button>
          </form>
        </div>
      </header>

      <main className="acc-wrap">
        <section className="acc-hero acc-fade">
          <div>
            <div className="acc-hello">{d.hello}, {firstName} 👋</div>
            <h1 className="acc-name">{d.myPage}</h1>
            {account.institution && (
              <div className="acc-inst">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M10 9h4M12 7v4" /></svg>
                {account.institution}
              </div>
            )}
          </div>
          {plan && statusBadge}
        </section>

        <div className="acc-grid">
          {/* ── Փաթեթ ── */}
          <div className="acc-fade" style={{ animationDelay: "80ms" }}>
            {plan ? (
              <section className="acc-card acc-plan">
                <h2>{d.myPlan}</h2>
                <div className="acc-plan-head">
                  <div>
                    <div className="acc-plan-name">{plan.name}</div>
                    {plan.shortLabel && <div className="acc-plan-sub">{plan.shortLabel}</div>}
                  </div>
                </div>

                {sub.monthly_price > 0 && (
                  <div className="acc-price">
                    <b>{fmtMoney(sub.monthly_price)} ֏</b>
                    <span>{d.perMonth}</span>
                    <small>{d.monthlyPrice}</small>
                  </div>
                )}

                <div className="acc-stats">
                  <div className="acc-stat"><span>{d.employees}</span><b>{sub.employees || "—"}</b></div>
                  <div className="acc-stat"><span>{d.from}</span><b>{sub.start_date ? fmtDate(sub.start_date) : "—"}</b></div>
                  <div className="acc-stat"><span>{d.to}</span><b>{sub.end_date ? fmtDate(sub.end_date) : d.openEnded}</b></div>
                </div>

                {period && (
                  <div className="acc-period">
                    <div className="acc-period-row"><span>{d.period}</span><b>{period.left} {d.daysLeft}</b></div>
                    <div className="acc-bar"><i style={{ width: `${barPct}%` }} /></div>
                  </div>
                )}

                <div className="acc-block" style={{ borderTop: "none", marginTop: 0, paddingTop: 0 }}>
                  <h3>{d.modules}</h3>
                  {modules.length
                    ? <div className="acc-chips">{modules.map((m) => <span key={m} className="acc-chip">{m}</span>)}</div>
                    : <p style={{ color: "var(--a-faint)" }}>{d.none}</p>}
                </div>

                {sub.payment_terms && (
                  <div className="acc-block"><h3>{d.paymentTerms}</h3><p>{sub.payment_terms}</p></div>
                )}
                {sub.terms && (
                  <div className="acc-block"><h3>{d.terms}</h3><p>{sub.terms}</p></div>
                )}
              </section>
            ) : (
              <section className="acc-card acc-empty">
                <div className="acc-empty-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                </div>
                <h3>{d.noPlanTitle}</h3>
                <p>{d.noPlanBody}</p>
              </section>
            )}
          </div>

          {/* ── Կողային սյուն ── */}
          <aside className="acc-fade" style={{ animationDelay: "160ms" }}>
            <section className="acc-card">
              <h2>{d.myData}</h2>
              <dl className="acc-dl">
                <div><dt>{d.fullName}</dt><dd>{account.full_name || "—"}</dd></div>
                <div><dt>{d.institution}</dt><dd>{account.institution || "—"}</dd></div>
                <div><dt>{d.phone}</dt><dd>{account.phone || "—"}</dd></div>
                <div><dt>{d.email}</dt><dd>{account.email}</dd></div>
              </dl>
              <p className="acc-note">{d.editNote}</p>
            </section>

            <section className="acc-card">
              <h2>{d.security}</h2>
              <form onSubmit={changePassword}>
                <div className="adm-field">
                  <label className="adm-label" htmlFor="acc-newpw">{d.newPassword}</label>
                  <input id="acc-newpw" className="adm-input" type="password" autoComplete="new-password" minLength={8} maxLength={72}
                    value={pw} onChange={(e) => setPw(e.target.value)} placeholder={d.pwHint} />
                </div>
                {pwMsg && <div role="status" style={{ fontSize: 13, marginBottom: 10, color: pwMsg.ok ? "var(--a-green)" : "#fca5a5" }}>{pwMsg.text}</div>}
                <button type="submit" className="adm-btn adm-btn-ghost" style={{ width: "100%" }} disabled={pwBusy || !pw}>{pwBusy ? "…" : d.changePw}</button>
              </form>
            </section>

            {(contact.phone || contact.email) && (
              <section className="acc-card acc-contact">
                <h2>{d.needHelp}</h2>
                <p style={{ fontSize: 14, color: "var(--a-dim)", margin: "0 0 4px" }}>{d.needHelpBody}</p>
                {contact.phone && (
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" /></svg>
                    {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                    {contact.email}
                  </a>
                )}
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
