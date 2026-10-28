"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/types";
import { t, fmtTime, normalizePhone, phoneLooksValid, type QuizConfig } from "@/lib/quiz";

// ═══════════════ Հեռախոսի խաղ ═══════════════
// Քայլեր՝ start (անուն+հեռախոս) → play (հարցեր, ժամաչափ) → sending → done (արդյունք, տեղ օրվա ցուցակում)

type Answer = { q: string; a: number | null; ms: number };
type Result = { score: number; max: number; total_ms: number; rank: number; total: number; best: boolean; bestScore?: number; bestMs?: number; stored: boolean };

const UI = {
  start: { hy: "Սկսել խաղը", en: "Start the game", ru: "Начать игру" },
  name: { hy: "Ձեր անունը", en: "Your name", ru: "Ваше имя" },
  phone: { hy: "Հեռախոսահամար", en: "Phone number", ru: "Номер телефона" },
  org: { hy: "Հաստատություն (ոչ պարտադիր)", en: "Organization (optional)", ru: "Учреждение (необязательно)" },
  phoneHint: { hy: "Հեռախոսը պետք է միայն հաղթողին մրցանակը հանձնելու համար։", en: "The phone number is used only to hand the prize to the winner.", ru: "Телефон нужен только чтобы вручить приз победителю." },
  errName: { hy: "Գրեք Ձեր անունը", en: "Please enter your name", ru: "Введите имя" },
  errPhone: { hy: "Ստուգեք հեռախոսահամարը", en: "Check the phone number", ru: "Проверьте номер телефона" },
  question: { hy: "Հարց", en: "Question", ru: "Вопрос" },
  sec: { hy: "վրկ", en: "sec", ru: "сек" },
  correct: { hy: "Ճիշտ պատասխան", en: "Correct answers", ru: "Правильных ответов" },
  time: { hy: "Ժամանակ", en: "Time", ru: "Время" },
  place: { hy: "Ձեր տեղը այսօր", en: "Your place today", ru: "Ваше место сегодня" },
  of: { hy: "-ից", en: "of", ru: "из" },
  sending: { hy: "Արդյունքը գրանցվում է…", en: "Saving your result…", ru: "Сохраняем результат…" },
  again: { hy: "Խաղալ նորից", en: "Play again", ru: "Сыграть ещё раз" },
  notBest: { hy: "Ձեր այսօրվա լավագույն արդյունքը մնում է ուժի մեջ։", en: "Your best result of the day stays on the board.", ru: "Ваш лучший результат дня остаётся в силе." },
  watch: { hy: "Հետևեք մեծ էկրանին՝ օրվա հաղթողը հայտարարվում է օրվա վերջում։", en: "Watch the big screen — the winner is announced at the end of the day.", ru: "Следите за большим экраном — победитель объявляется в конце дня." },
  great: { hy: "Հիանալի է", en: "Excellent", ru: "Отлично" },
  good: { hy: "Լավ արդյունք", en: "Good result", ru: "Хороший результат" },
  ok: { hy: "Շնորհակալություն խաղի համար", en: "Thanks for playing", ru: "Спасибо за игру" },
  failed: { hy: "Չհաջողվեց գրանցել արդյունքը։ Ստուգեք ինտերնետը և փորձեք նորից։", en: "Could not save the result. Check your connection and try again.", ru: "Не удалось сохранить результат. Проверьте интернет и попробуйте снова." },
  retry: { hy: "Փորձել նորից", en: "Try again", ru: "Попробовать снова" },
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuizPlay({ cfg }: { cfg: QuizConfig }) {
  const [lang, setLang] = useState<Lang>("hy");
  const [step, setStep] = useState<"start" | "play" | "sending" | "done" | "failed">("start");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [err, setErr] = useState<"" | "name" | "phone">("");
  const [result, setResult] = useState<Result | null>(null);

  const questions = useMemo(() => cfg.questions.filter((q) => q.active && q.options.length >= 2), [cfg]);
  const limitMs = Math.max(5, Math.min(120, cfg.seconds || 20)) * 1000;

  // Խաղի վիճակ
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);   // ընտրված տարբերակ (ցուցադրման համար)
  const [left, setLeft] = useState(limitMs);
  const answersRef = useRef<Answer[]>([]);
  const startRef = useRef(0);
  const lockRef = useRef(false);

  useEffect(() => {
    try { const s = localStorage.getItem("hospit_lang") as Lang | null; if (s === "hy" || s === "en" || s === "ru") setLang(s); } catch {}
  }, []);
  const pick = (l: Lang) => { setLang(l); try { localStorage.setItem("hospit_lang", l); } catch {} };
  const u = (k: keyof typeof UI) => UI[k][lang] || UI[k].hy;

  // Ժամաչափ
  useEffect(() => {
    if (step !== "play") return;
    startRef.current = performance.now();
    setLeft(limitMs);
    lockRef.current = false;
    const id = setInterval(() => {
      const rem = limitMs - (performance.now() - startRef.current);
      if (rem <= 0) { clearInterval(id); setLeft(0); answer(null); }
      else setLeft(rem);
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, qi]);

  function begin() {
    const p = normalizePhone(phone);
    if (name.trim().length < 2) { setErr("name"); return; }
    if (!phoneLooksValid(p)) { setErr("phone"); return; }
    setErr("");
    answersRef.current = [];
    setQi(0); setPicked(null);
    setStep("play");
  }

  function answer(idx: number | null) {
    if (lockRef.current) return;
    lockRef.current = true;
    const ms = Math.min(limitMs, Math.round(performance.now() - startRef.current));
    const q = questions[qi];
    answersRef.current.push({ q: q.id, a: idx, ms });
    setPicked(idx);
    // Կարճ դադար՝ ճիշտ/սխալը ցույց տալու համար, հետո հաջորդ հարցը
    setTimeout(() => {
      if (qi + 1 < questions.length) { setQi(qi + 1); setPicked(null); }
      else submit();
    }, 900);
  }

  async function submit() {
    setStep("sending");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: normalizePhone(phone), org: org.trim(), answers: answersRef.current }),
      });
      if (!res.ok) throw new Error("bad");
      setResult(await res.json());
      setStep("done");
    } catch {
      setStep("failed");
    }
  }

  const q = questions[qi];
  const pct = Math.max(0, Math.min(100, (left / limitMs) * 100));

  return (
    <div className="qz-root">
      <div className="qz-wrap">
        <div className="qz-top">
          <img className="qz-logo" src="/uploads/logo-wordmark.png" alt="HospIT" />
          <div className="qz-langs">
            {(["hy", "en", "ru"] as Lang[]).map((l) => (
              <button key={l} className={lang === l ? "on" : ""} onClick={() => pick(l)}>{l}</button>
            ))}
          </div>
        </div>

        {step === "start" && (
          <div className="qz-card">
            <p className="qz-eyebrow">Be Automated &amp; MedMeet 2026</p>
            <h1 className="qz-h1">{t(cfg.title, lang)}</h1>
            <p className="qz-sub">{t(cfg.subtitle, lang)}</p>
            <div className="qz-prize">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" /><path d="M7 6H4a3 3 0 003 3M17 6h3a3 3 0 01-3 3" /></svg>
              <span>{t(cfg.prize, lang)}</span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); begin(); }}>
              <div className="qz-field">
                <label className="qz-label" htmlFor="qz-name">{u("name")}</label>
                <input id="qz-name" className={`qz-input${err === "name" ? " err" : ""}`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} />
              </div>
              {err === "name" && <div className="qz-error">{u("errName")}</div>}
              <div className="qz-field">
                <label className="qz-label" htmlFor="qz-phone">{u("phone")}</label>
                <input id="qz-phone" className={`qz-input${err === "phone" ? " err" : ""}`} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+374 XX XXX XXX" maxLength={20} />
                <div className="qz-hint">{u("phoneHint")}</div>
              </div>
              {err === "phone" && <div className="qz-error">{u("errPhone")}</div>}
              <div className="qz-field">
                <label className="qz-label" htmlFor="qz-org">{u("org")}</label>
                <input id="qz-org" className="qz-input" value={org} onChange={(e) => setOrg(e.target.value)} autoComplete="organization" maxLength={80} />
              </div>
              <button type="submit" className="qz-btn">{u("start")} →</button>
            </form>
          </div>
        )}

        {step === "play" && q && (
          <div className="qz-card">
            <div className="qz-meta">
              <span>{u("question")} <b>{qi + 1}</b> / {questions.length}</span>
              <span><b>{Math.ceil(left / 1000)}</b> {u("sec")}</span>
            </div>
            <div className="qz-timer"><i className={pct < 25 ? "warn" : ""} style={{ width: `${pct}%` }} /></div>
            <h2 className="qz-q">{t(q.text, lang)}</h2>
            <div className="qz-opts">
              {q.options.map((o, i) => {
                let cls = "qz-opt";
                if (picked !== null || left === 0) {
                  if (i === q.correct) cls += " ok";
                  else if (i === picked) cls += " bad";
                  else cls += " dim";
                }
                return (
                  <button key={i} className={cls} disabled={picked !== null} onClick={() => answer(i)}>
                    <span className="k">{LETTERS[i]}</span>
                    <span>{t(o, lang)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "sending" && (
          <div className="qz-card qz-result">
            <div className="qz-spin" />
            <p className="qz-note">{u("sending")}</p>
          </div>
        )}

        {step === "failed" && (
          <div className="qz-card qz-result">
            <p className="qz-note">{u("failed")}</p>
            <button className="qz-btn" onClick={submit}>{u("retry")}</button>
          </div>
        )}

        {step === "done" && result && (
          <div className="qz-card qz-result">
            <p className="qz-eyebrow">{result.score === result.max ? u("great") : result.score >= Math.ceil(result.max * 0.6) ? u("good") : u("ok")}</p>
            <div className="qz-big">{result.score}<small> / {result.max}</small></div>
            <p className="qz-sub" style={{ marginBottom: 0 }}>{u("correct")}</p>
            <div className="qz-stats">
              <div className="qz-stat"><b>{fmtTime(result.total_ms)} {u("sec")}</b><span>{u("time")}</span></div>
              <div className="qz-stat"><b>#{result.rank}</b><span>{u("place")} · {result.total} {lang === "hy" ? "խաղացողից" : lang === "ru" ? "из " + result.total : u("of") + " " + result.total}</span></div>
            </div>
            {!result.best && <p className="qz-note">{u("notBest")} ({result.bestScore}/{result.max}, {fmtTime(result.bestMs || 0)} {u("sec")})</p>}
            <p className="qz-note">{u("watch")}</p>
            <button className="qz-btn ghost" onClick={() => { setStep("start"); setResult(null); }}>{u("again")}</button>
          </div>
        )}

        <div className="qz-foot">hospit.am · Smart Healthcare Automation</div>
      </div>
    </div>
  );
}
