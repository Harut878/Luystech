"use client";

import { useState } from "react";
import { saveTexts } from "@/app/admin/actions";
import { MLInput, useToast } from "./fields";
import { useAdminI18n, L, type Bi } from "./i18n";
import type { TextTree, Lang, ML } from "@/lib/types";

const LANGS: Lang[] = ["hy", "en", "ru"];

// Բաժինների վերնագրերը (երկլեզու)
const SECTIONS: { key: string; title: Bi }[] = [
  { key: "nav", title: L("Մենյու (նավիգացիա)", "Menu (navigation)") },
  { key: "hero", title: L("Գլխավոր էկրան (Hero)", "Hero section") },
  { key: "feat", title: L("Հնարավորություններ — վերնագրեր", "Features — headings") },
  { key: "preview", title: L("Համակարգի ցուցադրություն", "Product preview") },
  { key: "connected", title: L("Էկոհամակարգ (կապված բժշկության հետ)", "Ecosystem (connected section)") },
  { key: "integrations", title: L("Ինտեգրացիաներ (վերնագրեր)", "Integrations (headings)") },
  { key: "faq", title: L("Հաճախ տրվող հարցեր (վերնագրեր)", "FAQ (headings)") },
  { key: "whyHome", title: L("Ինչու HospIT (գլխավոր)", "Why HospIT (home)") },
  { key: "trusted", title: L("Մեզ վստահում են (բաժին)", "Trusted by (section)") },
  { key: "stats", title: L("Վիճակագրություն (թվերի շերտ)", "Stats strip") },
  { key: "cta", title: L("Կանչ գործողության (բաններ)", "CTA banner") },
  { key: "svcPage", title: L("Ծառայություններ էջ", "Services page") },
  { key: "parPage", title: L("Գործընկերներ էջ", "Partners page") },
  { key: "about", title: L("Մեր մասին էջ", "About page") },
  { key: "whyPage", title: L("Ինչու մենք էջ", "Why Us page") },
  { key: "contact", title: L("Կապ էջ", "Contact page") },
  { key: "footer", title: L("Ներքևի բաժին (Footer)", "Footer") },
];

// Դաշտերի երկլեզու անվանումներ (ըստ բանալու)
const FL: Record<string, Bi> = {
  home: L("«Գլխավոր»", "“Home”"), services: L("«Ծառայություններ»", "“Services”"), partners: L("«Գործընկերներ»", "“Partners”"),
  about: L("«Մեր մասին»", "“About”"), whyus: L("«Ինչու մենք»", "“Why Us”"), contact: L("«Կապ»", "“Contact”"), login: L("«Մուտք» կոճակ", "“Sign in” button"), account: L("«Իմ էջը» կոճակ (մուտք գործածի համար)", "“My page” button (signed in)"), admin: L("«Ադմինկա» կոճակ (ադմինի համար)", "“Admin panel” button (admins)"),
  cta: L("Կոճակ", "Button"), cta1: L("Հիմնական կոճակ", "Primary button"), cta2: L("Երկրորդական կոճակ", "Secondary button"),
  eyebrow: L("Փոքր վերնագիր", "Eyebrow"), title: L("Վերնագիր", "Title"), body: L("Տեքստ", "Body text"),
  stat1n: L("Թիվ 1", "Stat 1 number"), stat1l: L("Ենթագիր 1", "Stat 1 label"), stat2n: L("Թիվ 2", "Stat 2 number"), stat2l: L("Ենթագիր 2", "Stat 2 label"), stat3n: L("Թիվ 3", "Stat 3 number"), stat3l: L("Ենթագիր 3", "Stat 3 label"),
  p1t: L("Կետ 1 — վերնագիր", "Point 1 — title"), p1s: L("Կետ 1 — ենթագիր", "Point 1 — subtitle"), p2t: L("Կետ 2 — վերնագիր", "Point 2 — title"), p2s: L("Կետ 2 — ենթագիր", "Point 2 — subtitle"), p3t: L("Կետ 3 — վերնագիր", "Point 3 — title"), p3s: L("Կետ 3 — ենթագիր", "Point 3 — subtitle"),
  nodePatients: L("Հանգույց՝ Բուժառուներ", "Node: Patients"), nodeDoctors: L("Հանգույց՝ Բժիշկներ", "Node: Doctors"), nodeLabs: L("Հանգույց՝ Լաբորատորիա", "Node: Labs"),
  nodePharmacy: L("Հանգույց՝ Դեղատուն", "Node: Pharmacy"), nodeRecords: L("Հանգույց՝ Գրառումներ", "Node: Records"), nodeAnalytics: L("Հանգույց՝ Վերլուծություն", "Node: Analytics"),
  learnMore: L("«Մանրամասն» պիտակ", "“Learn more” label"), visit: L("«Այցելել կայք» պիտակ", "“Visit website” label"),
  chip1t: L("Չիփ 1 — վերնագիր", "Chip 1 — title"), chip1s: L("Չիփ 1 — ենթագիր", "Chip 1 — sub"), chip2t: L("Չիփ 2 — վերնագիր", "Chip 2 — title"), chip2s: L("Չիփ 2 — ենթագիր", "Chip 2 — sub"), chip3t: L("Չիփ 3 — վերնագիր", "Chip 3 — title"), chip3s: L("Չիփ 3 — ենթագիր", "Chip 3 — sub"),
  item1: L("Կետ 1", "Item 1"), item2: L("Կետ 2", "Item 2"), item3: L("Կետ 3", "Item 3"), item4: L("Կետ 4", "Item 4"), item5: L("Կետ 5", "Item 5"), item6: L("Կետ 6", "Item 6"),
  s1n: L("Թիվ 1", "Number 1"), s1l: L("Ենթագիր 1", "Label 1"), s2n: L("Թիվ 2", "Number 2"), s2l: L("Ենթագիր 2", "Label 2"), s3n: L("Թիվ 3", "Number 3"), s3l: L("Ենթագիր 3", "Label 3"), s4n: L("Թիվ 4", "Number 4"), s4l: L("Ենթագիր 4", "Label 4"),
  btn1: L("Կոճակ 1", "Button 1"), btn2: L("Կոճակ 2", "Button 2"),
  demoEyebrow: L("Դեմո — փոքր վերնագիր", "Demo — eyebrow"), demoTitle: L("Դեմո — վերնագիր", "Demo — title"), demoBody: L("Դեմո — տեքստ", "Demo — body"),
  vid1t: L("Վիդեո 1 — վերնագիր", "Video 1 — title"), vid1s: L("Վիդեո 1 — ենթագիր", "Video 1 — sub"), vid2t: L("Վիդեո 2 — վերնագիր", "Video 2 — title"), vid2s: L("Վիդեո 2 — ենթագիր", "Video 2 — sub"), vid3t: L("Վիդեո 3 — վերնագիր", "Video 3 — title"), vid3s: L("Վիդեո 3 — ենթագիր", "Video 3 — sub"),
  ctaTitle: L("CTA — վերնագիր", "CTA — title"), ctaBody: L("CTA — տեքստ", "CTA — body"), ctaBtn: L("CTA — կոճակ", "CTA — button"),
  valEyebrow: L("Արժեք — փոքր վերնագիր", "Value — eyebrow"), valTitle: L("Արժեք — վերնագիր", "Value — title"),
  val1e: L("Արժեք 1 — էմոջի", "Value 1 — emoji"), val2e: L("Արժեք 2 — էմոջի", "Value 2 — emoji"), val3e: L("Արժեք 3 — էմոջի", "Value 3 — emoji"),
  val1t: L("Արժեք 1 — վերնագիր", "Value 1 — title"), val1d: L("Արժեք 1 — տեքստ", "Value 1 — text"), val2t: L("Արժեք 2 — վերնագիր", "Value 2 — title"), val2d: L("Արժեք 2 — տեքստ", "Value 2 — text"), val3t: L("Արժեք 3 — վերնագիր", "Value 3 — title"), val3d: L("Արժեք 3 — տեքստ", "Value 3 — text"),
  missionLabel: L("Առաքելություն — պիտակ", "Mission — label"), missionTitle: L("Առաքելություն — վերնագիր", "Mission — title"), missionDesc: L("Առաքելություն — տեքստ", "Mission — text"),
  visionLabel: L("Տեսլական — պիտակ", "Vision — label"), visionTitle: L("Տեսլական — վերնագիր", "Vision — title"), visionDesc: L("Տեսլական — տեքստ", "Vision — text"),
  storyEyebrow: L("Պատմություն — փոքր վերնագիր", "Story — eyebrow"), storyTitle: L("Պատմություն — վերնագիր", "Story — title"), storyP1: L("Պատմություն — պարբ. 1", "Story — paragraph 1"), storyP2: L("Պատմություն — պարբ. 2", "Story — paragraph 2"),
  cmpEyebrow: L("Համեմատ. — փոքր վերնագիր", "Comparison — eyebrow"), cmpTitle: L("Համեմատ. — վերնագիր", "Comparison — title"), cmpBody: L("Համեմատ. — տեքստ", "Comparison — body"), cmpFeature: L("Սյուն՝ Հատկություն", "Column: Feature"), cmpHospit: L("Սյուն՝ HospIT", "Column: HospIT"), cmpTrad: L("Սյուն՝ Ավանդական", "Column: Traditional"),
  emailLbl: L("Պիտակ՝ Էլ. փոստ", "Label: Email"), phoneLbl: L("Պիտակ՝ Հեռ.", "Label: Phone"), locationLbl: L("Պիտակ՝ Հասցե", "Label: Location"),
  formTitle: L("Ձևի վերնագիր", "Form title"), fName: L("Դաշտ՝ Անուն", "Field: Name"), fNamePh: L("Անուն — հուշում", "Name — placeholder"), fEmail: L("Դաշտ՝ Էլ. փոստ", "Field: Email"), fEmailPh: L("Էլ.փոստ — հուշում", "Email — placeholder"),
  fSubject: L("Դաշտ՝ Թեմա", "Field: Subject"), fSubjectPh: L("Թեմա — հուշում", "Subject — placeholder"), fMessage: L("Դաշտ՝ Հաղորդագրություն", "Field: Message"), fMessagePh: L("Հաղ. — հուշում", "Message — placeholder"),
  fSend: L("Ուղարկելու կոճակ", "Send button"), fSending: L("«Ուղարկվում է…»", "“Sending…”"), successTitle: L("Հաջողություն — վերնագիր", "Success — title"), successBody: L("Հաջողություն — տեքստ", "Success — text"), successAgain: L("«Ուղարկել ևս մեկ»", "“Send another”"),
  tagline: L("Կարգախոս", "Tagline"), platform: L("«Հարթակ» վերնագիր", "“Platform” heading"), company: L("«Ընկերություն» վերնագիր", "“Company” heading"), contactLabel: L("«Կապ» վերնագիր", "“Contact” heading"), copy: L("Հեղինակային իրավունք", "Copyright"), privacy: L("«Գաղտնիություն»", "“Privacy”"), terms: L("«Պայմաններ»", "“Terms”"),
};

export default function TextsEditor({ texts }: { texts: TextTree }) {
  const { at } = useAdminI18n();
  const [tree, setTree] = useState<TextTree>(JSON.parse(JSON.stringify(texts)));
  const [open, setOpen] = useState<string | null>("hero");
  const [busy, setBusy] = useState(false);
  const { show, node } = useToast();

  const getML = (section: string, field: string): ML => ({
    hy: (tree.hy as any)[section]?.[field] ?? "",
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
    show(res.ok ? at("Պահպանված է ✓", "Saved ✓") : at("Սխալ: ", "Error: ") + (res.error || ""));
  }

  const saveBtn = <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy}>{busy ? "…" : at("Պահպանել բոլորը", "Save all")}</button>;

  return (
    <div>
      {node}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "sticky", top: 0, background: "var(--a-bg)", paddingBottom: 12, zIndex: 5 }}>
        <div>
          <h1 className="adm-h1">{at("Կայքի տեքստեր", "Site texts")}</h1>
          <p className="adm-sub">{at("Խմբագրեք կայքի բոլոր տեքստերը երեք լեզվով (Հայերեն / English / Русский)։", "Edit all site texts in three languages (Armenian / English / Russian).")}</p>
        </div>
        {saveBtn}
      </div>

      {SECTIONS.map(({ key: section, title }) => {
        const fields = Object.keys((tree.hy as any)[section] || {});
        const isOpen = open === section;
        return (
          <div key={section} className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
            <button onClick={() => setOpen(isOpen ? null : section)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "transparent", border: "none", color: "var(--a-text)", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 700 }}>
              {at(title)}
              <span style={{ color: "var(--a-faint)", transform: isOpen ? "rotate(180deg)" : "none", transition: ".2s" }}>▾</span>
            </button>
            {isOpen && (
              <div style={{ padding: "4px 20px 20px", borderTop: "1px solid var(--a-border)" }}>
                {fields.map((f) => (
                  <MLInput key={f} label={FL[f] ? at(FL[f]) : f} value={getML(section, f)} onChange={(v) => setML(section, f, v)} area={/desc|body|text$|sub$|tagline|storyP|p\ds|Desc$/i.test(f)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>{saveBtn}</div>
    </div>
  );
}
