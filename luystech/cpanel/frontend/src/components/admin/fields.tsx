"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/api";
import Icon from "@/components/site/Icon";
import { ICON_KEYS } from "@/lib/icons";
import type { ML, Lang, IconKey } from "@/lib/types";

const LANG_LABELS: [Lang, string][] = [["am", "Հայ"], ["en", "EN"], ["ru", "РУ"]];

export const emptyML: ML = { am: "", en: "", ru: "" };

// Բազմալեզու տեքստ / տեքստադաշտ
export function MLInput({ label, value, onChange, area, help }: {
  label: string; value: ML; onChange: (v: ML) => void; area?: boolean; help?: string;
}) {
  const [lang, setLang] = useState<Lang>("am");
  const v = value || emptyML;
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <div className="adm-mltab">
        {LANG_LABELS.map(([code, lbl]) => (
          <button key={code} type="button" className={lang === code ? "on" : ""} onClick={() => setLang(code)}>{lbl}</button>
        ))}
      </div>
      {area ? (
        <textarea className="adm-textarea" value={v[lang]} onChange={(e) => onChange({ ...v, [lang]: e.target.value })} />
      ) : (
        <input className="adm-input" value={v[lang]} onChange={(e) => onChange({ ...v, [lang]: e.target.value })} />
      )}
      {help && <div style={{ fontSize: 12, color: "var(--a-faint)", marginTop: 5 }}>{help}</div>}
    </div>
  );
}

export function TextInput({ label, value, onChange, type = "text", help }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; help?: string;
}) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <input className="adm-input" type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      {help && <div style={{ fontSize: 12, color: "var(--a-faint)", marginTop: 5 }}>{help}</div>}
    </div>
  );
}

export function NumberInput({ label, value, onChange, step }: {
  label: string; value: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <input className="adm-input" type="number" step={step ?? 1} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
    </div>
  );
}

export function BoolInput({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="adm-field" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <span onClick={() => onChange(!value)} style={{ width: 44, height: 26, borderRadius: 999, background: value ? "var(--a-blue)" : "var(--a-border2)", position: "relative", transition: ".2s", flex: "none" }}>
        <span style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: ".2s" }} />
      </span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
    </label>
  );
}

export function IconPicker({ label, value, onChange }: { label: string; value: IconKey; onChange: (v: IconKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <button type="button" onClick={() => setOpen((o) => !o)} className="adm-input" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "start" }}>
        <span style={{ display: "flex", width: 26, height: 26, alignItems: "center", justifyContent: "center", color: "var(--a-blue)" }}><Icon name={value} size={20} /></span>
        <span style={{ color: "var(--a-dim)", fontSize: 13.5 }}>{value}</span>
      </button>
      {open && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(52px,1fr))", gap: 8, marginTop: 10, padding: 12, background: "var(--a-bg2)", border: "1px solid var(--a-border)", borderRadius: 12 }}>
          {ICON_KEYS.map((k) => (
            <button key={k} type="button" onClick={() => { onChange(k); setOpen(false); }} title={k}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 46, borderRadius: 10, cursor: "pointer", background: value === k ? "var(--a-blue)" : "var(--a-card)", color: value === k ? "#fff" : "var(--a-dim)", border: "1px solid var(--a-border)" }}>
              <Icon name={k} size={22} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ImageUpload({ label, value, onChange, folder, help }: {
  label: string; value: string | null; onChange: (v: string | null) => void; folder: string; help?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await uploadImage(fd);
    setBusy(false);
    if (res.ok && res.url) onChange(res.url);
    else setErr(res.error || "վերբեռնումը ձախողվեց");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 88, height: 60, borderRadius: 10, border: "1px solid var(--a-border)", background: "var(--a-bg2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flex: "none" }}>
          {value ? <img src={value} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 11, color: "var(--a-faint)" }}>չկա</span>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? "…" : "Վերբեռնել նկար"}</button>
          {value && <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => onChange(null)}>Հեռացնել</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      </div>
      {err && <div style={{ fontSize: 12, color: "#fca5a5", marginTop: 6 }}>{err}</div>}
      {help && <div style={{ fontSize: 12, color: "var(--a-faint)", marginTop: 5 }}>{help}</div>}
    </div>
  );
}

// Պարզ toast
export function useToast() {
  const [msg, setMsg] = useState("");
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2200); };
  const node = msg ? <div className="adm-toast">{msg}</div> : null;
  return { show, node };
}
