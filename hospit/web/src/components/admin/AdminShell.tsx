"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminI18nProvider, useAdminI18n, L, type Bi } from "./i18n";

type NavItem = { sep: Bi } | { href: string; label: Bi; icon: React.ReactNode };

const NAV: NavItem[] = [
  { href: "/admin", label: L("Վահանակ", "Dashboard"), icon: <path d="M3 12l9-9 9 9M5 10v10h14V10" /> },
  { sep: L("Բովանդակություն", "Content") },
  { href: "/admin/texts", label: L("Տեքստեր", "Texts"), icon: <><path d="M4 7V4h16v3M9 20h6M12 4v16" /></> },
  { href: "/admin/features", label: L("Հնարավորություններ", "Features"), icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></> },
  { href: "/admin/services", label: L("Ծառայություններ", "Services"), icon: <><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z" /></> },
  { href: "/admin/partners", label: L("Գործընկերներ", "Partners"), icon: <><path d="M8 12l-4 4a2.8 2.8 0 004 4l1-1M16 12l4-4a2.8 2.8 0 00-4-4l-1 1M9 15l6-6" /></> },
  { href: "/admin/clients", label: L("Մեզ վստահում են", "Trusted by"), icon: <><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></> },
  { href: "/admin/values", label: L("Արժեքներ", "Values"), icon: <><path d="M12 21s-7-4.5-9.5-9A4.5 4.5 0 0112 6a4.5 4.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" /></> },
  { href: "/admin/timeline", label: L("Ժամանակագրություն", "Timeline"), icon: <><path d="M12 3v18M6 7h.01M6 12h.01M6 17h.01M12 7h6M12 12h6M12 17h6" /></> },
  { href: "/admin/advantages", label: L("Առավելություններ", "Advantages"), icon: <><path d="M3 21V3M3 21h18M7 16v-4M12 16V8M17 16v-7" /></> },
  { href: "/admin/comparison", label: L("Համեմատություն", "Comparison"), icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 4v16M3 10h18" /></> },
  { href: "/admin/integrations", label: L("Ինտեգրացիաներ", "Integrations"), icon: <><circle cx="12" cy="12" r="3" /><path d="M12 4v5M12 15v5M4 12h5M15 12h5" /></> },
  { href: "/admin/faqs", label: L("Հաճախ տրվող հարցեր", "FAQ"), icon: <><circle cx="12" cy="12" r="9" /><path d="M9.2 9a3 3 0 015.6 1.2c0 2-2.8 2.3-2.8 4M12 17.5v.01" /></> },
  { sep: L("Հաճախորդներ", "Customers") },
  { href: "/admin/users", label: L("Օգտատերեր", "Users"), icon: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 11.5a3 3 0 100-6M18 20a5.5 5.5 0 00-2.5-4.6" /></> },
  { href: "/admin/requests", label: L("Հարցումներ", "Requests"), icon: <><path d="M4 5h16v11H8l-4 4z" /></> },
  { href: "/admin/quiz", label: L("Վիկտորինա", "Quiz"), icon: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" /><path d="M7 6H4a3 3 0 003 3M17 6h3a3 3 0 01-3 3" /></> },
  { sep: L("Կարգավորումներ", "Settings") },
  { href: "/admin/pricing", label: L("Գնային հաշվարկ", "Pricing"), icon: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
  { href: "/admin/settings", label: L("Կապ և կարգավորումներ", "Contact & settings"), icon: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></> },
];

function ShellInner({ email, children }: { email: string; children: React.ReactNode }) {
  const { at, lang, setLang } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="adm-shell">
      <button className="adm-burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width={22} height={22} style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" }}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {open && <div className="adm-overlay" onClick={() => setOpen(false)} />}

      <aside className={`adm-side${open ? " open" : ""}`}>
        <div className="adm-brand" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" aria-label={at("Բացել կայքը", "Open website")}><img src="/uploads/logo-wordmark.png" alt="HospIT" style={{ height: 26, width: "auto", display: "block" }} /></a>
          <div style={{ display: "flex", background: "var(--a-bg2)", border: "1px solid var(--a-border)", borderRadius: 100, padding: 2 }}>
            {(["hy", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "3px 9px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                background: lang === l ? "var(--a-blue)" : "transparent", color: lang === l ? "#fff" : "var(--a-dim)",
              }}>{l}</button>
            ))}
          </div>
        </div>
        <a href="/" className="adm-navlink adm-sitelink">
          <svg viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" /></svg>
          {at("Դիտել կայքը", "View website")}
          <svg viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", marginLeft: "auto", width: 14, height: 14 }}><path d="M7 17L17 7M9 7h8v8" /></svg>
        </a>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item, i) =>
            "sep" in item ? (
              <div key={i} className="adm-navsep">{at(item.sep)}</div>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`adm-navlink${pathname === item.href ? " active" : ""}`}>
                <svg viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}>{item.icon}</svg>
                {at(item.label)}
              </Link>
            )
          )}
        </nav>
        <form action="/auth/signout" method="post" className="adm-signout">
          <div style={{ fontSize: 12, color: "var(--a-faint)", padding: "0 12px 8px", wordBreak: "break-all" }}>{email}</div>
          <button type="submit" className="adm-navlink" style={{ color: "#fca5a5" }}>
            <svg viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            {at("Ելք", "Sign out")}
          </button>
        </form>
      </aside>

      <main className="adm-main">{children}</main>
    </div>
  );
}

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <AdminI18nProvider>
      <ShellInner email={email}>{children}</ShellInner>
    </AdminI18nProvider>
  );
}
