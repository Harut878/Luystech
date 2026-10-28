"use client";

import { useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { listPlayers, setWinner, deletePlayer, clearDay } from "@/app/admin/quiz-actions";
import { MLInput, NumberInput, BoolInput, useToast } from "./fields";
import { useAdminI18n } from "./i18n";
import type { Settings, ML } from "@/lib/types";
import { DEFAULT_QUIZ, fmtTime, type QuizConfig, type QuizPlayer, type QuizQuestion } from "@/lib/quiz";

// ═══════════════ Ադմին → Վիկտորինա ═══════════════
// Ներդիր 1՝ խաղացողներ (օր ընտրելով), հաղթողի նշում, CSV։ Ներդիր 2՝ հարցեր և տեքստեր։

const emptyML = (): ML => ({ hy: "", en: "", ru: "" });
const newQuestion = (): QuizQuestion => ({
  id: "q" + Math.random().toString(36).slice(2, 8),
  text: emptyML(), options: [emptyML(), emptyML(), emptyML(), emptyML()], correct: 0, active: true,
});

export default function QuizAdmin({ settings, today, initialPlayers, days }: {
  settings: Settings; today: string; initialPlayers: QuizPlayer[]; days: { day: string; n: number }[];
}) {
  const { at, lang } = useAdminI18n();
  const { show, node } = useToast();
  const [tab, setTab] = useState<"players" | "questions">("players");

  // ── Խաղացողներ ──
  const [day, setDay] = useState(today);
  const [players, setPlayers] = useState<QuizPlayer[]>(initialPlayers);
  const [loading, setLoading] = useState(false);
  const locale = lang === "en" ? "en-US" : "hy-AM";

  async function changeDay(d: string) {
    setDay(d); setLoading(true);
    try { setPlayers(await listPlayers(d)); } finally { setLoading(false); }
  }
  async function toggleWinner(p: QuizPlayer) {
    setPlayers((l) => l.map((x) => (x.id === p.id ? { ...x, winner: !p.winner } : x)));
    const r = await setWinner(p.id, !p.winner);
    show(r.ok ? at("Պահված է ✓", "Saved ✓") : at("Սխալ", "Error"));
  }
  async function remove(p: QuizPlayer) {
    if (!confirm(at(`Ջնջե՞լ ${p.name}-ի արդյունքը։`, `Delete ${p.name}'s result?`))) return;
    setPlayers((l) => l.filter((x) => x.id !== p.id));
    await deletePlayer(p.id);
    show(at("Ջնջված է", "Deleted"));
  }
  async function clearAll() {
    if (!confirm(at(`Ջնջե՞լ ${day} օրվա ԲՈԼՈՐ արդյունքները (${players.length})։ Հետ բերել հնարավոր չէ։`, `Delete ALL results of ${day} (${players.length})? This cannot be undone.`))) return;
    const r = await clearDay(day);
    if (r.ok) { setPlayers([]); show(at("Օրը մաքրված է", "Day cleared")); } else show(at("Սխալ", "Error"));
  }
  function exportCsv() {
    const head = ["#", "Անուն", "Հեռախոս", "Հաստատություն", "Միավոր", "Ժամանակ (վրկ)", "Հաղթող", "Ժամ"];
    const rows = players.map((p, i) => [i + 1, p.name, p.phone, p.org || "", p.score, fmtTime(p.total_ms), p.winner ? "այո" : "", new Date(p.created_at).toLocaleString("hy-AM")]);
    const esc = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `hospit-quiz-${day}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ── Հարցեր ──
  const [quiz, setQuiz] = useState<QuizConfig>(settings.quiz || DEFAULT_QUIZ);
  const [saving, setSaving] = useState(false);
  const max = quiz.questions.filter((q) => q.active).length;
  const upQ = (i: number, patch: Partial<QuizQuestion>) =>
    setQuiz((c) => ({ ...c, questions: c.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)) }));
  const upOpt = (i: number, j: number, v: ML) =>
    setQuiz((c) => ({ ...c, questions: c.questions.map((q, k) => (k === i ? { ...q, options: q.options.map((o, m) => (m === j ? v : o)) } : q)) }));
  const move = (i: number, d: -1 | 1) =>
    setQuiz((c) => { const a = [...c.questions]; const j = i + d; if (j < 0 || j >= a.length) return c; [a[i], a[j]] = [a[j], a[i]]; return { ...c, questions: a }; });

  async function save() {
    for (const q of quiz.questions) {
      if (q.active && !q.text.hy.trim()) { show(at("Բոլոր ակտիվ հարցերը պետք է հայերեն տեքստ ունենան", "Every active question needs Armenian text")); return; }
    }
    setSaving(true);
    const r = await saveSettings({ ...settings, quiz });
    setSaving(false);
    show(r.ok ? at("Պահված է ✓", "Saved ✓") : at("Սխալ՝ ", "Error: ") + (r.error || ""));
  }

  return (
    <div>
      {node}
      <h1 className="adm-h1">{at("Ցուցահանդեսի վիկտորինա", "Exhibition quiz")}</h1>
      <p className="adm-sub">
        {at("Այցելուի էջ՝ ", "Visitor page: ")}<a href="/quiz" target="_blank" style={{ color: "var(--a-blue)" }}>/quiz</a>
        {" · "}{at("Մեծ էկրան՝ ", "Big screen: ")}<a href="/quiz/board" target="_blank" style={{ color: "var(--a-blue)" }}>/quiz/board</a>
        {" "}{at("(բացեք F11-ով ամբողջ էկրանով)", "(open full-screen with F11)")}
      </p>

      <div className="adm-row" style={{ gap: 6, marginBottom: 18 }}>
        <button className={`adm-btn adm-btn-sm ${tab === "players" ? "adm-btn-primary" : "adm-btn-ghost"}`} onClick={() => setTab("players")}>{at("Խաղացողներ", "Players")}</button>
        <button className={`adm-btn adm-btn-sm ${tab === "questions" ? "adm-btn-primary" : "adm-btn-ghost"}`} onClick={() => setTab("questions")}>{at("Հարցեր և տեքստեր", "Questions & texts")}</button>
      </div>

      {tab === "players" && (
        <div>
          <div className="adm-card">
            <div className="adm-row" style={{ flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <label className="adm-label" htmlFor="qa-day" style={{ margin: 0 }}>{at("Օր", "Day")}</label>
              <select id="qa-day" className="adm-input" style={{ width: "auto" }} value={day} onChange={(e) => changeDay(e.target.value)}>
                {days.map((d) => <option key={d.day} value={d.day}>{d.day}{d.day === today ? at(" (այսօր)", " (today)") : ""} — {d.n}</option>)}
              </select>
              <span className="adm-item-meta">{at("Ընդամենը՝ ", "Total: ")}{players.length}</span>
              <div style={{ marginInlineStart: "auto", display: "flex", gap: 6 }}>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={exportCsv} disabled={!players.length}>{at("Ներբեռնել CSV", "Download CSV")}</button>
                <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={clearAll} disabled={!players.length}>{at("Մաքրել օրը", "Clear day")}</button>
              </div>
            </div>
          </div>

          {loading && <p className="adm-sub">{at("Բեռնվում է…", "Loading…")}</p>}
          {!loading && players.length === 0 && <p className="adm-sub">{at("Այս օրը դեռ խաղացող չկա։", "No players on this day yet.")}</p>}

          <div style={{ overflowX: "auto" }}>
            {players.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ color: "var(--a-faint)", fontSize: 12, textAlign: "left" }}>
                    {["#", at("Անուն", "Name"), at("Հեռախոս", "Phone"), at("Հաստատություն", "Organization"), at("Միավոր", "Score"), at("Ժամանակ", "Time"), at("Ժամ", "When"), ""].map((h, i) => (
                      <th key={i} style={{ padding: "8px 10px", borderBottom: "1px solid var(--a-border)", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <tr key={p.id} style={{ background: p.winner ? "rgba(245,194,66,.12)" : i < 3 ? "var(--a-bg2)" : "transparent" }}>
                      <td style={td}><b>{i + 1}</b></td>
                      <td style={td}>{p.winner && "🏆 "}{p.name}</td>
                      <td style={{ ...td, fontVariantNumeric: "tabular-nums" }}><a href={`tel:${p.phone}`} style={{ color: "var(--a-blue)", textDecoration: "none" }}>{p.phone}</a></td>
                      <td style={td}>{p.org || "—"}</td>
                      <td style={td}><b>{p.score}</b> / {max}</td>
                      <td style={{ ...td, fontVariantNumeric: "tabular-nums" }}>{fmtTime(p.total_ms)} {at("վրկ", "s")}</td>
                      <td style={{ ...td, color: "var(--a-faint)", whiteSpace: "nowrap" }}>{new Date(p.created_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</td>
                      <td style={{ ...td, whiteSpace: "nowrap" }}>
                        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => toggleWinner(p)}>{p.winner ? at("Հանել հաղթողից", "Unmark") : at("Հաղթող", "Winner")}</button>{" "}
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(p)}>{at("Ջնջել", "Delete")}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "questions" && (
        <div>
          <div className="adm-card">
            <MLInput label={at("Վերնագիր", "Title")} value={quiz.title} onChange={(v) => setQuiz({ ...quiz, title: v })} />
            <MLInput label={at("Ենթավերնագիր", "Subtitle")} value={quiz.subtitle} onChange={(v) => setQuiz({ ...quiz, subtitle: v })} area />
            <MLInput label={at("Մրցանակ", "Prize")} value={quiz.prize} onChange={(v) => setQuiz({ ...quiz, prize: v })} />
            <NumberInput label={at("Վայրկյան մեկ հարցի համար", "Seconds per question")} value={quiz.seconds} onChange={(v) => setQuiz({ ...quiz, seconds: v })} />
          </div>

          {quiz.questions.map((q, i) => (
            <div key={q.id} className="adm-card">
              <div className="adm-item-head" style={{ marginBottom: 10 }}>
                <div className="adm-item-title">{at("Հարց", "Question")} {i + 1}</div>
                <div className="adm-row" style={{ gap: 6 }}>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => move(i, 1)} disabled={i === quiz.questions.length - 1}>↓</button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setQuiz((c) => ({ ...c, questions: c.questions.filter((_, k) => k !== i) }))}>{at("Ջնջել", "Delete")}</button>
                </div>
              </div>
              <MLInput label={at("Հարցի տեքստ", "Question text")} value={q.text} onChange={(v) => upQ(i, { text: v })} area />
              {q.options.map((o, j) => (
                <div key={j} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, alignItems: "start" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 30, fontSize: 13, color: "var(--a-dim)", whiteSpace: "nowrap" }}>
                    <input type="radio" name={`correct-${q.id}`} checked={q.correct === j} onChange={() => upQ(i, { correct: j })} />
                    {at("Ճիշտ", "Correct")}
                  </label>
                  <MLInput label={`${at("Տարբերակ", "Option")} ${"ABCD"[j] || j + 1}`} value={o} onChange={(v) => upOpt(i, j, v)} />
                </div>
              ))}
              <BoolInput label={at("Ակտիվ", "Active")} value={q.active} onChange={(v) => upQ(i, { active: v })} />
            </div>
          ))}

          <div className="adm-row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button className="adm-btn adm-btn-ghost" onClick={() => setQuiz((c) => ({ ...c, questions: [...c.questions, newQuestion()] }))}>+ {at("Ավելացնել հարց", "Add question")}</button>
            <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>{saving ? at("Պահվում է…", "Saving…") : at("Պահել", "Save")}</button>
            <span className="adm-item-meta">{at("Ակտիվ հարցեր՝ ", "Active questions: ")}{max}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const td: React.CSSProperties = { padding: "9px 10px", borderBottom: "1px solid var(--a-border)", verticalAlign: "middle" };
