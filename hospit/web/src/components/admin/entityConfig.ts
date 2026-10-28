import type { Field } from "./EntityEditor";
import { L, type Bi } from "./bi";

const eml = () => ({ hy: "", en: "", ru: "" });

export type EntityCfg = {
  table: string; title: Bi; sub: Bi; titleKey: string;
  fields: Field[]; defaults: Record<string, any>;
};

const F = {
  icon: { key: "icon", label: L("Պատկերակ", "Icon"), kind: "icon" } as Field,
  title: { key: "title", label: L("Վերնագիր", "Title"), kind: "ml" } as Field,
  desc: { key: "desc", label: L("Նկարագրություն", "Description"), kind: "ml", area: true } as Field,
  sort: { key: "sort", label: L("Հերթականություն", "Order"), kind: "number" } as Field,
  active: { key: "active", label: L("Ակտիվ (ցուցադրվում է կայքում)", "Active (shown on site)"), kind: "bool" } as Field,
};

export const ENTITY: Record<string, EntityCfg> = {
  features: {
    table: "features", titleKey: "title",
    title: L("Հնարավորություններ", "Features"),
    sub: L("Գլխավոր էջի «Հիմնական հնարավորություններ» բաժնի քարտերը (4)։", "The cards in the home page “Core Capabilities” section (4)."),
    fields: [F.icon, F.title, F.desc, F.sort, F.active],
    defaults: { icon: "patient", title: eml(), desc: eml(), sort: 0, active: true },
  },
  services: {
    table: "services", titleKey: "title",
    title: L("Ծառայություններ", "Services"),
    sub: L("«Ծառայություններ» էջի քարտերը՝ նկարագրությամբ և կետերով։", "The Services page cards with description and bullet points."),
    fields: [
      F.icon, F.title, F.desc,
      { key: "bullets", label: L("Կետեր (յուրաքանչյուրը նոր տողում)", "Bullet points (one per line)"), kind: "ml", area: true, help: L("Յուրաքանչյուր կետը՝ առանձին տողում։", "Put each bullet on its own line.") },
      F.sort, F.active,
    ],
    defaults: { icon: "patient", title: eml(), desc: eml(), bullets: eml(), sort: 0, active: true },
  },
  partners: {
    table: "partners", titleKey: "name",
    title: L("Գործընկերներ", "Partners"),
    sub: L("«Գործընկերներ» էջի լոգոները (շարժվող շերտ)։", "The logos on the Partners page (moving strip)."),
    fields: [
      { key: "name", label: L("Անվանում", "Name"), kind: "text" },
      { key: "logo_url", label: L("Լոգո", "Logo"), kind: "image", folder: "partners" },
      F.sort, F.active,
    ],
    defaults: { name: "", logo_url: null, sort: 0, active: true },
  },
  clients: {
    table: "clients", titleKey: "name",
    title: L("Հաճախորդներ (Մեզ վստահում են)", "Clients (Trusted by)"),
    sub: L("Գլխավոր էջի «Մեզ վստահում են» բաժնի բժշկական կազմակերպությունների լոգոները։", "The medical organization logos in the home page “Trusted by” section."),
    fields: [
      { key: "name", label: L("Անվանում", "Name"), kind: "text" },
      { key: "logo_url", label: L("Լոգո", "Logo"), kind: "image", folder: "clients" },
      F.sort, F.active,
    ],
    defaults: { name: "", logo_url: null, sort: 0, active: true },
  },
  values: {
    table: "about_values", titleKey: "title",
    title: L("Արժեքներ", "Values"),
    sub: L("«Մեր մասին» էջի «Հիմնարար արժեքներ» քարտերը։", "The “Core Values” cards on the About page."),
    fields: [
      { key: "emoji", label: L("Էմոջի / պատկեր", "Emoji / symbol"), kind: "text", help: L("Օր.՝ ⚡ 🛡️ 🎯", "e.g. ⚡ 🛡️ 🎯") },
      F.title, F.desc, F.sort, F.active,
    ],
    defaults: { emoji: "⭐", title: eml(), desc: eml(), sort: 0, active: true },
  },
  timeline: {
    table: "timeline", titleKey: "title",
    title: L("Ժամանակագրություն", "Timeline"),
    sub: L("«Մեր մասին» էջի «Մեր պատմությունը» ժամանակագրությունը։", "The “Our Story” timeline on the About page."),
    fields: [
      { key: "year", label: L("Տարի", "Year"), kind: "text" },
      F.title, F.desc, F.sort, F.active,
    ],
    defaults: { year: "2026", title: eml(), desc: eml(), sort: 0, active: true },
  },
  advantages: {
    table: "advantages", titleKey: "title",
    title: L("Առավելություններ", "Advantages"),
    sub: L("«Ինչու մենք» էջի առավելությունների քարտերը՝ մեծ թվերով։", "The “Why Us” advantage cards with big stats."),
    fields: [
      { key: "emoji", label: L("Էմոջի / պատկեր", "Emoji / symbol"), kind: "text" },
      F.title, F.desc,
      { key: "stat", label: L("Թիվ (օր.՝ 70%, 3hrs)", "Stat (e.g. 70%, 3hrs)"), kind: "text" },
      { key: "stat_label", label: L("Թվի ենթագիր", "Stat label"), kind: "ml" },
      F.sort, F.active,
    ],
    defaults: { emoji: "⚡", title: eml(), desc: eml(), stat: "", stat_label: eml(), sort: 0, active: true },
  },
  comparisons: {
    table: "comparisons", titleKey: "feature",
    title: L("Համեմատության տողեր", "Comparison rows"),
    sub: L("«Ինչու մենք» էջի HospIT vs Ավանդական աղյուսակի տողերը։", "The rows of the HospIT vs Traditional table on the Why Us page."),
    fields: [
      { key: "feature", label: L("Հատկություն", "Feature"), kind: "ml" },
      F.sort, F.active,
    ],
    defaults: { feature: eml(), sort: 0, active: true },
  },
};
