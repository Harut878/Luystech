"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "./site.css";
import Icon from "./Icon";
import { palette } from "./palette";
import type { SiteContent, Lang, ML, IconKey, Module, Story, Partner, LangTexts } from "@/lib/types";
import { sendContact } from "@/lib/api";

const LANG_DEFS: [Lang, string, string][] = [
  ["am", "Հայ", "Հայերեն"],
  ["en", "EN", "English"],
  ["ru", "РУ", "Русский"],
];

export default function Home({ content }: { content: SiteContent }) {
  const s = content.settings;
  const [lang, setLangState] = useState<Lang>(s.default_lang);
  const [theme, setThemeState] = useState<"dark" | "light">(s.default_theme);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [modalModule, setModalModule] = useState<Module | null>(null);
  const [modalStory, setModalStory] = useState<Story | null>(null);
  const [modalPartner, setModalPartner] = useState<Partner | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const t = content.texts[lang];
  const accent = s.accent_yellow ? "var(--yellow)" : "var(--cyan)";
  const isDark = theme !== "light";
  const ml = (m: ML) => m[lang];
  const secOn = (k: string) => (s.sections as Record<string, boolean> | undefined)?.[k] !== false;
  const promoSrc = videoEmbed(s.promo_video ? ml(s.promo_video) : "");
  // Լոգոն ցուցադրվո՞ւմ է ընթացիկ ռեժիմում (dark/light/both)
  const logoShown = (mode?: string) => !mode || mode === "both" || mode === (isDark ? "dark" : "light");
  // Կոճակի տեսանելիությունը որոշվում է ՀԻՄՆԱԿԱՆ լեզվի տեքstով՝ ջնջում ես մեկ անգամ, բոլոր լեզուներում վերանում է։
  const dl = content.texts[s.default_lang] || t;
  const cta = (cur?: string, def?: string) => {
    const label = (cur && cur.trim()) ? cur : (def || "");
    return { on: !!(def && def.trim()), label };
  };

  // init from localStorage
  useEffect(() => {
    try {
      const sl = localStorage.getItem("luystech_lang") as Lang | null;
      const st = localStorage.getItem("luystech_theme") as "dark" | "light" | null;
      if (sl && LANG_DEFS.some((l) => l[0] === sl)) setLangState(sl);
      if (st === "dark" || st === "light") setThemeState(st);
    } catch {}
    setIsMobile(window.innerWidth < 880);
    setReady(true);
    const onResize = () => setIsMobile(window.innerWidth < 880);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setMenuOpen(false);
    try { localStorage.setItem("luystech_lang", l); } catch {}
  }, []);
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem("luystech_theme", next); } catch {}
      return next;
    });
  }, []);

  // apply palette to CSS vars
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const p = palette(theme);
    Object.keys(p).forEach((k) => el.style.setProperty("--" + k, p[k]));
    el.style.background = p.bg;
    el.style.color = p.text;
  }, [theme]);

  // scroll lock on mobile menu or open modal
  useEffect(() => {
    const lock = menuOpen || !!modalModule || !!modalStory || !!modalPartner;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, modalModule, modalStory, modalPartner]);

  // Կայքը միշտ բացվի գլխավորից (վերևից)՝ անկախ bookmark-ի #hash-ից կամ browser-ի scroll-վերականգնումից
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // reveal + stagger observers
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const el = en.target as HTMLElement;
          el.classList.add("shown");
          if (el.hasAttribute("data-stagger")) {
            Array.from(el.children).forEach((c, i) => {
              (c as HTMLElement).style.transitionDelay = `${Math.min(i * 65, 420)}ms`;
            });
          }
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    root.querySelectorAll("[data-reveal],[data-stagger]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lang]);

  // scroll parallax + progress bar
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || 0;
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        if (progRef.current) progRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        if (netRef.current) netRef.current.style.transform = `translateY(${y * 0.22}px)`;
        if (heroRef.current && y < window.innerHeight) {
          heroRef.current.style.transform = `translateY(${y * 0.16}px)`;
          heroRef.current.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.8)));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // particle network canvas
  useEffect(() => {
    const canvas = netRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, raf = 0;
    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const N = Math.max(26, Math.min(70, Math.floor((w * h) / 17000)));
    for (let i = 0; i < N; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28, r: Math.random() * 1.7 + 0.9 });
    let mx = -999, my = -999;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    const onLeave = () => { mx = -999; my = -999; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      const dark = themeRef.current !== "light";
      const lc = dark ? "96,165,250" : "37,99,235";
      const dc = dark ? "125,211,252" : "37,99,235";
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        // gentle attraction to pointer
        const ddx = mx - n.x, ddy = my - n.y, dm = Math.hypot(ddx, ddy);
        if (dm < 160 && dm > 0.01) { n.vx += (ddx / dm) * 0.006; n.vy += (ddy / dm) * 0.006; }
        n.vx = Math.max(-0.6, Math.min(0.6, n.vx)); n.vy = Math.max(-0.6, Math.min(0.6, n.vy));
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 132) { ctx.strokeStyle = `rgba(${lc},${(0.16 * (1 - d / 132)).toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
      for (const n of nodes) { ctx.fillStyle = `rgba(${dc},0.9)`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.2832); ctx.fill(); }
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const langButtons = LANG_DEFS.map(([code, label, full]) => ({
    code, label, full, active: lang === code,
  }));

  return (
    <div ref={rootRef} className={theme === "light" ? "lt lt-light" : "lt"} style={{
      "--bg": palette(theme).bg, background: palette(theme).bg, color: palette(theme).text,
      "--hw": String(s.heading_weight ?? 500), "--bw": String(s.body_weight ?? 400),
      fontFamily: "Inter, 'Noto Sans Armenian', system-ui, sans-serif", fontWeight: "var(--bw)", minHeight: "100vh", overflowX: "hidden",
      visibility: ready ? "visible" : "hidden",
      transition: "background .45s ease, color .45s ease",
    } as React.CSSProperties}>
      <div ref={progRef} className="lt-progress" style={{ width: "100%", transform: "scaleX(0)" }} />

      {/* NAVBAR */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", background: "var(--navbg)", borderBottom: "1px solid var(--border)" }}>
        <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "12px clamp(18px,5vw,32px)", display: "flex", alignItems: "center", gap: 16 }}>
          <a href="#top" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", flex: "none" }}>
            <img src={isDark ? "/assets/mark-dark.png" : "/assets/mark-light.png"} alt="LuysTech" style={{ height: 36, width: "auto", display: "block" }} />
          </a>

          {!isMobile && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: 14 }}>
                <a href="#about" className="lt-nav-link" style={{ fontSize: 14.5, fontWeight: 500 }}>{t.nav.about}</a>
                <a href="#bc" className="lt-nav-link" style={{ fontSize: 14.5, fontWeight: 500 }}>{t.nav.product}</a>
                <a href="#why" className="lt-nav-link" style={{ fontSize: 14.5, fontWeight: 500 }}>{t.nav.why}</a>
                <a href="#industries" className="lt-nav-link" style={{ fontSize: 14.5, fontWeight: 500 }}>{t.nav.industries}</a>
                <a href="#trust" className="lt-nav-link" style={{ fontSize: 14.5, fontWeight: 500 }}>{t.nav.trust}</a>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 2, padding: 3, borderRadius: 9, border: "1px solid var(--border)" }}>
                  {langButtons.map((lb) => (
                    <button key={lb.code} onClick={() => setLang(lb.code)} style={{ border: "none", cursor: "pointer", padding: "5px 9px", borderRadius: 6, fontSize: 12.5, fontWeight: 700, letterSpacing: ".02em", transition: ".2s", background: lb.active ? "var(--blue)" : "transparent", color: lb.active ? "#fff" : "var(--dim)" }}>{lb.label}</button>
                  ))}
                </div>
                <button onClick={toggleTheme} aria-label="Toggle theme" className="lt-theme-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 9, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text)" }}>
                  <ThemeIcon dark={isDark} />
                </button>
                {cta(t.nav.cta, dl.nav.cta).on && <a href={ctaHref(cta(t.nav.cta, dl.nav.cta).label, s.phone)} className="lt-btn" style={{ textDecoration: "none", background: "var(--blue)", color: "#fff", padding: "10px 18px", borderRadius: 9, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "0 8px 24px -8px var(--glow)" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>{cta(t.nav.cta, dl.nav.cta).label}</a>}
              </div>
            </>
          )}

          {isMobile && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={toggleTheme} aria-label="Toggle theme" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 9, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text)" }}>
                <ThemeIcon dark={isDark} />
              </button>
              <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 9, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text)" }}>
                <svg viewBox="0 0 24 24" width={22} height={22} style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" }}>
                  {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          )}
        </nav>

        {isMobile && menuOpen && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "14px clamp(18px,5vw,32px) 22px", display: "flex", flexDirection: "column", gap: 2, animation: "lt-rise .3s ease" }}>
            {[["#about", t.nav.about], ["#bc", t.nav.product], ["#why", t.nav.why], ["#industries", t.nav.industries], ["#trust", t.nav.trust], ["#contact", t.nav.contact]].map(([href, label], i, arr) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{ color: "var(--text)", textDecoration: "none", fontSize: 16, fontWeight: 600, padding: "13px 4px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>{label}</a>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
              {langButtons.map((lb) => (
                <button key={lb.code} onClick={() => setLang(lb.code)} style={{ flex: 1, border: "none", cursor: "pointer", padding: "11px 0", borderRadius: 9, fontSize: 14, fontWeight: 700, background: lb.active ? "var(--blue)" : "transparent", color: lb.active ? "#fff" : "var(--dim)", boxShadow: lb.active ? "none" : "inset 0 0 0 1px var(--border)" }}>{lb.full}</button>
              ))}
            </div>
            {cta(t.nav.cta, dl.nav.cta).on && <a href={ctaHref(cta(t.nav.cta, dl.nav.cta).label, s.phone)} onClick={() => setMenuOpen(false)} style={{ marginTop: 14, textAlign: "center", textDecoration: "none", background: "var(--blue)", color: "#fff", padding: 15, borderRadius: 11, fontSize: 16, fontWeight: 600, boxShadow: "0 12px 30px -10px var(--glow)" }}>{cta(t.nav.cta, dl.nav.cta).label}</a>}
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "clamp(104px,22vw,128px) clamp(18px,5vw,24px) 72px" }}>
        <canvas ref={netRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(900px 540px at 50% 38%, var(--glow), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, var(--bg) 0%, transparent 22%, transparent 70%, var(--bg) 100%)", pointerEvents: "none" }} />
        <FloatShape style={{ top: "22%", left: "11%", width: 64, height: 64, border: "1.5px solid var(--border)", borderRadius: 16, animation: "lt-float 7s ease-in-out infinite" }} />
        <FloatShape style={{ top: "64%", left: "16%", width: 34, height: 34, borderRadius: "50%", background: "var(--cyan)", opacity: 0.14, animation: "lt-bob 5s ease-in-out infinite" }} />
        <FloatShape style={{ top: "30%", right: "13%", width: 48, height: 48, border: "1.5px solid var(--blue)", opacity: 0.5, borderRadius: 12, animation: "lt-float2 9s ease-in-out infinite" }} />
        <FloatShape style={{ top: "70%", right: "18%", width: 10, height: 10, borderRadius: "50%", background: "var(--yellow)", boxShadow: "0 0 18px 4px var(--yellow)", animation: "lt-pulse 3.5s ease-in-out infinite" }} />

        <div ref={heroRef} style={{ position: "relative", zIndex: 3, maxWidth: 880, textAlign: "center" }}>
          <img src={isDark ? "/assets/logo-dark.svg" : "/assets/logo-light.svg"} alt="LuysTech" style={{ height: "clamp(46px,7vw,66px)", width: "auto", display: "block", margin: "0 auto 28px", animation: "lt-rise .7s ease both" }} />
          <div className="lt-badge" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 15px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--card)", fontSize: 13, fontWeight: 600, color: "var(--dim)", marginBottom: 28, animation: "lt-rise .6s ease both" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, boxShadow: `0 0 10px 1px ${accent}`, animation: "lt-blink 2.4s ease-in-out infinite" }} />{t.hero.badge}
          </div>
          <h1 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontWeight: "var(--hw)", fontSize: "clamp(32px,5vw,58px)", lineHeight: 1.22, letterSpacing: "-.02em", margin: "0 0 26px", textWrap: "balance", animation: "lt-rise .7s ease .05s both" } as React.CSSProperties}>{t.hero.title.split("\n").map((ln, i) => (<span key={i}>{i > 0 ? <br /> : null}{ln}</span>))}</h1>
          <p style={{ fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.6, color: "var(--dim)", maxWidth: 640, margin: "0 auto 38px", animation: "lt-rise .7s ease .12s both" }}>{t.hero.subtitle}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "lt-rise .7s ease .18s both" }}>
            {cta(t.hero.ctaPrimary, dl.hero.ctaPrimary).on && <a href={ctaHref(cta(t.hero.ctaPrimary, dl.hero.ctaPrimary).label, s.phone)} className="lt-btn" style={{ textDecoration: "none", background: "var(--blue)", color: "#fff", padding: "16px 30px", borderRadius: 12, fontSize: 16, fontWeight: 600, boxShadow: "0 16px 40px -12px var(--glow)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 22px 50px -12px var(--glow)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 16px 40px -12px var(--glow)"; }}>{cta(t.hero.ctaPrimary, dl.hero.ctaPrimary).label}</a>}
            {cta(t.hero.ctaSecondary, dl.hero.ctaSecondary).on && <a href={ctaHref(cta(t.hero.ctaSecondary, dl.hero.ctaSecondary).label, s.phone)} className="lt-btn" style={{ textDecoration: "none", background: "var(--card)", color: "var(--text)", padding: "16px 30px", borderRadius: 12, fontSize: 16, fontWeight: 600, border: "1px solid var(--border)" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>{cta(t.hero.ctaSecondary, dl.hero.ctaSecondary).label}</a>}
          </div>
        </div>
        <ScrollCue />
      </section>

      {/* ABOUT */}
      {secOn("about") && (
      <section id="about" style={{ position: "relative", padding: "clamp(68px,11vw,120px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(18px,5vw,32px)" }}>
          <div data-reveal style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 64px" }}>
            <Kicker accent={accent}>{t.about.kicker}</Kicker>
            <h2 style={sectionH2}>{t.about.title}</h2>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: "var(--dim)", margin: 0 }}>{t.about.lead}</p>
          </div>
          <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
            {[[t.about.whoLabel, t.about.whoText], [t.about.whatLabel, t.about.whatText], [t.about.missionLabel, t.about.missionText], [t.about.visionLabel, t.about.visionText]].map(([label, text], i) => (
              <TiltCard key={i} className="lt-card" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 30 }}>
                <div style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--blue)", marginBottom: 12 }}>{label}</div>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.62, color: "var(--dim)" }}>{text}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* BUSINESS CONTROL */}
      {secOn("bc") && (
      <section id="bc" style={{ position: "relative", padding: "clamp(64px,10vw,110px) 0", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(18px,5vw,32px)" }}>
          <div data-reveal style={{ maxWidth: 760, margin: "0 0 50px" }}>
            <Kicker accent={accent} left>{t.bc.kicker}</Kicker>
            <h2 style={sectionH2}>{t.bc.title}</h2>
            <p style={{ fontSize: 18, lineHeight: 1.62, color: "var(--dim)", margin: 0 }}>{t.bc.desc}</p>
          </div>
          <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 24 }}>
            {content.modules.map((m) => {
              // Բաց ռեժիմում՝ light-նկարը (եթե վերբեռնված է), այլապես՝ մուգ ռեժիմի նկարը
              const lightImg = !isDark && !!m.image_url_light;
              const imgSrc = lightImg ? m.image_url_light : m.image_url;
              const onImg = !!imgSrc;
              const whiteText = onImg && !lightImg;
              return (
                <TiltCard key={m.id} className="lt-card" onClick={() => setModalModule(m)} style={{ position: "relative", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", height: 300, background: "var(--cardSolid)", cursor: "pointer" }}>
                  {onImg && <>
                    <img src={imgSrc!} alt={ml(m.title)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: lightImg ? "linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.55) 55%,rgba(255,255,255,.94) 100%)" : "linear-gradient(180deg,rgba(8,12,24,.15) 0%,rgba(8,12,24,.55) 55%,rgba(8,12,24,.92) 100%)", pointerEvents: "none" }} />
                  </>}
                  {!onImg && <div style={{ position: "absolute", top: -34, right: -34, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, var(--glow), transparent 70%)", pointerEvents: "none" }} />}
                  <span className="lt-corner" style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", background: whiteText ? "rgba(255,255,255,.14)" : "var(--glow)", border: whiteText ? "1px solid rgba(255,255,255,.2)" : "1px solid var(--border)", color: whiteText ? "#fff" : "var(--blue)", backdropFilter: onImg ? "blur(6px)" : undefined, WebkitBackdropFilter: onImg ? "blur(6px)" : undefined }}>
                    {m.video_url
                      ? <svg viewBox="0 0 24 24" width={18} height={18} style={{ fill: "currentColor" }}><path d="M8 5v14l11-7z" /></svg>
                      : <svg viewBox="0 0 24 24" width={17} height={17} style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M7 17L17 7M9 7h8v8" /></svg>}
                  </span>
                  <div style={{ position: onImg ? "absolute" : "relative", left: onImg ? 0 : undefined, right: onImg ? 0 : undefined, bottom: onImg ? 0 : undefined, height: onImg ? undefined : "100%", padding: onImg ? 24 : 28, display: "flex", flexDirection: "column", justifyContent: "center", pointerEvents: "none" }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: "var(--blue)", color: "#fff", marginBottom: 16, flex: "none", alignSelf: "flex-start" }}><Icon name={m.icon} /></span>
                    <h3 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: whiteText ? "#fff" : "var(--text)" }}>{ml(m.title)}</h3>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: whiteText ? "rgba(255,255,255,.82)" : "var(--dim)" }}>{ml(m.desc)}</p>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* WHY */}
      {(secOn("benefits") || secOn("stats") || !!promoSrc) && (
      <section id="why" style={{ position: "relative", padding: "clamp(68px,11vw,120px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(18px,5vw,32px)" }}>
          <div data-reveal style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 60px" }}>
            <Kicker accent={accent}>{t.why.kicker}</Kicker>
            <h2 style={sectionH2}>{t.why.title}</h2>
          </div>
          {promoSrc && (
            <div data-reveal style={{ maxWidth: 900, margin: "0 auto 64px" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)", background: "#000", boxShadow: "0 30px 80px -30px var(--glow)" }}>
                {promoSrc.kind === "iframe" ? (
                  <iframe src={promoSrc.src} title={t.why.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                ) : (
                  <video src={promoSrc.src} controls playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
            </div>
          )}
          {secOn("benefits") && content.benefits.length > 0 && (() => {
            const base = content.benefits;
            const reps = Math.max(2, Math.ceil(1920 / (base.length * 356)));
            const oneCopy = Array.from({ length: reps }, () => base).flat();
            const loop = [...oneCopy, ...oneCopy];
            return (
              <div className="lt-marquee" data-reveal style={{ marginBottom: 64 }}>
                <div className="lt-marquee-track" style={{ alignItems: "stretch", animationDuration: `${Math.round(oneCopy.length * 3.4)}s` }}>
                  {loop.map((b, i) => (
                    <div key={i} className="lt-card-cyan" aria-hidden={i >= oneCopy.length} style={{ flex: "none", width: 300, display: "flex", gap: 14, alignItems: "flex-start", padding: 22, borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", transition: "border-color .3s, transform .3s" }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: "var(--glow)", color: "var(--cyan)", flex: "none" }}><Icon name={b.icon} size={22} /></span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 16.5, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3, overflowWrap: "break-word" }}>{ml(b.title)}</h3>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--dim)", overflowWrap: "break-word" }}>{ml(b.desc)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          {secOn("stats") && (
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24, padding: "48px 36px", borderRadius: 24, background: "linear-gradient(135deg,var(--glow),transparent 70%),var(--bg2)", border: "1px solid var(--border)" }}>
            {content.whyStats.map((st) => (
              <div key={st.id} style={{ textAlign: "center" }}>
                <div className="lt-grad-text" style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontWeight: 700, fontSize: "clamp(44px,6vw,64px)", lineHeight: 1, letterSpacing: "-.03em" }}>
                  <Counter target={st.target} suffix={st.suffix} decimals={st.decimals} />
                </div>
                <div style={{ marginTop: 10, fontSize: 15, fontWeight: 500, color: "var(--dim)" }}>{ml(st.label)}</div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>
      )}

      {/* INDUSTRIES */}
      {secOn("industries") && (
      <section id="industries" style={{ position: "relative", padding: "clamp(64px,10vw,110px) 0", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(18px,5vw,32px)" }}>
          <div data-reveal style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 56px" }}>
            <Kicker accent={accent}>{t.industries.kicker}</Kicker>
            <h2 style={sectionH2}>{t.industries.title}</h2>
          </div>
          <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 20 }}>
            {content.industries.map((ind) => (
              <TiltCard key={ind.id} className="lt-card" style={{ position: "relative", padding: "30px 26px", borderRadius: 18, border: "1px solid var(--border)", background: "var(--cardSolid)", overflow: "hidden" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, borderRadius: 13, background: "var(--glow)", color: "var(--blue)", marginBottom: 18 }}><Icon name={ind.icon} size={25} /></span>
                <h3 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{ml(ind.name)}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--dim)" }}>{ml(ind.desc)}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* TRUST */}
      {(secOn("clients") || secOn("proof") || secOn("partners") || secOn("stories")) && (
      <section id="trust" style={{ position: "relative", padding: "clamp(64px,10vw,110px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(18px,5vw,32px)" }}>
          {secOn("clients") && (<>
          <div data-reveal style={{ textAlign: "center", marginBottom: 44 }}>
            <Kicker accent={accent}>{t.trust.clientsKicker}</Kicker>
            <h2 style={sectionH2sm}>{t.trust.clientsTitle}</h2>
          </div>
          {(() => {
            const base = content.clients.filter((c) => logoShown(c.logo_mode));
            if (base.length === 0) return null;
            // Կրկնում ենք այնքան, որ լենտան միշտ ավելի լայն լինի էկրանից (սահուն, առանց բացի)
            const reps = Math.max(2, Math.ceil(1920 / (base.length * 206)));
            const oneCopy = Array.from({ length: reps }, () => base).flat();
            const loop = [...oneCopy, ...oneCopy];
            const item: React.CSSProperties = { flex: "none", width: 150, height: 90, display: "flex", alignItems: "center", justifyContent: "center" };
            return (
              <div className="lt-marquee" data-reveal style={{ marginBottom: 120 }}>
                <div className="lt-marquee-track" style={{ animationDuration: `${Math.round(oneCopy.length * 2.2)}s` }}>
                  {loop.map((c, i) => {
                    const inner = c.logo_url
                      ? <img src={c.logo_url} alt={c.name} style={{ maxWidth: "100%", maxHeight: 64, objectFit: "contain" }} />
                      : <span style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--dim)" }}>{c.name}</span>;
                    return c.url?.trim()
                      ? <a key={i} className="lt-client" href={c.url} target="_blank" rel="noreferrer" title={c.name} aria-hidden={i >= oneCopy.length} style={{ ...item, textDecoration: "none", cursor: "pointer" }}>{inner}</a>
                      : <div key={i} className="lt-client" aria-hidden={i >= oneCopy.length} style={item}>{inner}</div>;
                  })}
                </div>
              </div>
            );
          })()}

          </>)}

          {secOn("proof") && (
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, padding: "46px 32px", borderRadius: 24, background: "var(--bg2)", border: "1px solid var(--border)", marginBottom: 120 }}>
            {content.proof.map((p) => (
              <div key={p.id} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontWeight: 700, fontSize: "clamp(36px,4.6vw,52px)", lineHeight: 1, letterSpacing: "-.03em", color: "var(--text)" }}><Counter target={p.target} suffix={p.suffix} decimals={0} /></div>
                <div style={{ marginTop: 10, fontSize: 14, fontWeight: 500, color: "var(--dim)" }}>{ml(p.label)}</div>
              </div>
            ))}
          </div>
          )}

          {secOn("partners") && (<>
          <div data-reveal style={{ textAlign: "center", marginBottom: 44 }}>
            <Kicker accent={accent}>{t.trust.partnersKicker}</Kicker>
            <h2 style={sectionH2sm}>{t.trust.partnersTitle}</h2>
          </div>
          <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 22, marginBottom: content.stories.length && secOn("stories") ? 120 : 0 }}>
            {content.partners.map((p) => (
              <div key={p.id} className="lt-card" onClick={() => setModalPartner(p)} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setModalPartner(p); } }}
                style={{ padding: 28, borderRadius: 18, border: "1px solid var(--border)", background: "var(--card)", display: "flex", flexDirection: "column", cursor: "pointer" }}>
                {p.logo_url && logoShown(p.logo_mode) && (
                  <div style={{ marginBottom: 18, height: 72, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                    <img src={p.logo_url} alt={p.name} style={{ maxWidth: "70%", maxHeight: 56, objectFit: "contain" }} />
                  </div>
                )}
                <h3 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 19, fontWeight: 700, margin: "0 0 8px" }}>{p.name}</h3>
                <p style={{ margin: "0 0 18px", fontSize: 14.5, lineHeight: 1.6, color: "var(--dim)" }}>{ml(p.desc)}</p>
                <span className="lt-story-cta" style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "var(--blue)" }}>{lang === "am" ? "Մանրամասն" : lang === "ru" ? "Подробнее" : "Learn more"} <svg viewBox="0 0 24 24" width={15} height={15} style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
              </div>
            ))}
          </div>
          </>)}

          {secOn("stories") && content.stories.length > 0 && (
            <>
              <div data-reveal style={{ textAlign: "center", marginBottom: 44 }}>
                <Kicker accent={accent}>{t.trust.successKicker}</Kicker>
                <h2 style={sectionH2sm}>{t.trust.successTitle}</h2>
              </div>
              <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 26 }}>
                {content.stories.map((st) => {
                  const m0 = st.metrics[0];
                  return (
                    <div key={st.id} className="lt-story" onClick={() => setModalStory(st)} role="button" tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setModalStory(st); } }}>
                      <div className="lt-story-inner">
                        <span className="lt-story-glow" />
                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                          <div style={{ width: 56, height: 56, borderRadius: 15, overflow: "hidden", border: "1px solid var(--border)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg2)" }}>
                            {st.logo_url ? <img src={st.logo_url} alt={st.name} style={{ maxWidth: "78%", maxHeight: "78%", objectFit: "contain" }} /> : <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--blue)" }}>{st.name.slice(0, 2).toUpperCase()}</span>}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 19, fontWeight: 700, margin: 0 }}>{st.name}</h3>
                            <span style={{ display: "inline-block", marginTop: 5, fontSize: 11.5, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".06em", background: "var(--glow)", padding: "3px 10px", borderRadius: 999 }}>{ml(st.industry)}</span>
                          </div>
                        </div>
                        {m0 && (
                          <div style={{ position: "relative", marginBottom: 18 }}>
                            <div className="lt-grad-text" style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 48, lineHeight: 1, letterSpacing: "-.02em" }}><Counter target={m0.target} suffix={m0.suffix} decimals={m0.decimals} /></div>
                            <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 5 }}>{ml(m0.label)}</div>
                          </div>
                        )}
                        <p style={{ position: "relative", margin: "0 0 22px", fontSize: 14, lineHeight: 1.6, color: "var(--dim)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{ml(st.challenge)}</p>
                        <span className="lt-story-cta" style={{ position: "relative", marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--blue)" }}>{t.common.viewStory} <svg viewBox="0 0 24 24" width={16} height={16} style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
      )}

      {/* DEMO CTA */}
      {secOn("demo") && (
      <section style={{ position: "relative", padding: "40px 0 clamp(64px,10vw,110px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(18px,5vw,32px)" }}>
          <div data-reveal style={{ position: "relative", overflow: "hidden", borderRadius: 28, padding: "clamp(48px,7vw,86px) 32px", textAlign: "center", background: isDark ? "linear-gradient(140deg,#0e1526 0%,#17213b 60%,#121a30 100%)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,.08)" : "1px solid var(--border)", boxShadow: isDark ? undefined : "0 20px 60px -30px rgba(20,27,46,.18)" }}>
            <ParticleNet isDark={isDark} />
            {isDark && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(700px 320px at 50% 30%, rgba(100,117,232,.22), transparent 70%)", pointerEvents: "none" }} />}
            <div style={{ position: "relative", zIndex: 2, maxWidth: 720, margin: "0 auto" }}>
              <h2 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontWeight: "var(--hw)", fontSize: "clamp(30px,4.6vw,52px)", lineHeight: 1.18, letterSpacing: "-.02em", margin: "0 0 18px", color: isDark ? "#fff" : "var(--text)", textWrap: "balance" } as React.CSSProperties}>{t.demo.title}</h2>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: isDark ? "rgba(255,255,255,.9)" : "var(--dim)", margin: "0 0 34px" }}>{t.demo.subtitle}</p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                {cta(t.demo.ctaPrimary, dl.demo.ctaPrimary).on && <a href={ctaHref(cta(t.demo.ctaPrimary, dl.demo.ctaPrimary).label, s.phone)} className="lt-btn" style={{ textDecoration: "none", background: isDark ? "#fff" : "var(--blue)", color: isDark ? "#3a4682" : "#fff", padding: "15px 30px", borderRadius: 12, fontSize: 16, fontWeight: 700 }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>{cta(t.demo.ctaPrimary, dl.demo.ctaPrimary).label}</a>}
                {cta(t.demo.ctaSecondary, dl.demo.ctaSecondary).on && <a href={ctaHref(cta(t.demo.ctaSecondary, dl.demo.ctaSecondary).label, s.phone)} className="lt-btn" style={{ textDecoration: "none", background: isDark ? "rgba(255,255,255,.14)" : "#ffffff", color: isDark ? "#fff" : "var(--text)", padding: "15px 30px", borderRadius: 12, fontSize: 16, fontWeight: 600, border: isDark ? "1px solid rgba(255,255,255,.4)" : "1px solid var(--border)" }} onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,.24)" : "#f3f5fa")} onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,.14)" : "#ffffff")}>{cta(t.demo.ctaSecondary, dl.demo.ctaSecondary).label}</a>}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CONTACT */}
      <ContactSection content={content} lang={lang} accent={accent} />

      {/* FOOTER */}
      <footer style={{ position: "relative", padding: "64px 0 32px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(18px,5vw,32px)" }}>
          {/* Լոգո | նկարագրություն | սոց. ցանցեր՝ մեկ տողում (մոբայլում՝ իրար տակ) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px 40px", flexWrap: "wrap" }}>
            <img src={isDark ? "/assets/logo-dark.svg" : "/assets/logo-light.svg"} alt="LuysTech" style={{ height: 30, width: "auto", display: "block", flex: "none" }} />
            <p className="lt-foot-desc" style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--dim)", flex: "1 1 auto", textAlign: "center" }}>{t.footer.desc}</p>
            <div style={{ display: "flex", gap: 10, flex: "none" }}>
              {(s.socials || []).filter((soc) => SOCIAL_ICONS[soc.platform]).map((soc, i) => (
                <a key={i} href={soc.url || "#"} target="_blank" rel="noreferrer" aria-label={soc.platform} className="lt-social" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10 }}>
                  <svg viewBox="0 0 24 24" width={18} height={18}>{SOCIAL_ICONS[soc.platform]}</svg>
                </a>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13.5, color: "var(--faint)" }}>© {new Date().getFullYear()} LuysTech. {t.footer.rights}</span>
            <span style={{ fontSize: 13.5, color: "var(--faint)" }}>Business Control (BC)</span>
          </div>
        </div>
      </footer>

      {modalModule && <ModuleModal module={modalModule} lang={lang} t={t} accent={accent} onClose={() => setModalModule(null)} />}
      {modalStory && <StoryModal story={modalStory} lang={lang} t={t} onClose={() => setModalStory(null)} />}
      {modalPartner && <PartnerModal partner={modalPartner} lang={lang} isDark={isDark} onClose={() => setModalPartner(null)} />}
    </div>
  );
}

// ── shared styles ──
const sectionH2: React.CSSProperties = { fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontWeight: "var(--hw)", fontSize: "clamp(30px,4.4vw,50px)", lineHeight: 1.18, letterSpacing: "-.02em", margin: "0 0 20px", textWrap: "balance" } as React.CSSProperties;
const sectionH2sm: React.CSSProperties = { fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontWeight: "var(--hw)", fontSize: "clamp(26px,3.6vw,42px)", lineHeight: 1.2, letterSpacing: "-.02em", margin: 0 } as React.CSSProperties;

// ── small components ──
function Kicker({ children, accent, left }: { children: React.ReactNode; accent: string; left?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: left ? "flex-start" : "center", marginBottom: 18 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--blue)" }}>{children}</span>
    </div>
  );
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg viewBox="0 0 24 24" width={18} height={18} style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" }}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width={18} height={18} style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z" /></svg>
  );
}

function FloatShape({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: "absolute", pointerEvents: "none", ...style }} />;
}

function ScrollCue() {
  return (
    <div style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 3, opacity: 0.6, animation: "lt-bob 2.2s ease-in-out infinite" }}>
      <svg viewBox="0 0 24 24" width={26} height={26} style={{ fill: "none", stroke: "var(--dim)", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
    </div>
  );
}

function CaseRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 5 }}>{label}</div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--dim)" }}>{text}</p>
    </div>
  );
}

// Սոց. ցանցերի իկոնները (ըստ հարթակի)
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  linkedin: <path fill="currentColor" d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3 8.5h3.8V21H3V8.5zM9.5 8.5h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6V21h-3.8v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9.5V8.5z" />,
  facebook: <path fill="currentColor" d="M14 7h2V4h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V8c0-.6.4-1 1-1z" />,
  instagram: <g fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></g>,
  youtube: <path fill="currentColor" d="M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.5A2.5 2.5 0 0 0 2.4 7.3C2 8.8 2 12 2 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.5a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12zM10 15V9l5 3-5 3z" />,
  telegram: <path fill="currentColor" d="M21.5 4.3 2.9 11.4c-1 .4-1 1 .1 1.3l4.8 1.5 1.8 5.6c.2.6.5.7 1 .3l2.6-2.1 4.6 3.4c.5.3 1 .1 1.2-.5l3.3-15.4c.2-.8-.3-1.2-1-.9z" />,
  tiktok: <path fill="currentColor" d="M16.5 3c.3 2 1.6 3.6 3.5 3.9v2.7c-1.3 0-2.6-.4-3.6-1.1v5.7a5.2 5.2 0 1 1-5.2-5.2c.3 0 .5 0 .8.05v2.8a2.5 2.5 0 1 0 1.7 2.35V3h2.8z" />,
  x: <path fill="currentColor" d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.1L8 21H5l7.4-8.5L4.5 3h6.6l4.5 5.6L17.5 3z" />,
};

// magnetic tilt card
function TiltCard({ children, style, className, onClick }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-6px)`;
  };
  const reset = () => { const el = ref.current; if (el) el.style.transform = ""; };
  return (
    <div ref={ref} className={className} style={style} onPointerMove={onMove} onPointerLeave={reset}
      onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}>
      {children}
    </div>
  );
}

// count-up on view
function Counter({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let done = false;
    const fmt = (v: number) => (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US")) + suffix;
    el.textContent = fmt(0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !done) {
          done = true;
          const dur = 1600, t0 = performance.now();
          const step = (now: number) => {
            const p = Math.min(1, (now - t0) / dur);
            const e = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(target * e);
            if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
          };
          requestAnimationFrame(step);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, suffix, decimals]);
  return <span ref={ref} />;
}

// Անվտանգ քարտեզ. ընդունում է միայն Google Maps embed URL (iframe-ից հանում է src-ը)։
// Ոչ մի ադմին-տրված HTML չի render-վում — կանխում է stored XSS-ը։
function safeMapSrc(embed: string | null | undefined): string | null {
  if (!embed) return null;
  let src = embed.trim();
  if (!src) return null;

  // 1) Եթե դրված է ամբողջ <iframe ...> կոդը՝ հանենք src-ը
  const m = src.match(/src\s*=\s*["']([^"']+)["']/i);
  if (m) src = m[1].trim();

  const buildQ = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
  const isGoogleHost = (h: string) => /(^|\.)google\.(com|[a-z]{2,3}(\.[a-z]{2})?)$/i.test(h) || h === "maps.app.goo.gl" || h === "goo.gl";

  // 2) URL է
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return null;
    if (!isGoogleHost(u.hostname)) return null;

    // Արդեն պատրաստ embed URL
    if (u.pathname.startsWith("/maps/embed")) return u.toString();

    // ?q=… պարամետր
    const qp = u.searchParams.get("q");
    if (qp) return buildQ(qp);

    // @lat,lng կոորդինատներ
    const coord = src.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coord) return buildQ(`${coord[1]},${coord[2]}`);

    // /maps/place/<name> կամ /maps/search/<query>
    const place = u.pathname.match(/\/maps\/(?:place|search)\/([^/@]+)/);
    if (place) return buildQ(decodeURIComponent(place[1]).replace(/\+/g, " "));

    // Կարճ հղում (maps.app.goo.gl) — չենք կարող բացել, բայց փորձենք q-ով
    return buildQ(src);
  } catch { /* URL չէ */ }

  // 3) Պարզ տեքստ (հասցե կամ «lat,lng») → ուղիղ որոնում
  return buildQ(src);
}

// contact section with form → PHP API (/api/?a=contact)
function ContactSection({ content, lang, accent }: { content: SiteContent; lang: Lang; accent: string }) {
  const t = content.texts[lang];
  const s = content.settings;
  const ml = (m: ML) => m[lang];
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      company: String(fd.get("company") || ""), person: String(fd.get("person") || ""),
      phone: String(fd.get("phone") || ""), email: String(fd.get("email") || ""),
      message: String(fd.get("message") || ""), website: String(fd.get("website") || ""),
    };
    const res = await sendContact(payload);
    if (res.ok) setSent(true);
    else setErr("Չհաջողվեց ուղարկել։ Փորձեք կրկին։");
    setBusy(false);
  }

  const inputStyle: React.CSSProperties = { background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 14.5, width: "100%" };
  const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 7, fontSize: 13, fontWeight: 600, color: "var(--dim)" };

  const info: [string, string, string | null][] = [
    [t.contact.phoneLabel, s.phone, s.phone?.trim() ? telHref(s.phone) : null],
    [t.contact.emailLabel, s.email, s.email?.trim() ? "mailto:" + s.email.trim() : null],
    [t.contact.addressLabel, ml(s.address), null], [t.contact.hoursLabel, ml(s.hours), null],
  ];
  const mapSrc = safeMapSrc(s.map_embed);

  return (
    <section id="contact" style={{ position: "relative", padding: "clamp(64px,10vw,110px) 0", background: "var(--bg2)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(18px,5vw,32px)" }}>
        <div data-reveal style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 56px" }}>
          <Kicker accent={accent}>{t.contact.kicker}</Kicker>
          <h2 style={sectionH2sm}>{t.contact.title}</h2>
        </div>
        <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 28, alignItems: "start" }}>
          <div style={{ background: "var(--cardSolid)", border: "1px solid var(--border)", borderRadius: 20, padding: "clamp(18px,5vw,34px)" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 10px", animation: "lt-rise .4s ease" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", color: "var(--emerald)" }}><svg viewBox="0 0 24 24" width={32} height={32} style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M20 6L9 17l-5-5" /></svg></div>
                <p style={{ fontSize: 17, lineHeight: 1.5, color: "var(--text)", margin: "0 0 22px", fontWeight: 500 }}>{t.contact.success}</p>
                <button onClick={() => setSent(false)} style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)", padding: "11px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>OK</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* honeypot — մարդիկ չեն տեսնում, բոտերը լրացնում են */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 16 }}>
                  <label style={labelStyle}>{t.contact.company}<input className="lt-input" name="company" type="text" required style={inputStyle} /></label>
                  <label style={labelStyle}>{t.contact.person}<input className="lt-input" name="person" type="text" required style={inputStyle} /></label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 16 }}>
                  <label style={labelStyle}>{t.contact.phone}<input className="lt-input" name="phone" type="tel" required style={inputStyle} /></label>
                  <label style={labelStyle}>{t.contact.email}<input className="lt-input" name="email" type="email" required style={inputStyle} /></label>
                </div>
                <label style={labelStyle}>{t.contact.message}<textarea className="lt-input" name="message" rows={4} required style={{ ...inputStyle, resize: "vertical" }} /></label>
                {err && <div style={{ fontSize: 13, color: "#ef4444" }}>{err}</div>}
                <button type="submit" disabled={busy} className="lt-btn" style={{ marginTop: 4, background: "var(--blue)", color: "#fff", border: "none", padding: 15, borderRadius: 11, fontSize: 15.5, fontWeight: 600, cursor: "pointer", boxShadow: "0 12px 30px -10px var(--glow)", opacity: busy ? 0.6 : 1 }}>{busy ? "…" : t.contact.submit}</button>
              </form>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 14 }}>
              {info.map(([label, val, href], i) => (
                <div key={i} style={{ background: "var(--cardSolid)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 6 }}>{label}</div>
                  {href ? (
                    <a href={href} style={{ fontSize: 15.5, fontWeight: 600, color: "var(--blue)", wordBreak: "break-word", textDecoration: "none" }}>{val}</a>
                  ) : (
                    <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--text)", wordBreak: "break-word" }}>{val}</div>
                  )}
                </div>
              ))}
            </div>
            {mapSrc ? (
              <iframe src={mapSrc} title="Քարտեզ" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ flex: 1, minHeight: 230, borderRadius: 16, border: "1px solid var(--border)", width: "100%" }} />
            ) : (
              <div style={{ position: "relative", flex: 1, minHeight: 230, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--cardSolid)", backgroundImage: "linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)", backgroundSize: "32px 32px" }}>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-100%)", color: "var(--blue)" }}><svg viewBox="0 0 24 24" width={40} height={40} style={{ fill: "var(--blue)" }}><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" /><circle cx="12" cy="9" r="2.6" fill="#fff" /></svg></div>
                <span style={{ position: "absolute", left: "50%", bottom: 16, transform: "translateX(-50%)", fontSize: 13, fontWeight: 600, color: "var(--faint)" }}>{t.contact.mapText}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA կոճակի ուղղություն՝ «զանգ» բառով կոճակը ուղիղ հեռախոսով է զանգում ──
const telHref = (phone?: string) => "tel:" + (phone || "").replace(/[^\d+]/g, "");
const isCallCta = (txt?: string) => /զանգ|call|звон/i.test(txt || "");
const ctaHref = (txt: string, phone?: string) => (isCallCta(txt) && (phone || "").trim() ? telHref(phone) : "#contact");

// ── Լողացող կետ-ցանց (constellation) — hero-ի ֆոնի նույն անիմացիան, վերաօգտագործելի ──
function ParticleNet({ isDark = true }: { isDark?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const line = isDark ? "150,190,255" : "90,108,200";
    const dot = isDark ? "170,205,255" : "79,99,196";
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, raf = 0;
    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const N = Math.max(16, Math.min(52, Math.floor((w * h) / 16000)));
    for (let i = 0; i < N; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.26, vy: (Math.random() - 0.5) * 0.26, r: Math.random() * 1.6 + 0.8 });
    let mx = -999, my = -999;
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const onLeave = () => { mx = -999; my = -999; };
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const ddx = mx - n.x, ddy = my - n.y, dm = Math.hypot(ddx, ddy);
        if (dm < 150 && dm > 0.01) { n.vx += (ddx / dm) * 0.006; n.vy += (ddy / dm) * 0.006; }
        n.vx = Math.max(-0.6, Math.min(0.6, n.vx)); n.vy = Math.max(-0.6, Math.min(0.6, n.vy));
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) { ctx.strokeStyle = `rgba(${line},${(0.2 * (1 - d / 130)).toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (const n of nodes) { ctx.fillStyle = `rgba(${dot},0.92)`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.2832); ctx.fill(); }
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerleave", onLeave); window.removeEventListener("resize", resize); };
  }, [isDark]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />;
}

// ── Video embed (allowlist՝ YouTube / Vimeo, կամ ուղիղ ֆայլ) ──
function videoEmbed(url: string | null | undefined): { kind: "iframe" | "video"; src: string } | null {
  if (!url) return null;
  const u = url.trim();
  let m: RegExpMatchArray | null;
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/))) return { kind: "iframe", src: `https://www.youtube.com/embed/${m[1]}` };
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return { kind: "iframe", src: `https://player.vimeo.com/video/${m[1]}` };
  if (/^https?:\/\/[^\s]+\.(mp4|webm|ogg)(\?[^\s]*)?$/i.test(u)) return { kind: "video", src: u };
  return null;
}

// ── Modal shell (entrance animation, Esc + backdrop close) ──
function Overlay({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="lt-overlay" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "clamp(16px,5vh,56px) 16px", overflowY: "auto", background: "rgba(5,8,18,.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
      <div className="lt-modal" onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: wide ? "min(900px,100%)" : "min(680px,100%)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 22, overflow: "hidden", boxShadow: "0 40px 100px -30px rgba(0,0,0,.7)" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 14, zIndex: 3, width: 40, height: 40, borderRadius: 11, border: "1px solid var(--border)", background: "rgba(10,15,28,.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" width={20} height={20} style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" }}><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        {children}
      </div>
    </div>
  );
}

function ModuleModal({ module: m, lang, t, onClose }: { module: Module; lang: Lang; t: LangTexts; accent: string; onClose: () => void }) {
  const ml = (x: ML) => x[lang];
  const vid = videoEmbed(m.video_url);
  const desc = (ml(m.long) || "").trim() || ml(m.desc);
  return (
    <Overlay onClose={onClose} wide={!!vid}>
      <div style={{ position: "relative", height: 180, background: m.image_url ? undefined : "linear-gradient(140deg, var(--glow), transparent 70%), var(--cardSolid)" }}>
        {m.image_url && <img src={m.image_url} alt={ml(m.title)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,12,24,.2), rgba(8,12,24,.88))" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "22px 28px", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 12, background: "var(--blue)", color: "#fff", flex: "none" }}><Icon name={m.icon} size={24} /></span>
          <h3 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 25, fontWeight: 700, margin: 0, color: "#fff" }}>{ml(m.title)}</h3>
        </div>
      </div>
      <div style={{ padding: "26px 28px 30px" }}>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: "var(--dim)", whiteSpace: "pre-wrap" }}>{desc}</p>
        {vid && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--blue)", marginBottom: 12 }}>{t.common.watchVideo}</div>
            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "16 / 9", background: "#000" }}>
              {vid.kind === "iframe"
                ? <iframe src={vid.src} title={ml(m.title)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                : <video src={vid.src} controls playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />}
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

function PartnerModal({ partner: p, lang, isDark, onClose }: { partner: Partner; lang: Lang; isDark: boolean; onClose: () => void }) {
  const ml = (x: ML) => x[lang];
  const body = (ml(p.long) || "").trim() || ml(p.desc);
  const showLogo = !p.logo_mode || p.logo_mode === "both" || p.logo_mode === (isDark ? "dark" : "light");
  return (
    <Overlay onClose={onClose}>
      <div style={{ padding: "30px 30px 34px" }}>
        {p.logo_url && showLogo && (
          <div style={{ marginBottom: 18, height: 56, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
            <img src={p.logo_url} alt={p.name} style={{ maxWidth: "60%", maxHeight: 56, objectFit: "contain" }} />
          </div>
        )}
        <h3 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 25, fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>{p.name}</h3>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.75, color: "var(--dim)", whiteSpace: "pre-wrap" }}>{body}</p>
      </div>
    </Overlay>
  );
}

function StoryModal({ story: st, lang, t, onClose }: { story: Story; lang: Lang; t: LangTexts; onClose: () => void }) {
  const ml = (x: ML) => x[lang];
  return (
    <Overlay onClose={onClose}>
      <div style={{ padding: "30px 30px 22px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 60, height: 60, borderRadius: 15, overflow: "hidden", border: "1px solid var(--border)", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cardSolid)" }}>
          {st.logo_url ? <img src={st.logo_url} alt={st.name} style={{ maxWidth: "78%", maxHeight: "78%", objectFit: "contain" }} /> : <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--blue)" }}>{st.name.slice(0, 2).toUpperCase()}</span>}
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontFamily: "Manrope, 'Noto Sans Armenian', sans-serif", fontSize: 24, fontWeight: 700, margin: 0 }}>{st.name}</h3>
          <span style={{ display: "inline-block", marginTop: 6, fontSize: 12, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".06em", background: "var(--glow)", padding: "3px 10px", borderRadius: 999 }}>{ml(st.industry)}</span>
        </div>
      </div>
      <div style={{ padding: "26px 30px 32px" }}>
        <CaseRow label={t.trust.challenge} text={ml(st.challenge)} />
        <div style={{ height: 20 }} />
        <CaseRow label={t.trust.solution} text={ml(st.solution)} />
        {st.metrics.length > 0 && (
          <>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)", margin: "26px 0 14px" }}>{t.common.results}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 16 }}>
              {st.metrics.map((mt, i) => (
                <div key={i} style={{ padding: "18px 20px", borderRadius: 16, background: "var(--glow)", border: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 32, lineHeight: 1, color: "var(--emerald)" }}><Counter target={mt.target} suffix={mt.suffix} decimals={mt.decimals} /></div>
                  <div style={{ marginTop: 7, fontSize: 13, color: "var(--dim)", lineHeight: 1.4 }}>{ml(mt.label)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Overlay>
  );
}
