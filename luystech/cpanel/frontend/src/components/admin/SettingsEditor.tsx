"use client";

import { useState } from "react";
import { saveSettings, changePassword } from "@/lib/api";
import { MLInput, TextInput, BoolInput, useToast } from "./fields";
import type { Settings, SocialLink, SocialPlatform } from "@/lib/types";

const WEIGHTS: [number, string][] = [[300, "Բարակ"], [400, "Սովորական"], [500, "Միջին"], [600, "Կիսաթավ"], [700, "Թավ"], [800, "Շատ թավ"]];

const SOCIAL_OPTIONS: [SocialPlatform, string][] = [
  ["linkedin", "LinkedIn"],
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["youtube", "YouTube"],
  ["telegram", "Telegram"],
  ["x", "X (Twitter)"],
  ["tiktok", "TikTok"],
];

export default function SettingsEditor({ settings }: { settings: Settings }) {
  const [s, setS] = useState<Settings>({ ...settings });
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  const socials: SocialLink[] = s.socials || [];
  const setSocials = (list: SocialLink[]) => setS((p) => ({ ...p, socials: list }));
  const updSocial = (i: number, patch: Partial<SocialLink>) => setSocials(socials.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const delSocial = (i: number) => setSocials(socials.filter((_, j) => j !== i));
  const moveSocial = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= socials.length) return;
    const list = [...socials];
    [list[i], list[j]] = [list[j], list[i]];
    setSocials(list);
  };
  const addSocial = () => setSocials([...socials, { platform: "linkedin", url: "#" }]);

  async function onSave() {
    setBusy(true);
    const res = await saveSettings(s);
    setBusy(false);
    show(res.ok ? "Պահպանված է ✓" : "Սխալ: " + (res.error || ""));
  }

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="adm-h1">Կապ և կարգավորումներ</h1>
          <p className="adm-sub">Կոնտակտային տվյալներ, սոցիալական ցանցեր և կայքի կանխադրվածներ։</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : "Պահպանել"}</button>
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>Կոնտակտային տվյալներ</h3>
        <div className="adm-grid adm-cols2">
          <TextInput label="Հեռախոս" value={s.phone} onChange={(v) => set("phone", v)} />
          <TextInput label="Էլ. փոստ" value={s.email} onChange={(v) => set("email", v)} type="email" />
        </div>
        <MLInput label="Հասցե" value={s.address} onChange={(v) => set("address", v)} />
        <MLInput label="Աշխատանքային ժամեր" value={s.hours} onChange={(v) => set("hours", v)} />
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Սոցիալական ցանցեր</h3>
        <p className="adm-sub" style={{ margin: "0 0 14px" }}>Ավելացրեք հղումներ, ընտրեք ցանցը և դասավորեք հերթականությունը (↑ ↓)։ Ջնջելու համար՝ 🗑</p>
        {socials.length === 0 && <p style={{ color: "var(--a-faint)", fontSize: 13, margin: "0 0 12px" }}>Սոցիալական ցանց դեռ ավելացված չէ։</p>}
        {socials.map((soc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <div className="adm-field" style={{ margin: 0, minWidth: 150 }}>
              <label className="adm-label">Ցանց</label>
              <select className="adm-select" value={soc.platform} onChange={(e) => updSocial(i, { platform: e.target.value as SocialPlatform })}>
                {SOCIAL_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="adm-field" style={{ margin: 0, flex: 1, minWidth: 220 }}>
              <label className="adm-label">Հղում (URL)</label>
              <input className="adm-input" type="url" value={soc.url} onChange={(e) => updSocial(i, { url: e.target.value })} placeholder="https://…" />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="adm-btn" onClick={() => moveSocial(i, -1)} disabled={i === 0} title="Վերև" style={{ padding: "8px 11px" }}>↑</button>
              <button type="button" className="adm-btn" onClick={() => moveSocial(i, 1)} disabled={i === socials.length - 1} title="Ներքև" style={{ padding: "8px 11px" }}>↓</button>
              <button type="button" className="adm-btn" onClick={() => delSocial(i)} title="Ջնջել" style={{ padding: "8px 11px", color: "#dc2626" }}>🗑</button>
            </div>
          </div>
        ))}
        <button type="button" className="adm-btn" onClick={addSocial} style={{ marginTop: 4 }}>+ Ավելացնել ցանց</button>
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Քարտեզ</h3>
        <div className="adm-field">
          <label className="adm-label">Քարտեզի հասցե կամ Google Maps հղում (ոչ պարտադիր)</label>
          <textarea className="adm-textarea" value={s.map_embed} onChange={(e) => set("map_embed", e.target.value)} placeholder="Օր.՝ Երևան, Բաղրամյան 24  —  կամ՝ https://maps.google.com/..." />
          <div style={{ fontSize: 12, color: "var(--a-faint)", marginTop: 5 }}>
            Ամենապարզ ձևը՝ ուղղակի գրեք ձեր <b>հասցեն</b> (օր.՝ «Երևան, Բաղրամյան 24»)։ Կարող եք նաև դնել Google Maps-ի <b>հղումը</b> (սովորական link, «Share» կոճակից), կոորդինատներ («40.1872, 44.5152»), կամ ամբողջ &lt;iframe&gt; կոդը։ Դատարկ թողնելու դեպքում ցուցադրվում է դեկորատիվ քարտեզ։
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Տեսահոլովակ («Ինչու BC» բաժնում)</h3>
        <p className="adm-sub" style={{ margin: "0 0 14px" }}>Կցեք վիդեոյի հղում՝ YouTube / Vimeo կամ ուղիղ .mp4 ֆայլ, յուրաքանչյուր լեզվի համար առանձին։ <b>Եթե դատարկ է՝ վիդեոն ընդհանրապես չի ցուցադրվում կայքում։</b></p>
        <MLInput label="Վիդեոյի հղում" value={s.promo_video} onChange={(v) => set("promo_video", v)} />
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>Կանխադրվածներ և ցուցադրում</h3>
        <div className="adm-grid adm-cols2">
          <div className="adm-field">
            <label className="adm-label">Կանխադրված լեզու</label>
            <select className="adm-select" value={s.default_lang} onChange={(e) => set("default_lang", e.target.value as any)}>
              <option value="am">Հայերեն</option><option value="en">English</option><option value="ru">Русский</option>
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Կանխադրված թեմա</label>
            <select className="adm-select" value={s.default_theme} onChange={(e) => set("default_theme", e.target.value as any)}>
              <option value="dark">Մուգ (dark)</option><option value="light">Բաց (light)</option>
            </select>
          </div>
        </div>
        <BoolInput label="Դեղին շեշտադրման գույն (անջատելիս՝ երկնագույն)" value={s.accent_yellow} onChange={(v) => set("accent_yellow", v)} />
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Այլ բաժիններ (ցուցադրել/թաքցնել)</h3>
        <p className="adm-sub" style={{ margin: "0 0 14px" }}>Մնացած բաժինների ON/OFF-ն իրենց էջերից է (Մոդուլներ, Ոլորտներ…)։</p>
        <BoolInput label="Ցուցադրել «Մեր մասին» բաժինը" value={s.sections?.about !== false} onChange={(v) => setS((p) => ({ ...p, sections: { ...p.sections, about: v } }))} />
        <BoolInput label="Ցուցադրել «Դեմո» կանչի բաժինը" value={s.sections?.demo !== false} onChange={(v) => setS((p) => ({ ...p, sections: { ...p.sections, demo: v } }))} />
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Տառերի հաստություն (font weight)</h3>
        <p className="adm-sub" style={{ margin: "0 0 14px" }}>Կարգավորեք կայքի տեքստի հաստությունը՝ ըստ ճաշակի։</p>
        <div className="adm-grid adm-cols2">
          <div className="adm-field">
            <label className="adm-label">Վերնագրերի հաստություն</label>
            <select className="adm-select" value={s.heading_weight} onChange={(e) => set("heading_weight", parseInt(e.target.value, 10))}>
              {WEIGHTS.map(([v, l]) => <option key={v} value={v}>{l} ({v})</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Հիմնական տեքստի հաստություն</label>
            <select className="adm-select" value={s.body_weight} onChange={(e) => set("body_weight", parseInt(e.target.value, 10))}>
              {WEIGHTS.map(([v, l]) => <option key={v} value={v}>{l} ({v})</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : "Պահպանել"}</button>
      </div>

      <PasswordCard />
    </div>
  );
}

// Ադմինի գաղտնաբառի փոփոխում
function PasswordCard() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const current = String(fd.get("current") || "");
    const next = String(fd.get("next") || "");
    if (next.length < 8) { setMsg({ ok: false, text: "Նոր գաղտնաբառը պետք է լինի առնվազն 8 նիշ։" }); return; }
    if (next !== String(fd.get("confirm") || "")) { setMsg({ ok: false, text: "Նոր գաղտնաբառերը չեն համընկնում։" }); return; }
    setBusy(true); setMsg(null);
    const r = await changePassword(current, next);
    setBusy(false);
    if (r.ok) { setMsg({ ok: true, text: "Գաղտնաբառը փոխված է ✓" }); form.reset(); }
    else setMsg({ ok: false, text: r.error || "Սխալ" });
  }

  return (
    <form className="adm-card" onSubmit={onSubmit} style={{ marginTop: 22 }}>
      <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Ադմինի գաղտնաբառ</h3>
      <p className="adm-sub" style={{ margin: "0 0 14px" }}>Փոխեք ադմին վահանակի մուտքի գաղտնաբառը (առնվազն 8 նիշ)։</p>
      <div className="adm-grid adm-cols3">
        <div className="adm-field"><label className="adm-label">Ընթացիկ գաղտնաբառ</label><input className="adm-input" name="current" type="password" required autoComplete="current-password" /></div>
        <div className="adm-field"><label className="adm-label">Նոր գաղտնաբառ</label><input className="adm-input" name="next" type="password" required autoComplete="new-password" /></div>
        <div className="adm-field"><label className="adm-label">Կրկնել նորը</label><input className="adm-input" name="confirm" type="password" required autoComplete="new-password" /></div>
      </div>
      {msg && <div style={{ fontSize: 13, marginBottom: 10, color: msg.ok ? "#6ee7b7" : "#fca5a5" }}>{msg.text}</div>}
      <button type="submit" className="adm-btn adm-btn-primary" disabled={busy}>{busy ? "…" : "Փոխել գաղտնաբառը"}</button>
    </form>
  );
}
