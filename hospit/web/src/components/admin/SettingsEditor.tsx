"use client";

import { useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { MLInput, TextInput, ImageUpload, useToast } from "./fields";
import { useAdminI18n } from "./i18n";
import type { Settings } from "@/lib/types";

export default function SettingsEditor({ settings }: { settings: Settings }) {
  const { at } = useAdminI18n();
  const [s, setS] = useState<Settings>({ ...settings });
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  async function onSave() {
    setBusy(true);
    const res = await saveSettings(s);
    setBusy(false);
    show(res.ok ? at("Պահպանված է ✓", "Saved ✓") : at("Սխալ: ", "Error: ") + (res.error || ""));
  }

  const accentColor = `oklch(62% 0.18 ${s.accent_hue})`;

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="adm-h1">{at("Կապ և կարգավորումներ", "Contact & settings")}</h1>
          <p className="adm-sub">{at("Կոնտակտային տվյալներ, սոց. ցանցեր, թեմա և գույն։", "Contact details, social links, theme and color.")}</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : at("Պահպանել", "Save")}</button>
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Կոնտակտային տվյալներ", "Contact details")}</h3>
        <div className="adm-grid adm-cols2">
          <TextInput label={at("Էլ. փոստ", "Email")} value={s.email} onChange={(v) => set("email", v)} type="email" />
          <TextInput label={at("Հեռախոս", "Phone")} value={s.phone} onChange={(v) => set("phone", v)} />
        </div>
        <MLInput label={at("Հասցե", "Address")} value={s.address} onChange={(v) => set("address", v)} />
        <TextInput label={at("Քարտեզի հարցում (Google Maps)", "Map query (Google Maps)")} value={s.map_query} onChange={(v) => set("map_query", v)} help={at("Օր.՝ Yerevan Aygedzor 2/1 Armenia", "e.g. Yerevan Aygedzor 2/1 Armenia")} />
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Դեմո տարբերակ", "Demo version")}</h3>
        <TextInput label={at("Դեմո կայքի հղում", "Demo site link")} value={s.demo_url} onChange={(v) => set("demo_url", v)} type="url"
          help={at("Գլխավոր էջի «Դեմո տարբերակ» կոճակը կտանի այս հասցեին (բացվում է նոր պատուհանում)։ Դատարկ թողնելու դեպքում կոճակը կտանի «Ծառայություններ» էջ։", "The “Demo version” button on the home page opens this URL in a new tab. If empty, the button goes to the Services page.")} />
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{at("Գաղտնիության քաղաքականություն", "Privacy policy")}</h3>
        <p className="adm-sub" style={{ marginTop: 0 }}>{at("Ցուցադրվում է կայքի ներքևում՝ հղման վրա սեղմելիս (3 լեզվով)։", "Shown when the footer link is clicked (in 3 languages).")}</p>
        <div className="adm-tall">
          <MLInput label={at("Տեքստը", "Text")} value={s.privacy} onChange={(v) => set("privacy", v)} area
            help={at("Կպցրեք Ձեր փաստաթուղթը։ Տողերի բաժանումները պահպանվում են այնպես, ինչպես գրել եք։", "Paste your document. Line breaks are preserved exactly as written.")} />
        </div>
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Կայքի նկարները", "Site images")}</h3>
        <ImageUpload label={at("Լոգո (վերևում և ներքևում)", "Logo (header & footer)")} folder="site" value={s.logo_url} onChange={(v) => set("logo_url", v || "")} />
        <ImageUpload label={at("Գլխավոր էջի պատկերը (թռչող)", "Hero image (floating)")} folder="site" value={s.hero_image_url} onChange={(v) => set("hero_image_url", v || "")}
          help={at("Ցուցադրվում է գլխավոր էջի վերևում՝ անիմացիայով։", "Shown at the top of the home page with animation.")} />
        <ImageUpload label={at("«Տեսեք HospIT-ը գործընթացի մեջ» նկարը", "Product preview image")} folder="site" value={s.preview_image_url} onChange={(v) => set("preview_image_url", v || "")} />
        <ImageUpload label={at("«Գործընկերներ» էջի ֆոնային պատկերը", "Partners page background")} folder="site" value={s.partners_bg_url} onChange={(v) => set("partners_bg_url", v || "")} />
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Սոցիալական ցանցեր", "Social networks")}</h3>
        <div className="adm-grid adm-cols3">
          <TextInput label="Instagram" value={s.instagram} onChange={(v) => set("instagram", v)} type="url" />
          <TextInput label="Facebook" value={s.facebook} onChange={(v) => set("facebook", v)} type="url" />
          <TextInput label="LinkedIn" value={s.linkedin} onChange={(v) => set("linkedin", v)} type="url" />
        </div>
      </div>

      <div className="adm-card">
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>{at("Տեսք և կանխադրվածներ", "Appearance & defaults")}</h3>
        <div className="adm-field">
          <label className="adm-label">{at("Շեշտադրման գույն (երանգ)", "Accent color (hue)")}: {s.accent_hue}°</label>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <input type="range" min={0} max={360} step={1} value={s.accent_hue} onChange={(e) => set("accent_hue", parseInt(e.target.value, 10))} style={{ flex: 1 }} />
            <span style={{ width: 34, height: 34, borderRadius: 10, background: accentColor, border: "1px solid var(--a-border)", flex: "none" }} />
          </div>
        </div>
        <div className="adm-grid adm-cols3">
          <div className="adm-field">
            <label className="adm-label">{at("Կանխադրված թեմա", "Default theme")}</label>
            <select className="adm-select" value={s.default_theme} onChange={(e) => set("default_theme", e.target.value as any)}>
              <option value="light">{at("Բաց (light)", "Light")}</option>
              <option value="dark">{at("Մուգ (dark)", "Dark")}</option>
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">{at("Կանխադրված լեզու", "Default language")}</label>
            <select className="adm-select" value={s.default_lang} onChange={(e) => set("default_lang", e.target.value as any)}>
              <option value="en">English</option><option value="hy">Հայերեն</option><option value="ru">Русский</option>
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">{at("Բաժինների միջ. հեռավորություն", "Section spacing")}</label>
            <select className="adm-select" value={s.section_spacing} onChange={(e) => set("section_spacing", e.target.value as any)}>
              <option value="compact">{at("Սեղմ", "Compact")}</option>
              <option value="comfortable">{at("Հարմարավետ", "Comfortable")}</option>
              <option value="spacious">{at("Ընդարձակ", "Spacious")}</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : at("Պահպանել", "Save")}</button>
      </div>
    </div>
  );
}
