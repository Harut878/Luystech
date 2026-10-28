"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import "./site.css";
import Icon from "./Icon";

// Գնային հաշվիչը ծանր է (jspdf/html-to-image) — բեռնում ենք միայն թաբը բացելիս
const PricingCalc = dynamic(() => import("./PricingCalc"), { ssr: false, loading: () => <div style={{ minHeight: "70vh" }} /> });
import type { SiteContent, Lang, ML, LangTexts, IconKey, AppRole } from "@/lib/types";
import { homeFor } from "@/lib/account";

const MARK_FALLBACK = "/uploads/logo-mark.png";
const WORDMARK_FALLBACK = "/uploads/logo-wordmark.png";
const PREVIEW_FALLBACK = "/uploads/preview-cards.png";
const PARTNERS_BG_FALLBACK = "/uploads/partners-bg.png";

type PageId = "home" | "services" | "partners" | "pricing" | "about" | "whyus" | "contact";
const LANG_ORDER: Lang[] = ["en", "hy", "ru"];

// ── Count-up number (animates leading integer group on reveal) ──
function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^(\d[\d,]*)(.*)$/s);
    if (!m) { setShown(value); return; }
    const target = parseInt(m[1].replace(/,/g, ""), 10);
    const suffix = m[2];
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !Number.isFinite(target)) { setShown(value); return; }
    let done = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !done) {
          done = true;
          const dur = 1100; const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const cur = Math.round(target * eased);
            setShown(cur.toLocaleString("en-US") + suffix);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{shown}</span>;
}

// ── Flying logo hero visual ──
function FlyingLogo({ src }: { src?: string }) {
  return (
    <div className="flying-logo-stage">
      <div className="fl-glow" />
      <div className="fl-orbit fl-orbit-1" />
      <div className="fl-orbit fl-orbit-2" />
      {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={`fl-particle fl-particle-${i}`} />)}
      <div className="fl-logo-wrap"><img src={src || MARK_FALLBACK} alt="HospIT" className="fl-logo" /></div>
      <div className="fl-shadow" />
    </div>
  );
}

// ── ECG hero line ──
function EcgLine() {
  const beat = "M0,40 L30,40 L35,36 L38,44 L41,40 L55,40 L58,4 L62,76 L65,40 L72,30 L76,40 L110,40";
  const path = `${beat} l110,0 ${beat.replace(/M\d+,\d+ /, "")} l220,0 ${beat.replace(/M\d+,\d+ /, "")}`;
  return (
    <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, pointerEvents: "none", zIndex: 0, opacity: 0.18 }}>
      <svg viewBox="0 0 900 80" width="100%" height={80} preserveAspectRatio="xMidYMid meet" fill="none">
        <path className="ecg-path" d={path} stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ── Connected-healthcare network SVG ──
function ConnectedNetwork({ t }: { t: LangTexts }) {
  const nodes = [
    { id: "hospit", label: "HospIT", cx: 400, cy: 260, r: 52, primary: true },
    { id: "patients", cx: 170, cy: 130, r: 38, icon: "patient" as IconKey, label: t.connected.nodePatients },
    { id: "doctors", cx: 630, cy: 130, r: 38, icon: "stethoscope" as IconKey, label: t.connected.nodeDoctors },
    { id: "labs", cx: 700, cy: 310, r: 38, icon: "lab" as IconKey, label: t.connected.nodeLabs },
    { id: "pharmacy", cx: 560, cy: 430, r: 38, icon: "pill" as IconKey, label: t.connected.nodePharmacy },
    { id: "records", cx: 240, cy: 430, r: 38, icon: "records" as IconKey, label: t.connected.nodeRecords },
    { id: "analytics", cx: 100, cy: 310, r: 38, icon: "chart" as IconKey, label: t.connected.nodeAnalytics },
  ];
  const center = nodes[0];
  const spokes = nodes.slice(1).map((n) => ({ from: center, to: n }));
  return (
    <div className="fade" data-reveal style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
      <svg viewBox="0 0 800 545" width="100%" style={{ overflow: "visible", display: "block" }}>
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx={center.cx} cy={center.cy} r="90" fill="url(#centerGlow)">
          <animate attributeName="r" values="80;100;80" dur="3s" repeatCount="indefinite" />
        </circle>
        {spokes.map(({ from, to }) => (
          <line key={to.id} x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy} stroke="var(--accent)" strokeWidth="1" strokeDasharray="6 4" opacity="0.25" />
        ))}
        {spokes.map(({ from, to }, i) => {
          const id = `pulse-${to.id}`;
          return (
            <g key={id}>
              <path id={id} d={`M${from.cx},${from.cy} L${to.cx},${to.cy}`} fill="none" stroke="none" />
              <circle r="4" fill="var(--accent)" opacity="0.9">
                <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${i * 0.38}s`}><mpath href={`#${id}`} /></animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.38}s`} />
              </circle>
            </g>
          );
        })}
        {nodes.slice(1).map((n, i) => (
          <g key={n.id}>
            <circle cx={n.cx} cy={n.cy} r={n.r} fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
            <circle cx={n.cx} cy={n.cy} r={n.r} fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4">
              <animate attributeName="r" values={`${n.r};${n.r + 6};${n.r}`} dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <foreignObject x={n.cx - 12} y={n.cy - 12} width="24" height="24">
              <div style={{ color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={n.icon!} size={22} /></div>
            </foreignObject>
            {/* Անվանումը՝ շրջանակից ԴՈՒՐՍ (տակը)՝ որ երկար հայերեն բառերը տեղավորվեն։
                Տառաչափը կառավարվում է CSS-ով (SVG-ն մոբայլում փոքրանում է) */}
            <text className="hp-net-label" x={n.cx} y={n.cy + n.r + 22} textAnchor="middle" fontWeight="600"
              fill="var(--text-2)" fontFamily="'Noto Sans Armenian','Noto Sans',sans-serif">{n.label}</text>
          </g>
        ))}
        <circle cx={center.cx} cy={center.cy} r={center.r} fill="var(--accent)" filter="url(#glow)" />
        <text x={center.cx} y={center.cy + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff" fontFamily="Noto Sans, sans-serif">HospIT</text>
        <circle cx={center.cx} cy={center.cy} r={center.r} fill="none" stroke="#fff" strokeWidth="2" opacity="0">
          <animate attributeName="r" values={`${center.r};${center.r + 40}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

function VideoBlock({ title }: { title: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="video-frame" style={{ aspectRatio: "16/9", position: "relative" }}>
      <div className="media-placeholder" style={{ position: "absolute", inset: 0, borderRadius: 0 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="8" stroke="var(--text-muted)" strokeWidth="1.5" /><path d="M18 16l16 8-16 8V16z" fill="var(--text-muted)" /></svg>
        <span style={{ marginTop: 8, fontSize: 12 }}>{title}</span>
      </div>
      <button className="video-play-btn" onClick={() => setPlaying(!playing)}>
        {playing
          ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="4" height="14" rx="1" fill="var(--accent)" /><rect x="12" y="3" width="4" height="14" rx="1" fill="var(--accent)" /></svg>
          : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4l12 6-12 6V4z" fill="var(--accent)" /></svg>}
      </button>
    </div>
  );
}

const CHECK = <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

// me — մուտք գործա՞ծ է (սերվերից). միայն կոճակի տեքստի/հղման համար, թույլտվությունը ստուգում է սերվերը
export default function Home({ content, me = null }: { content: SiteContent; me?: AppRole | null }) {
  const s = content.settings;
  const [page, setPage] = useState<PageId>("home");
  const [lang, setLangState] = useState<Lang>(s.default_lang);
  const [theme, setTheme] = useState<"dark" | "light">(s.default_theme);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const navRowRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const [navMode, setNavMode] = useState<"full" | "tight" | "burger">("full");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const navCompact = navMode === "burger";
  const navGap = navMode === "tight" ? 16 : 30;
  const logoGap = navMode === "tight" ? 16 : 36;

  const t = content.texts[lang];
  const accountLabel = me === "admin" ? t.nav.admin : me ? t.nav.account : t.nav.login;
  const logoSrc = s.logo_url || WORDMARK_FALLBACK;
  const heroImg = s.hero_image_url || MARK_FALLBACK;
  const previewSrc = s.preview_image_url || PREVIEW_FALLBACK;
  const partnersBg = s.partners_bg_url || PARTNERS_BG_FALLBACK;
  const ml = (m: ML) => m[lang];

  // init from localStorage
  useEffect(() => {
    try {
      const sl = localStorage.getItem("hospit_lang") as Lang | null;
      const st = localStorage.getItem("hospit_theme") as "dark" | "light" | null;
      if (sl && LANG_ORDER.includes(sl)) setLangState(sl);
      if (st === "dark" || st === "light") setTheme(st);
    } catch {}
  }, []);

  const changeLang = useCallback((l: Lang) => {
    setLangState(l); setMenuOpen(false);
    try { localStorage.setItem("hospit_lang", l); } catch {}
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((prev) => { const next = prev === "dark" ? "light" : "dark"; try { localStorage.setItem("hospit_theme", next); } catch {} return next; });
  }, []);

  // accent hue + section spacing → CSS vars
  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const h = s.accent_hue;
    el.style.setProperty("--accent", `oklch(62% 0.18 ${h})`);
    el.style.setProperty("--accent-mid", `oklch(55% 0.18 ${h})`);
    el.style.setProperty("--accent-glow", `oklch(62% 0.18 ${h} / 18%)`);
    el.style.setProperty("--accent-glow2", `oklch(62% 0.18 ${h} / 8%)`);
    const sp = s.section_spacing === "compact" ? "80px" : s.section_spacing === "spacious" ? "160px" : "120px";
    el.style.setProperty("--section-spacing", sp);
  }, [s.accent_hue, s.section_spacing]);

  // scroll lock on mobile menu
  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen]);

  // Nav-ը ինքնաշխատ անցնում է hamburger-ի, երբ կետերը չեն տեղավորվում (ցանկացած լեզվում)
  useEffect(() => {
    const row = navRowRef.current, probe = probeRef.current;
    if (!row || !probe) return;
    const measure = () => {
      const avail = row.clientWidth;
      const items = Array.from(probe.querySelectorAll<HTMLElement>(".nav-link"));
      if (!avail || !items.length) return;
      const textW = items.reduce((a, el) => a + el.getBoundingClientRect().width, 0);
      const n = items.length;
      // logo+լուսանցք | կետեր+բացվածքներ | լեզու+թեմա+կոճակ (+շնչելու տարածք)
      const needFull = 195 + textW + (n - 1) * 30 + 290;
      const needTight = 175 + textW + (n - 1) * 16 + 275;
      setNavMode(needFull <= avail ? "full" : needTight <= avail ? "tight" : "burger");
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    // տառատեսակը բեռնվելուց հետո լայնությունները փոխվում են
    (document as any).fonts?.ready?.then(measure).catch(() => {});
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [lang]);

  // hamburger-ից desktop անցնելիս մենյուն փակվում է
  useEffect(() => { if (!navCompact) setMenuOpen(false); }, [navCompact]);

  // reveal observer (re-run on page/lang change)
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const el = en.target as HTMLElement;
          el.classList.add("shown");
          if (el.hasAttribute("data-stagger")) {
            Array.from(el.children).forEach((c, i) => { (c as HTMLElement).style.transitionDelay = `${Math.min(i * 70, 480)}ms`; });
          }
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    root.querySelectorAll(".reveal,.fade,[data-stagger]").forEach((el) => io.observe(el));
    // safety: reveal anything already in view
    setTimeout(() => {
      root.querySelectorAll(".reveal,.fade").forEach((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("shown");
      });
    }, 60);
    return () => io.disconnect();
  }, [page, lang]);

  // scroll: nav bg, progress bar, scroll-top btn
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || 0;
        setScrolled(y > 24); setShowTop(y > 400);
        const doc = document.documentElement; const max = doc.scrollHeight - doc.clientHeight;
        if (progRef.current) progRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const nav = useCallback((id: PageId) => { setPage(id); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const navItems: [PageId, string][] = [
    ["home", t.nav.home], ["services", t.nav.services], ["partners", t.nav.partners],
    ["pricing", t.nav.pricing], ["about", t.nav.about], ["whyus", t.nav.whyus], ["contact", t.nav.contact],
  ];

  // ── Tilt handlers for cards ──
  const tiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget; const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-4px)`;
  };
  const tiltLeave = (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = ""; };

  return (
    <div ref={rootRef} className="hp-root" data-theme={theme}>
      <div ref={progRef} className="hp-progress" />

      {/* ═══════ NAVBAR ═══════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 900,
        transition: "background .3s ease, border-color .3s ease, box-shadow .3s ease",
        backdropFilter: scrolled || menuOpen ? "blur(24px) saturate(1.6)" : "none",
        WebkitBackdropFilter: scrolled || menuOpen ? "blur(24px) saturate(1.6)" : "none",
        background: scrolled || menuOpen ? "var(--bg-nav)" : "transparent",
        borderBottom: `1px solid ${scrolled || menuOpen ? "var(--border)" : "transparent"}`,
        boxShadow: scrolled || menuOpen ? "var(--shadow-sm)" : "none",
      }}>
        <div className="hp-navwrap">
          {/* Անտեսանելի չափիչ՝ որոշում է՝ տեղավորվու՞մ են nav-ի կետերը (լեզուն փոխում է երկարությունը) */}
          <div ref={probeRef} aria-hidden="true" style={{
            position: "absolute", visibility: "hidden", pointerEvents: "none", height: 0, overflow: "hidden",
            display: "flex", alignItems: "center", whiteSpace: "nowrap", gap: 0,
          }}>
            {navItems.map(([id, label]) => (<span key={id} className="nav-link" style={{ whiteSpace: "nowrap" }}>{label}</span>))}
          </div>
          <div ref={navRowRef} style={{ display: "flex", alignItems: "center", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0, marginRight: logoGap }} onClick={() => nav("home")}>
              <img src={logoSrc} alt="HospIT" style={{ height: 32, width: "auto", display: "block" }} />
            </div>
            <div style={{ display: navCompact ? "none" : "flex", alignItems: "center", gap: navGap, flex: 1, minWidth: 0 }}>
              {navItems.map(([id, label]) => (
                <button key={id} className={`nav-link${page === id ? " active" : ""}`} onClick={() => nav(id)} style={{ whiteSpace: "nowrap" }}>{label}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
              <div style={{ display: navCompact ? "none" : "block" }}><LangSwitcher lang={lang} setLang={changeLang} /></div>
              <button onClick={toggleTheme} aria-label="Theme" style={iconBtn}>
                {theme === "light"
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" fill="var(--text-2)" /><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.06 1.06M11.84 11.84l1.06 1.06M3.1 12.9l1.06-1.06M11.84 4.16l1.06-1.06" stroke="var(--text-2)" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007-4z" fill="var(--text-2)" /></svg>}
              </button>
              {/* Մուտք / անձնական էջ (ադմինը՝ ադմինկա, հաճախորդը՝ իր էջը) */}
              <a href={me ? homeFor(me) : "/login"} className="btn btn-ghost btn-sm" style={{ display: navCompact ? "none" : "inline-flex", textDecoration: "none" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>{accountLabel}</a>
              <button style={{ ...iconBtn, display: navCompact ? "flex" : "none" }} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                {menuOpen
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" /></svg>}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div style={{ paddingBottom: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              {navItems.map(([id, label]) => (
                <button key={id} onClick={() => nav(id)} style={{
                  background: page === id ? "var(--accent-glow)" : "transparent", border: "none", borderRadius: 10,
                  padding: "12px 16px", textAlign: "left", width: "100%", fontSize: 15, fontWeight: 500,
                  color: page === id ? "var(--accent)" : "var(--text)", cursor: "pointer", fontFamily: "inherit",
                }}>{label}</button>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                <LangSwitcher lang={lang} setLang={changeLang} />
                <a href={me ? homeFor(me) : "/login"} className="btn btn-primary btn-sm" style={{ marginLeft: "auto", textDecoration: "none" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>{accountLabel}</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main style={{ minHeight: "100vh" }}>
        {page === "home" && <HomePage t={t} lang={lang} content={content} nav={nav} ml={ml} tilt={{ tiltMove, tiltLeave }} heroImg={heroImg} previewSrc={previewSrc} />}
        {page === "services" && <ServicesPage t={t} content={content} nav={nav} ml={ml} />}
        {page === "partners" && <PartnersPage t={t} content={content} partnersBg={partnersBg} />}
        {page === "pricing" && <PricingCalc config={s.pricing} phone={s.phone} email={s.email} />}
        {page === "about" && <AboutPage t={t} content={content} ml={ml} />}
        {page === "whyus" && <WhyUsPage t={t} content={content} nav={nav} ml={ml} />}
        {page === "contact" && <ContactPage t={t} settings={s} ml={ml} />}
      </main>

      <Footer t={t} nav={nav} settings={s} logoSrc={logoSrc} onPrivacy={() => setShowPrivacy(true)} />

      {showPrivacy && (
        <div role="dialog" aria-modal="true" onClick={() => setShowPrivacy(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(6,12,22,0.6)", backdropFilter: "blur(4px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(720px,100%)", maxHeight: "85vh", overflowY: "auto", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-lg)", padding: "clamp(24px,4vw,40px)" }}>
            <button onClick={() => setShowPrivacy(false)} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", border: "none", background: "var(--bg-alt)", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
            <h3 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, color: "var(--text)", marginBottom: 18, paddingRight: 44 }}>{t.footer.privacy}</h3>
            <div style={{ fontSize: 15, lineHeight: 1.75, color: "var(--text-2)", whiteSpace: "pre-wrap" }}>{ml(s.privacy)}</div>
          </div>
        </div>
      )}

      <button className={`hp-scrolltop${showTop ? " visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Top">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 14V4M4 9l5-5 5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: "50%", background: "var(--bg-alt)", border: "1px solid var(--border)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
};

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 100, padding: 3, gap: 2 }}>
      {LANG_ORDER.map((l) => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: "4px 9px", borderRadius: 100, border: "none",
          background: lang === l ? "var(--accent)" : "transparent", color: lang === l ? "#fff" : "var(--text-muted)",
          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase",
        }}>{l}</button>
      ))}
    </div>
  );
}

// ═══════════════════════ HOME ═══════════════════════
function HomePage({ t, lang, content, nav, ml, tilt, heroImg, previewSrc }: {
  t: LangTexts; lang: Lang; content: SiteContent; nav: (id: PageId) => void; ml: (m: ML) => string;
  tilt: { tiltMove: (e: React.MouseEvent<HTMLDivElement>) => void; tiltLeave: (e: React.MouseEvent<HTMLDivElement>) => void };
  heroImg: string; previewSrc: string;
}) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [openInteg, setOpenInteg] = useState<string | null>(null);
  // Հայերեն/ռուսերեն վերնագրերն ավելի երկար են՝ մի քիչ փոքրացնում ենք տառաչափը
  const heroTitleStyle: React.CSSProperties = lang === "en"
    ? { marginBottom: 24 }
    : { marginBottom: 24, fontSize: "clamp(30px, 3.4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em" };
  return (
    <div className="page-enter">
      {/* HERO */}
      <section className="r-hero-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", paddingTop: 96, paddingBottom: 80 }}>
        <EcgLine />
        <div className="hero-bg">
          <div className="hero-orb" style={{ width: 700, height: 700, top: -200, left: "40%", background: "var(--accent-glow)" }} />
          <div className="hero-orb" style={{ width: 500, height: 500, bottom: -100, left: -100, background: "var(--accent-glow2)", animationDelay: "2s", animationDirection: "alternate-reverse" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="r-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="hero-head">
                <div className="hero-head-text">
                  <div className="eyebrow reveal shown" style={{ marginBottom: 20 }}>{t.hero.eyebrow}</div>
                  <h1 className="display-title hero-title reveal shown" style={heroTitleStyle}>{t.hero.title}</h1>
                </div>
                <div className="hero-logo-mobile"><FlyingLogo src={heroImg} /></div>
              </div>
              <p className="body-lg reveal shown" style={{ marginBottom: 40, maxWidth: 480 }}>{t.hero.body}</p>
              <div className="reveal shown" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={() => nav("services")}>{t.hero.cta2}</button>
              </div>
              <div className="reveal shown hero-stats" style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--border)" }}>
                {[[t.hero.stat1n, t.hero.stat1l], [t.hero.stat2n, t.hero.stat2l], [t.hero.stat3n, t.hero.stat3l]].map(([n, l]) => (
                  <div key={l}><div className="stat-num" style={{ fontSize: 32 }}><Counter value={n} /></div><div className="stat-label">{l}</div></div>
                ))}
              </div>
            </div>
            <div className="fade shown hero-logo-desktop"><FlyingLogo src={heroImg} /></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "var(--bg-alt)", padding: "var(--section-spacing) 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.feat.eyebrow}</div>
            <h2 className="section-title reveal" style={{ marginBottom: 16 }}>{t.feat.title}</h2>
            <p className="body-lg reveal">{t.feat.body}</p>
          </div>
          <div className="r-feat-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {content.features.map((f) => (
              <div key={f.id} className="card reveal tilt" style={{ padding: 32 }} onMouseMove={tilt.tiltMove} onMouseLeave={tilt.tiltLeave}>
                <div className="feature-icon" style={{ marginBottom: 20 }}><Icon name={f.icon} size={24} /></div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 10 }}>{ml(f.title)}</div>
                <div style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text-2)" }}>{ml(f.desc)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED BY (clients) */}
      {content.clients.length > 0 && (
        <section style={{ padding: "var(--section-spacing) 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.trusted.eyebrow}</div>
              <h2 className="section-title reveal" style={{ marginBottom: 16 }}>{t.trusted.title}</h2>
              <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 560 }}>{t.trusted.body}</p>
            </div>
            {/* Միշտ սահող շերտ (ձախից աջ)՝ նոր հաստատություն ավելացնելիս նոր տող չի առաջանում */}
            <div className="logo-marquee-wrap fade hp-clients-strip">
              <div className="logo-marquee" style={{ gap: 72, alignItems: "flex-start", animationDuration: `${Math.max(28, content.clients.length * 7)}s` }}>
                {[0, 1].map((set) => content.clients.map((c) => (
                  <div key={`${set}-${c.id}`} title={c.name} className="hp-client-item">
                    <div className="hp-client-logo">
                      {c.logo_url
                        ? <img src={c.logo_url} alt={c.name} loading="lazy" decoding="async" />
                        : <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-2)", textAlign: "center" }}>{c.name}</span>}
                    </div>
                    <span className="hp-client-name">{c.name}</span>
                  </div>
                )))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PRODUCT PREVIEW */}
      <section style={{ padding: "var(--section-spacing) 0" }}>
        <div className="container">
          <div className="r-preview-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div className="fade preview-mockup-desktop">
              <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 24, padding: 12, boxShadow: "var(--shadow-lg)" }}>
                <img src={previewSrc} alt={t.preview.title} loading="lazy" decoding="async" style={{ width: "100%", height: "auto", display: "block", borderRadius: 14 }} />
              </div>
            </div>
            <div>
              <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.preview.eyebrow}</div>
              <h2 className="section-title reveal" style={{ marginBottom: 24 }}>{t.preview.title}</h2>
              <p className="body-lg reveal" style={{ marginBottom: 40 }}>{t.preview.body}</p>
              <div className="preview-mockup-mobile fade" style={{ marginBottom: 40 }}>
                <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 24, padding: 10, boxShadow: "var(--shadow-lg)" }}>
                  <img src={previewSrc} alt={t.preview.title} loading="lazy" decoding="async" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12 }} />
                </div>
              </div>
              <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                {[[t.preview.p1t, t.preview.p1s], [t.preview.p2t, t.preview.p2s], [t.preview.p3t, t.preview.p3s]].map(([title, sub]) => (
                  <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{CHECK}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="reveal">
                {content.settings.demo_url ? (
                  <a className="btn btn-primary" href={content.settings.demo_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    {t.preview.cta}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3h7v7M13 3L4 12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                ) : (
                  <button className="btn btn-primary" onClick={() => nav("services")}>{t.preview.cta}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONNECTED */}
      <section style={{ padding: "var(--section-spacing) 0", background: "var(--bg-alt)", overflow: "hidden" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.connected.eyebrow}</div>
            <h2 className="section-title reveal" style={{ marginBottom: 16 }}>{t.connected.title}</h2>
            <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 520 }}>{t.connected.body}</p>
          </div>
          <ConnectedNetwork t={t} />
          <div className="reveal hp-conn-chips" data-stagger style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
            {[[t.connected.chip1t, t.connected.chip1s], [t.connected.chip2t, t.connected.chip2s], [t.connected.chip3t, t.connected.chip3s]].map(([title, sub]) => (
              <div key={title} className="hp-conn-chip" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, animation: "pulseRing 2s ease infinite" }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ padding: "var(--section-spacing) 0" }}>
        <div className="container">
          <div className="r-why-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.whyHome.eyebrow}</div>
              <h2 className="section-title reveal" style={{ marginBottom: 24 }}>{t.whyHome.title}</h2>
              <p className="body-lg reveal" style={{ marginBottom: 40 }}>{t.whyHome.body}</p>
              <div className="reveal"><button className="btn btn-primary" onClick={() => nav("whyus")}>{t.whyHome.cta}</button></div>
            </div>
            <div className="r-chips-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[t.whyHome.item1, t.whyHome.item2, t.whyHome.item3, t.whyHome.item4, t.whyHome.item5, t.whyHome.item6].map((item) => (
                <div key={item} className="value-chip reveal">
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{CHECK}</div>
                  <span style={{ fontSize: 15.5, lineHeight: 1.45 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      {content.integrations.length > 0 && (
        <section style={{ padding: "var(--section-spacing) 0", background: "var(--bg-alt)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.integrations.eyebrow}</div>
              <h2 className="section-title reveal" style={{ marginBottom: 16 }}>{t.integrations.title}</h2>
              <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 620 }}>{t.integrations.body}</p>
            </div>
            <div className="r-integ-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {content.integrations.map((it) => {
                const open = openInteg === it.id;
                return (
                  <div key={it.id} className="card reveal" style={{ padding: 0, overflow: "hidden", cursor: "pointer", gridColumn: open ? "1 / -1" : undefined, transition: "none" }}
                    onClick={() => setOpenInteg(open ? null : it.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 24 }}>
                      <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 14, background: "var(--bg-alt)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {it.logo_url
                          ? <img src={it.logo_url} alt={it.name} loading="lazy" decoding="async" style={{ maxWidth: "78%", maxHeight: "78%", objectFit: "contain" }} />
                          : <span style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>{it.name.slice(0, 2)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--text)" }}>{it.name}</div>
                        <div style={{ fontSize: 13, color: "var(--accent)", marginTop: 3, fontWeight: 500 }}>{t.integrations.learnMore}</div>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .25s ease" }}>
                        <path d="M5 8l5 5 5-5" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {open && (
                      <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border)" }}>
                        <p className="body-md" style={{ paddingTop: 18 }}>{ml(it.desc)}</p>
                        {it.link && (
                          <a href={it.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 14, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
                            {t.integrations.visit}
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3h7v7M13 3L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {content.faqs.length > 0 && (
        <section style={{ padding: "var(--section-spacing) 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.faq.eyebrow}</div>
              <h2 className="section-title reveal" style={{ marginBottom: 16 }}>{t.faq.title}</h2>
              <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 620 }}>{t.faq.body}</p>
            </div>
            <div className="reveal" style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {content.faqs.map((f) => {
                const open = openFaq === f.id;
                return (
                  <div key={f.id} style={{ background: "var(--bg-card)", border: `1px solid ${open ? "var(--accent)" : "var(--border)"}`, borderRadius: 16, overflow: "hidden", transition: "border-color .2s ease" }}>
                    <button onClick={() => setOpenFaq(open ? null : f.id)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 24px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", lineHeight: 1.45 }}>{ml(f.question)}</span>
                      <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: open ? "var(--accent)" : "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s ease" }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(45deg)" : "none", transition: "transform .25s ease" }}>
                          <path d="M8 3v10M3 8h10" stroke={open ? "#fff" : "var(--text-2)"} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    {open && <div style={{ padding: "0 24px 22px" }}><p className="body-md" style={{ maxWidth: 720 }}>{ml(f.answer)}</p></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      <section style={{ padding: "80px 0", background: "var(--bg-alt)" }}>
        <div className="container">
          <div className="r-stats-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, background: "var(--border)", borderRadius: 24, overflow: "hidden" }}>
            {[[t.stats.s1n, t.stats.s1l], [t.stats.s2n, t.stats.s2l], [t.stats.s3n, t.stats.s3l], [t.stats.s4n, t.stats.s4l]].map(([n, l]) => (
              <div key={l} className="reveal" style={{ background: "var(--bg-card)", padding: "48px 40px", textAlign: "center" }}>
                <div className="stat-num" style={{ color: "var(--accent)", marginBottom: 8 }}><Counter value={n} /></div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-2)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "var(--section-spacing) 0" }}>
        <div className="container">
          <div className="reveal r-cta-banner" style={{ background: "var(--accent)", borderRadius: 24, padding: "72px 80px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.06)", top: -150, right: -100 }} />
            <div style={{ position: "relative" }}>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: 12 }}>{t.cta.title}</h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", maxWidth: 500 }}>{t.cta.body}</p>
            </div>
            <div style={{ display: "flex", gap: 16, position: "relative", flexShrink: 0 }}>
              <button className="btn" style={{ background: "#fff", color: "var(--accent)", padding: "14px 30px", fontSize: 15, fontWeight: 700 }} onClick={() => nav("contact")}>{t.cta.btn1}</button>
              <button className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "14px 30px", fontSize: 15, fontWeight: 600, border: "1.5px solid rgba(255,255,255,0.3)" }} onClick={() => nav("services")}>{t.cta.btn2}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════ SERVICES ═══════════════════════
function ServicesPage({ t, content, nav, ml }: { t: LangTexts; content: SiteContent; nav: (id: PageId) => void; ml: (m: ML) => string }) {
  return (
    <div className="page-enter">
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: "center" }}>
        <div className="container">
          <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.svcPage.eyebrow}</div>
          <h1 className="section-title reveal" style={{ marginBottom: 20 }}>{t.svcPage.title}</h1>
          <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 580 }}>{t.svcPage.body}</p>
        </div>
      </section>
      <section style={{ paddingBottom: 80 }}>
        <div className="container">
          <div className="r-svc-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }}>
            {content.services.map((sv) => (
              <div key={sv.id} className="card reveal" style={{ padding: 32, display: "flex", flexDirection: "column" }}>
                <div className="feature-icon" style={{ marginBottom: 20 }}><Icon name={sv.icon} size={24} /></div>
                <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 10 }}>{ml(sv.title)}</div>
                <div style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text-2)", marginBottom: 20, flex: 1 }}>{ml(sv.desc)}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  {ml(sv.bullets).split("\n").filter(Boolean).map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{CHECK}</div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background: "var(--bg-alt)", padding: "100px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.svcPage.demoEyebrow}</div>
            <h2 className="section-title reveal" style={{ marginBottom: 16 }}>{t.svcPage.demoTitle}</h2>
            <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 520 }}>{t.svcPage.demoBody}</p>
          </div>
          <div className="r-vid-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[[t.svcPage.vid1t, t.svcPage.vid1s], [t.svcPage.vid2t, t.svcPage.vid2s], [t.svcPage.vid3t, t.svcPage.vid3s]].map(([title, sub]) => (
              <div key={title} className="reveal">
                <VideoBlock title={title} />
                <div style={{ marginTop: 16, fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{title}</div>
                <div style={{ marginTop: 4, fontSize: 14, color: "var(--text-muted)" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: "100px 0", textAlign: "center" }}>
        <div className="container">
          <div className="reveal">
            <h2 className="section-title" style={{ marginBottom: 20 }}>{t.svcPage.ctaTitle}</h2>
            <p className="body-lg" style={{ margin: "0 auto 40px", maxWidth: 480 }}>{t.svcPage.ctaBody}</p>
            <button className="btn btn-primary" onClick={() => nav("contact")}>{t.svcPage.ctaBtn}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════ PARTNERS ═══════════════════════
function PartnersPage({ t, content, partnersBg }: { t: LangTexts; content: SiteContent; partnersBg: string }) {
  const emojis = [t.parPage.val1e, t.parPage.val2e, t.parPage.val3e];
  const vals = [[t.parPage.val1t, t.parPage.val1d], [t.parPage.val2t, t.parPage.val2d], [t.parPage.val3t, t.parPage.val3d]];
  return (
    <div className="page-enter">
      <section style={{ paddingTop: 140, paddingBottom: 100, textAlign: "center", position: "relative", overflow: "hidden", minHeight: 440, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-around", opacity: 0.08, pointerEvents: "none", zIndex: 0 }}>
          {[0, 1, 2].map((row) => (
            <div key={row} className="logo-marquee-wrap" style={{ overflow: "hidden" }}>
              <div className="logo-marquee" style={{ gap: 0, animationDuration: row % 2 === 0 ? "22s" : "28s", animationDirection: row % 2 === 0 ? "normal" : "reverse" }}>
                {[0, 1, 2].map((n) => (
                  <img key={n} src={partnersBg} alt="" loading="lazy" decoding="async" className="partners-bg-logo" style={{ height: "clamp(80px, 12vw, 140px)", width: "auto", display: "block", flexShrink: 0 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, var(--bg) 0%, transparent 25%, transparent 75%, var(--bg) 100%)", zIndex: 1 }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.parPage.eyebrow}</div>
          <h1 className="section-title reveal" style={{ marginBottom: 20 }}>{t.parPage.title}</h1>
          <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 560 }}>{t.parPage.body}</p>
        </div>
      </section>

      {/* Գործընկերների լոգոները՝ անընդհատ սահող շերտ (ձախից աջ), ոչ թե տողեր */}
      <section className="hp-partners-strip" style={{ paddingTop: 0, paddingBottom: 80, overflow: "hidden" }}>
        <div className="logo-marquee-wrap">
          <div className="logo-marquee" style={{ gap: 64, alignItems: "center", animationDuration: `${Math.max(24, content.partners.length * 5)}s` }}>
            {[0, 1].map((set) => content.partners.map((p) => (
              p.logo_url
                ? <img key={`${set}-${p.id}`} src={p.logo_url} alt={p.name} loading="lazy" decoding="async" style={{ width: "auto", display: "block", flexShrink: 0, objectFit: "contain" }} />
                : <span key={`${set}-${p.id}`} style={{ flexShrink: 0, fontSize: 18, fontWeight: 700, color: "var(--text-2)", whiteSpace: "nowrap" }}>{p.name}</span>
            )))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-alt)", padding: "100px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.parPage.valEyebrow}</div>
            <h2 className="section-title reveal" style={{ marginBottom: 16 }}>{t.parPage.valTitle}</h2>
          </div>
          <div className="r-partner-val-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {vals.map(([title, desc], i) => (
              <div key={title} className="card reveal" style={{ padding: 36, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 20 }}>{emojis[i]}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Ինտերակտիվ ժամանակագրություն («Մեր պատմությունը») ───
function StoryTimeline({ items, ml }: { items: SiteContent["timeline"]; ml: (m: ML) => string }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const n = items.length;
  if (!n) return null;
  const cur = items[Math.min(active, n - 1)];

  const go = (i: number) => {
    const next = (i + n) % n;
    setActive(next);
    const el = trackRef.current?.querySelectorAll(".hp-tlx-node")[next] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <div className="hp-tlx fade">
      <div className="hp-tlx-track" ref={trackRef} role="tablist"
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(active + 1); if (e.key === "ArrowLeft") go(active - 1); }}>
        <span className="hp-tlx-rail" />
        <span className="hp-tlx-rail-fill" style={{ width: n > 1 ? `${(active / (n - 1)) * 100}%` : "0%" }} />
        {items.map((it, i) => (
          <button key={it.id} type="button" role="tab" aria-selected={i === active}
            className={`hp-tlx-node${i === active ? " on" : ""}${i < active ? " done" : ""}`}
            onClick={() => go(i)}>
            <span className="hp-tlx-dot" />
            <span className="hp-tlx-year">{it.year}</span>
          </button>
        ))}
      </div>

      <div className="hp-tlx-panel" key={cur.id}>
        <span className="hp-tlx-ghost" aria-hidden="true">{cur.year}</span>
        <div className="hp-tlx-body">
          <span className="hp-tlx-badge">{cur.year}</span>
          <h3 className="hp-tlx-title">{ml(cur.title)}</h3>
          <p className="hp-tlx-desc">{ml(cur.desc)}</p>
        </div>
        <div className="hp-tlx-nav">
          <button type="button" className="hp-tlx-arrow" onClick={() => go(active - 1)} aria-label="Prev">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="hp-tlx-count">{active + 1} / {n}</span>
          <button type="button" className="hp-tlx-arrow" onClick={() => go(active + 1)} aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════ ABOUT ═══════════════════════
function AboutPage({ t, content, ml }: { t: LangTexts; content: SiteContent; ml: (m: ML) => string }) {
  return (
    <div className="page-enter">
      <section style={{ paddingTop: 140, paddingBottom: 100, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="hero-bg"><div className="hero-orb" style={{ width: 600, height: 600, top: -200, left: "30%", background: "var(--accent-glow)" }} /></div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.about.eyebrow}</div>
          <h1 className="section-title reveal" style={{ marginBottom: 24 }}>{t.about.title}</h1>
          <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 640 }}>{t.about.body}</p>
        </div>
      </section>

      <section style={{ paddingBottom: 100 }}>
        <div className="container">
          <div className="r-mv-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { label: t.about.missionLabel, title: t.about.missionTitle, desc: t.about.missionDesc, color: "var(--accent)" },
              { label: t.about.visionLabel, title: t.about.visionTitle, desc: t.about.visionDesc, color: "oklch(62% 0.18 145)" },
            ].map(({ label, title, desc, color }) => (
              <div key={label} className="card reveal" style={{ padding: 48 }}>
                <div style={{ width: 48, height: 4, borderRadius: 2, background: color, marginBottom: 28 }} />
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color, marginBottom: 16 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 16, lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-alt)", padding: "100px 0" }}>
        <div className="container">
          {/* Ներածությունը՝ վերևում կենտրոնացված, ժամանակագրությունը՝ ներքևում ամբողջ լայնությամբ */}
          <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 64px" }}>
            <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.about.storyEyebrow}</div>
            <h2 className="section-title reveal" style={{ marginBottom: 24 }}>{t.about.storyTitle}</h2>
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <p className="body-md">{t.about.storyP1}</p>
              <p className="body-md">{t.about.storyP2}</p>
            </div>
          </div>
          <div>
            {/* Ինտերակտիվ ժամանակագրություն՝ ընտրում ես տարին, բովանդակությունը հայտնվում է անիմացիայով */}
            <StoryTimeline items={content.timeline} ml={ml} />
          </div>
        </div>
      </section>

      <section style={{ padding: "100px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.about.valEyebrow}</div>
            <h2 className="section-title reveal">{t.about.valTitle}</h2>
          </div>
          <div className="r-values-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
            {content.values.map((v) => (
              <div key={v.id} className="card reveal" style={{ padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{v.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{ml(v.title)}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{ml(v.desc)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════ WHY US ═══════════════════════
function WhyUsPage({ t, content, nav, ml }: { t: LangTexts; content: SiteContent; nav: (id: PageId) => void; ml: (m: ML) => string }) {
  return (
    <div className="page-enter">
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: "center" }}>
        <div className="container">
          <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.whyPage.eyebrow}</div>
          <h1 className="section-title reveal" style={{ marginBottom: 20 }}>{t.whyPage.title}</h1>
          <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 580 }}>{t.whyPage.body}</p>
        </div>
      </section>
      <section style={{ paddingBottom: 100 }}>
        <div className="container">
          <div className="r-adv-grid" data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }}>
            {content.advantages.map((a) => (
              <div key={a.id} className="card reveal" style={{ padding: 40 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ fontSize: 36 }}>{a.emoji}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--accent)" }}>{a.stat}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginTop: 4, maxWidth: 160 }}>{ml(a.stat_label)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 12 }}>{ml(a.title)}</div>
                <div style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7 }}>{ml(a.desc)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background: "var(--bg-alt)", padding: "100px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.whyPage.cmpEyebrow}</div>
            <h2 className="section-title reveal" style={{ marginBottom: 16 }}>{t.whyPage.cmpTitle}</h2>
            <p className="body-lg reveal" style={{ margin: "0 auto", maxWidth: 480 }}>{t.whyPage.cmpBody}</p>
          </div>
          {(() => {
            const sys = (content.settings.comparison?.systems || []).filter((x) => x.active).sort((a, b) => a.sort - b.sort);
            const rows = (content.settings.comparison?.rows || []).filter((x) => x.active).sort((a, b) => a.sort - b.sort);
            if (!sys.length || !rows.length) return null;
            const cols = `1fr repeat(${sys.length}, minmax(72px, 120px))`;
            const cell = (v: string, hi: boolean) => {
              if (v === "yes") return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill={hi ? "var(--accent)" : "var(--text-2)"} opacity="0.15" /><path d="M5 9l3 3 5-5" stroke={hi ? "var(--accent)" : "var(--text-2)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
              if (v === "no") return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="var(--text-muted)" opacity="0.1" /><path d="M6 6l6 6M12 6l-6 6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" /></svg>;
              if (v === "partial") return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="oklch(75% 0.15 80)" opacity="0.18" /><path d="M5.5 9h7" stroke="oklch(65% 0.15 75)" strokeWidth="2" strokeLinecap="round" /></svg>;
              return <span style={{ fontSize: 12.5, fontWeight: 600, color: hi ? "var(--accent)" : "var(--text-2)" }}>{v}</span>;
            };
            return (
              <div className="reveal r-comparison-wrap" style={{ maxWidth: 760, margin: "0 auto", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
                <div className="hp-cmp-row" style={{ display: "grid", gridTemplateColumns: cols, background: "var(--bg-alt)", borderBottom: "1px solid var(--border)", padding: "16px 24px", gap: 8 }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{t.whyPage.cmpFeature}</div>
                  {sys.map((x) => (
                    <div key={x.id} style={{ fontSize: 13, fontWeight: x.highlight ? 700 : 600, color: x.highlight ? "var(--accent)" : "var(--text-muted)", textAlign: "center", overflowWrap: "break-word" }}>{ml(x.name)}</div>
                  ))}
                </div>
                {rows.map((row, i) => (
                  <div key={row.id} className="hp-cmp-row" style={{ display: "grid", gridTemplateColumns: cols, padding: "14px 24px", gap: 8, borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", background: i % 2 === 0 ? "transparent" : "var(--bg-alt)" }}>
                    <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{ml(row.feature)}</div>
                    {sys.map((x) => (
                      <div key={x.id} style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>{cell(row.values?.[x.id] ?? "no", x.highlight)}</div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>
      <section style={{ padding: "100px 0", textAlign: "center" }}>
        <div className="container">
          <div className="reveal">
            <h2 className="section-title" style={{ marginBottom: 20 }}>{t.whyPage.ctaTitle}</h2>
            <p className="body-lg" style={{ margin: "0 auto 40px", maxWidth: 440 }}>{t.whyPage.ctaBody}</p>
            <button className="btn btn-primary" onClick={() => nav("contact")}>{t.whyPage.ctaBtn}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════ CONTACT ═══════════════════════
function ContactPage({ t, settings, ml }: { t: LangTexts; settings: SiteContent["settings"]; ml: (m: ML) => string }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.map_query)}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) setSent(true);
      else alert("Ուղարկումը ձախողվեց / Sending failed. " + settings.email);
    } catch { alert("Ուղարկումը ձախողվեց / Sending failed. " + settings.email); }
    finally { setLoading(false); }
  }

  const items = [
    { label: t.contact.emailLbl, value: settings.email, href: `mailto:${settings.email}`, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="var(--accent)" strokeWidth="1.5" /><path d="M2 6l7 5 7-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" /></svg> },
    { label: t.contact.phoneLbl, value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}`, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3h4l1.5 4-2 1.5c1 2 3 4 5 5L13 11l4 1.5V16c-8 0-14-6-14-14z" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { label: t.contact.locationLbl, value: ml(settings.address), href: mapsUrl, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 015 5c0 4-5 9-5 9S4 11 4 7a5 5 0 015-5z" stroke="var(--accent)" strokeWidth="1.5" /><circle cx="9" cy="7" r="2" stroke="var(--accent)" strokeWidth="1.5" /></svg> },
  ];

  return (
    <div className="page-enter">
      <section style={{ paddingTop: 140, paddingBottom: 120 }}>
        <div className="container">
          <div className="r-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 80, alignItems: "start" }}>
            <div>
              <div className="eyebrow reveal" style={{ marginBottom: 16 }}>{t.contact.eyebrow}</div>
              <h1 className="section-title reveal" style={{ marginBottom: 24 }}>{t.contact.title}</h1>
              <p className="body-lg reveal" style={{ marginBottom: 48 }}>{t.contact.body}</p>
              <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {items.map(({ label, value, href, icon }) => (
                  <div key={label} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div className="feature-icon" style={{ width: 44, height: 44, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                      <a href={href} target={href.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" style={{ fontSize: 15, color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>{value}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card reveal" style={{ padding: 48 }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "oklch(62% 0.18 145 / 15%)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16l7 7 13-13" stroke="oklch(62% 0.18 145)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{t.contact.successTitle}</h3>
                  <p style={{ fontSize: 15, color: "var(--text-2)" }}>{t.contact.successBody}</p>
                  <button className="btn btn-ghost" style={{ marginTop: 32 }} onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>{t.contact.successAgain}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t.contact.formTitle}</div>
                  <div className="r-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>{t.contact.fName}</label>
                      <input className="input-field" placeholder={t.contact.fNamePh} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                      <label style={labelStyle}>{t.contact.fEmail}</label>
                      <input className="input-field" type="email" placeholder={t.contact.fEmailPh} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{t.contact.fSubject}</label>
                    <input className="input-field" placeholder={t.contact.fSubjectPh} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t.contact.fMessage}</label>
                    <textarea className="input-field" placeholder={t.contact.fMessagePh} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required style={{ minHeight: 120 }} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
                    {loading ? t.contact.fSending : t.contact.fSend}
                    {!loading && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: 8 };

// ═══════════════════════ FOOTER ═══════════════════════
function Footer({ t, nav, settings, logoSrc, onPrivacy }: { t: LangTexts; nav: (id: PageId) => void; settings: SiteContent["settings"]; logoSrc: string; onPrivacy: () => void }) {
  const col = (title: string, links: [string, PageId][]) => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 20 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map(([label, id]) => (
          <button key={id} onClick={() => nav(id)} style={{ background: "none", border: "none", padding: 0, fontSize: 14, color: "var(--text-2)", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>{label}</button>
        ))}
      </div>
    </div>
  );
  const socials = [
    { label: "Instagram", href: settings.instagram, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="var(--text-muted)" strokeWidth="1.8" /><circle cx="12" cy="12" r="5" stroke="var(--text-muted)" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.2" fill="var(--text-muted)" /></svg> },
    { label: "LinkedIn", href: settings.linkedin, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="var(--text-muted)" strokeWidth="1.8" /><path d="M7 10v7M7 7v.5" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" /><path d="M11 17v-4a3 3 0 016 0v4M11 10v7" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { label: "Facebook", href: settings.facebook, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--text-muted)"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg> },
  ];
  return (
    <footer style={{ background: "var(--bg-alt)", borderTop: "1px solid var(--border)", paddingTop: 64, paddingBottom: 40 }}>
      <div className="container">
        <div className="r-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
          <div>
            <div style={{ marginBottom: 16, cursor: "pointer" }} onClick={() => nav("home")}>
              <img src={logoSrc} alt="HospIT" style={{ height: 28, width: "auto", display: "block" }} />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 260 }}>{t.footer.tagline}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {socials.map(({ label, href, icon }) => (
                <a key={label} href={href || "#"} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textDecoration: "none" }}>{icon}</a>
              ))}
            </div>
          </div>
          {col(t.footer.platform, [[t.nav.home, "home"], [t.nav.services, "services"], [t.nav.pricing, "pricing"], [t.nav.partners, "partners"]])}
          {col(t.footer.company, [[t.nav.about, "about"], [t.nav.whyus, "whyus"], [t.nav.contact, "contact"]])}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 20 }}>{t.footer.contactLabel}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={`mailto:${settings.email}`} style={{ fontSize: 14, color: "var(--text-2)", textDecoration: "none" }}>{settings.email}</a>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} style={{ fontSize: 14, color: "var(--text-2)", textDecoration: "none" }}>{settings.phone}</a>
            </div>
          </div>
        </div>
        <div className="divider" style={{ marginBottom: 28 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{t.footer.copy}</span>
          <div style={{ display: "flex", gap: 24 }}>
            <button onClick={onPrivacy} style={{ background: "none", border: "none", padding: 0, fontFamily: "inherit", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{t.footer.privacy}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
