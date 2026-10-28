"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { fmtTime, t, type QuizConfig, type BoardRow } from "@/lib/quiz";

// ═══════════════ Մեծ էկրան ═══════════════
// Ամեն 5 վրկ թարմացնում է օրվա TOP-10-ը /api/quiz-ից։ QR-ը տանում է /quiz։

const REFRESH_MS = 5000;

export default function QuizBoard({ cfg }: { cfg: QuizConfig }) {
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [total, setTotal] = useState(0);
  const [qr, setQr] = useState("");
  const [url, setUrl] = useState("");
  const [online, setOnline] = useState(true);
  const max = cfg.questions.filter((q) => q.active).length;

  useEffect(() => {
    const u = `${window.location.origin}/quiz`;
    setUrl(u.replace(/^https?:\/\//, ""));
    QRCode.toDataURL(u, { width: 800, margin: 1, color: { dark: "#08182E", light: "#FFFFFF" } }).then(setQr).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/quiz", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const j = await r.json();
        if (!alive) return;
        setRows(j.rows || []); setTotal(j.total || 0); setOnline(true);
      } catch { if (alive) setOnline(false); }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const best = rows[0];

  return (
    <div className="qb-root">
      <header className="qb-head">
        <div className="qb-brand">
          <img src="/uploads/logo-wordmark.png" alt="HospIT" />
          <div className="qb-title">{t(cfg.title, "hy")}<small>{t(cfg.title, "en")} · Be Automated &amp; MedMeet</small></div>
        </div>
        <div className="qb-live"><i style={{ background: online ? "#2EDB8A" : "#E0475B" }} />{online ? "LIVE" : "OFFLINE"}</div>
      </header>

      <div className="qb-body">
        <section className="qb-panel">
          <h2><span>Օրվա TOP-10</span><span>Today&apos;s top 10</span></h2>
          {rows.length === 0 ? (
            <div className="qb-empty">Առաջին խաղացողը դեռ չկա։<br />Սկանավորեք QR-ը և եղեք առաջինը։</div>
          ) : (
            <div className="qb-list">
              {rows.map((r, i) => (
                <div key={`${r.name}-${r.created_at}`} className={`qb-row${i < 3 ? ` top${i + 1}` : ""}`} style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="qb-rank">{i + 1}</div>
                  <div className="qb-name">{r.name}{r.org && <small>{r.org}</small>}</div>
                  <div className="qb-dots" title={`${r.score}/${max}`}>
                    {Array.from({ length: max }).map((_, k) => <i key={k} className={k < r.score ? "on" : ""} />)}
                  </div>
                  <div className="qb-time">{fmtTime(r.total_ms)}s</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="qb-panel qb-qr">
          <div className="cta">Սկանավորիր և խաղա<br /><span style={{ color: "var(--muted)", fontSize: ".7em", fontWeight: 600 }}>Scan &amp; play</span></div>
          {qr && <img src={qr} alt="QR" />}
          <div className="url">{url}</div>
          <div className="qb-kpis">
            <div className="qb-kpi"><b>{total}</b><span>խաղացող այսօր</span></div>
            <div className="qb-kpi"><b>{best ? `${best.score}/${max}` : "—"}</b><span>լավագույն արդյունք</span></div>
          </div>
          <div className="prize">🏆 {t(cfg.prize, "hy")}</div>
        </aside>
      </div>
    </div>
  );
}
