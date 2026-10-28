"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: ({ sep: string } | { href: string; label: string; icon: React.ReactNode })[] = [
  { href: "/admin", label: "Վահանակ", icon: <path d="M3 12l9-9 9 9M5 10v10h14V10" /> },
  { sep: "Բովանդակություն" },
  { href: "/admin/texts", label: "Տեքստեր", icon: <><path d="M4 7V4h16v3M9 20h6M12 4v16" /></> },
  { href: "/admin/modules", label: "Մոդուլներ (BC)", icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></> },
  { href: "/admin/benefits", label: "Առավելություններ", icon: <><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z" /></> },
  { href: "/admin/stats", label: "Վիճակագրություն", icon: <><path d="M3 21V3M3 21h18M7 16v-4M12 16V8M17 16v-7" /></> },
  { href: "/admin/industries", label: "Ոլորտներ", icon: <><path d="M3 21V10l5 3V10l5 3V10l5 3v8zM3 21h18" /></> },
  { href: "/admin/clients", label: "Հաճախորդներ", icon: <><circle cx="9" cy="8" r="3.2" /><path d="M15 8a3 3 0 100-.01M3 20v-1a4 4 0 014-4h4a4 4 0 014 4v1M17 20v-1a4 4 0 00-3-3.8" /></> },
  { href: "/admin/partners", label: "Գործընկերներ", icon: <><path d="M8 12l-4 4a2.8 2.8 0 004 4l1-1M16 12l4-4a2.8 2.8 0 00-4-4l-1 1M9 15l6-6" /></> },
  { href: "/admin/stories", label: "Պատմություններ", icon: <><path d="M4 5h16v12H7l-3 3z" /></> },
  { href: "/admin/proof", label: "Թվեր (Proof)", icon: <><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" /></> },
  { sep: "Կարգավորումներ" },
  { href: "/admin/settings", label: "Կապ և կարգավորումներ", icon: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></> },
  { href: "/admin/requests", label: "Հարցումներ", icon: <><path d="M4 5h16v11H8l-4 4z" /></> },
];

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="adm-shell">
      <button className="adm-burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width={22} height={22} style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" }}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {open && <div className="adm-overlay" onClick={() => setOpen(false)} />}

      <aside className={`adm-side${open ? " open" : ""}`}>
        <div className="adm-brand">
          <img src="/assets/logo-dark.svg" alt="LuysTech" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--a-faint)", letterSpacing: ".08em" }}>ADMIN</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item, i) =>
            "sep" in item ? (
              <div key={i} className="adm-navsep">{item.sep}</div>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`adm-navlink${pathname === item.href ? " active" : ""}`}>
                <svg viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}>{item.icon}</svg>
                {item.label}
              </Link>
            )
          )}
        </nav>
        <form action="/auth/signout" method="post" className="adm-signout">
          <div style={{ fontSize: 12, color: "var(--a-faint)", padding: "0 12px 8px", wordBreak: "break-all" }}>{email}</div>
          <button type="submit" className="adm-navlink" style={{ color: "#fca5a5" }}>
            <svg viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Ելք
          </button>
        </form>
      </aside>

      <main className="adm-main">{children}</main>
    </div>
  );
}
