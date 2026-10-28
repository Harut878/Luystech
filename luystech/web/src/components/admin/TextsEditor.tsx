"use client";

import { useState } from "react";
import { saveTexts } from "@/app/admin/actions";
import { MLInput, useToast } from "./fields";
import type { TextTree, Lang, ML } from "@/lib/types";

const LANGS: Lang[] = ["am", "en", "ru"];

// Բաժինների և դաշտերի հայերեն անվանումներ
const LABELS: Record<string, { __t: string; [k: string]: string }> = {
  nav: { __t: "Մենյու (նավիգացիա)", about: "«Մեր մասին»", product: "«Business Control»", why: "«Ինչու BC»", industries: "«Ոլորտներ»", trust: "«Վստահություն»", contact: "«Կապ»", cta: "Կոճակ (դեմո)" },
  hero: { __t: "Գլխավոր էկրան (Hero)", badge: "Պիտակ (վերևի)", title: "Գլխավոր վերնագիր", subtitle: "Ենթավերնագիր", ctaPrimary: "Հիմնական կոճակ", ctaSecondary: "Երկրորդական կոճակ" },
  about: { __t: "Մեր մասին", kicker: "Փոքր վերնագիր", title: "Վերնագիր", lead: "Ներածական տեքստ", whoLabel: "«Ովքե՞ր ենք» վերնագիր", whoText: "«Ովքե՞ր ենք» տեքստ", whatLabel: "«Ի՞նչ ենք անում» վերնագիր", whatText: "«Ի՞նչ ենք անում» տեքստ", missionLabel: "«Առաքելություն» վերնագիր", missionText: "«Առաքելություն» տեքստ", visionLabel: "«Տեսլական» վերնագիր", visionText: "«Տեսլական» տեքստ" },
  bc: { __t: "Business Control (ներածություն)", kicker: "Փոքր վերնագիր", title: "Վերնագիր", desc: "Նկարագրություն" },
  why: { __t: "Ինչու BC (վերնագրեր)", kicker: "Փոքր վերնագիր", title: "Վերնագիր" },
  industries: { __t: "Ոլորտներ (վերնագրեր)", kicker: "Փոքր վերնագիր", title: "Վերնագիր" },
  trust: { __t: "Վստահություն (վերնագրեր)", clientsKicker: "Հաճախորդներ՝ փոքր վերնագիր", clientsTitle: "Հաճախորդներ՝ վերնագիր", partnersKicker: "Գործընկերներ՝ փոքր վերնագիր", partnersTitle: "Գործընկերներ՝ վերնագիր", successKicker: "Պատմություններ՝ փոքր վերնագիր", successTitle: "Պատմություններ՝ վերնագիր", challenge: "«Մարտահրավեր» պիտակ", solution: "«Լուծում» պիտակ" },
  demo: { __t: "Դեմո կանչ (CTA)", title: "Վերնագիր", subtitle: "Ենթավերնագիր", ctaPrimary: "Հիմնական կոճակ", ctaSecondary: "Երկրորդական կոճակ" },
  contact: { __t: "Կապ", kicker: "Փոքր վերնագիր", title: "Վերնագիր", company: "Դաշտ՝ Ընկերություն", person: "Դաշտ՝ Անձ", phone: "Դաշտ՝ Հեռախոս", email: "Դաշտ՝ Էլ.փոստ", message: "Դաշտ՝ Հաղորդագրություն", submit: "Ուղարկելու կոճակ", success: "Հաջողության հաղորդագրություն", phoneLabel: "Ինֆո՝ Հեռախոս", emailLabel: "Ինֆո՝ Էլ.փոստ", addressLabel: "Ինֆո՝ Հասցե", hoursLabel: "Ինֆո՝ Ժամեր", mapText: "Քարտեզի տեքստ" },
  footer: { __t: "Ներքևի բաժին (Footer)", desc: "Նկարագրություն", quickTitle: "«Արագ հղումներ» վերնագիր", langTitle: "«Լեզու» վերնագիր", rights: "Հեղինակային իրավունք" },
  common: { __t: "Ընդհանուր", visit: "«Այցելել կայք» կոճակ", viewStory: "«Դիտել պատմությունը» կոճակ", watchVideo: "«Դիտել վիդեոն» կոճակ", close: "«Փակել» կոճակ", results: "«Արդյունքներ» պիտակ" },
};

const SECTION_ORDER = ["nav", "hero", "about", "bc", "why", "industries", "trust", "demo", "contact", "footer", "common"];

export default function TextsEditor({ texts }: { texts: TextTree }) {
  const [tree, setTree] = useState<TextTree>(JSON.parse(JSON.stringify(texts)));
  const [open, setOpen] = useState<string | null>("hero");
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  const getML = (section: string, field: string): ML => ({
    am: (tree.am as any)[section]?.[field] ?? "",
    en: (tree.en as any)[section]?.[field] ?? "",
    ru: (tree.ru as any)[section]?.[field] ?? "",
  });

  const setML = (section: string, field: string, v: ML) => {
    setTree((prev) => {
      const c: any = JSON.parse(JSON.stringify(prev));
      LANGS.forEach((l) => { c[l][section] = c[l][section] || {}; c[l][section][field] = v[l]; });
      return c;
    });
  };

  async function onSave() {
    setBusy(true);
    const res = await saveTexts(tree);
    setBusy(false);
    show(res.ok ? "Պահպանված է ✓" : "Սխալ: " + (res.error || ""));
  }

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "sticky", top: 0, background: "var(--a-bg)", paddingBottom: 12, zIndex: 5 }}>
        <div>
          <h1 className="adm-h1">Կայքի տեքստեր</h1>
          <p className="adm-sub">Խմբագրեք կայքի բոլոր տեքstերը երեք լեզվով (Հայերեն / English / Русский)։</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : "Պահպանել բոլորը"}</button>
      </div>

      {SECTION_ORDER.map((section) => {
        const labels = LABELS[section];
        if (!labels) return null;
        const fields = Object.keys((tree.am as any)[section] || {});
        const isOpen = open === section;
        return (
          <div key={section} className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
            <button onClick={() => setOpen(isOpen ? null : section)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "transparent", border: "none", color: "var(--a-text)", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 700 }}>
              {labels.__t}
              <span style={{ color: "var(--a-faint)", transform: isOpen ? "rotate(180deg)" : "none", transition: ".2s" }}>▾</span>
            </button>
            {isOpen && (
              <div style={{ padding: "4px 20px 20px", borderTop: "1px solid var(--a-border)" }}>
                {fields.map((f) => (
                  <MLInput key={f} label={labels[f] || f} value={getML(section, f)} onChange={(v) => setML(section, f, v)} area={/text$|desc|subtitle|lead|success/i.test(f)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : "Պահպանել բոլորը"}</button>
      </div>
    </div>
  );
}
