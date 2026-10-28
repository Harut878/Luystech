"use client";

import "@/app/admin/admin.css";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-12%", left: "-8%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,.35), transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-14%", right: "-8%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,.22), transparent 65%)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div className="adm-card" style={{ position: "relative", zIndex: 1, width: "min(420px,100%)", padding: "clamp(28px,5vw,40px)" }}>
        <img src="/assets/logo-dark.svg" alt="LuysTech" style={{ height: 30, marginBottom: 22 }} />
        {children}
      </div>
    </div>
  );
}
