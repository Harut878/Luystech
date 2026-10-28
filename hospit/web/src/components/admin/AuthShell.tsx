"use client";

import "@/app/admin/admin.css";
import type { Lang } from "@/lib/types";

const LANGS: Lang[] = ["hy", "en", "ru"];

export default function AuthShell({ children, lang, setLang, backLabel, wide }: {
  children: React.ReactNode;
  lang?: Lang;
  setLang?: (l: Lang) => void;
  backLabel?: string;
  wide?: boolean;
}) {
  return (
    <div className="adm-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-12%", left: "-8%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,.35), transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-14%", right: "-8%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,.22), transparent 65%)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, width: wide ? "min(480px,100%)" : "min(420px,100%)" }}>
        {(backLabel || setLang) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            {backLabel ? (
              <a href="/" style={{ fontSize: 13.5, color: "var(--a-dim)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {backLabel}
              </a>
            ) : <span />}
            {setLang && lang && (
              <div style={{ display: "flex", background: "var(--a-bg2)", border: "1px solid var(--a-border)", borderRadius: 100, padding: 2 }}>
                {LANGS.map((l) => (
                  <button key={l} type="button" onClick={() => setLang(l)} style={{
                    padding: "3px 10px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "inherit",
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    background: lang === l ? "var(--a-blue)" : "transparent", color: lang === l ? "#fff" : "var(--a-dim)",
                  }}>{l}</button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="adm-card" style={{ padding: "clamp(26px,5vw,40px)", marginBottom: 0 }}>
          <a href="/" aria-label="HospIT"><img src="/uploads/logo-wordmark.png" alt="HospIT" style={{ height: 30, marginBottom: 22, display: "block" }} /></a>
          {children}
        </div>
      </div>
    </div>
  );
}
