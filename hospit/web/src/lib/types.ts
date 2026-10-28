// HospIT — տվյալների տիպերը (DB-ի և ֆոլբեքի համար)

import type { QuizConfig } from "./quiz";

export type Lang = "hy" | "en" | "ru";
export const LANGS: Lang[] = ["hy", "en", "ru"];
export const DEFAULT_LANG: Lang = "en";

// 3-լեզու տեքստային դաշտ
export type ML = { hy: string; en: string; ru: string };

// Icon բանալիներ (SVG-ները սահմանված են icons.ts-ում)
export type IconKey =
  | "patient" | "calendar" | "chart" | "shield" | "heart" | "activity"
  | "stethoscope" | "pill" | "lab" | "records" | "hub" | "bolt"
  | "lock" | "clock" | "target" | "ruler" | "bell" | "cloud";

// ── Repeatable ցուցակների տողեր ──

export type Feature = {
  id: string;
  icon: IconKey;
  title: ML;
  desc: ML;
  sort: number;
  active: boolean;
};

export type Service = {
  id: string;
  icon: IconKey;
  title: ML;
  desc: ML;
  bullets: ML; // մեկ ML դաշտ, կետերը՝ նոր տողով բաժանված
  sort: number;
  active: boolean;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  sort: number;
  active: boolean;
};

// Բժշկական կազմակերպություններ, որ օգտվում են HospIT-ից («Մեզ վստահում են»)
export type Client = {
  id: string;
  name: string;
  logo_url: string | null;
  sort: number;
  active: boolean;
};

export type AboutValue = {
  id: string;
  emoji: string;
  title: ML;
  desc: ML;
  sort: number;
  active: boolean;
};

export type TimelineItem = {
  id: string;
  year: string;
  title: ML;
  desc: ML;
  sort: number;
  active: boolean;
};

export type Advantage = {
  id: string;
  emoji: string;
  title: ML;
  desc: ML;
  stat: string;
  stat_label: ML;
  sort: number;
  active: boolean;
};

export type ComparisonRow = {
  id: string;
  feature: ML;
  sort: number;
  active: boolean;
};

// ── Համեմատության աղյուսակ (ամբողջովին ադմինից խմբագրելի) ──
// Համակարգ = սյուն։ Արժեք = "yes" | "no" | "partial" | ազատ տեքստ։
export type CompareSystem = { id: string; name: ML; highlight: boolean; active: boolean; sort: number };
export type CompareRow = { id: string; feature: ML; values: Record<string, string>; active: boolean; sort: number };
export type ComparisonConfig = { systems: CompareSystem[]; rows: CompareRow[] };

// Հաճախ տրվող հարցեր
export type Faq = {
  id: string;
  question: ML;
  answer: ML;
  sort: number;
  active: boolean;
};

// Ինտեգրացիաներ (հարթակներ, որոնց հետ միացած ենք)
export type Integration = {
  id: string;
  name: string;
  logo_url: string | null;
  desc: ML;
  link: string;
  sort: number;
  active: boolean;
};

// ── Գնային հաշվիչի կոնֆիգ (ադմինից խմբագրելի) ──
export type PlanKey = "basic" | "clinic" | "hospital";
export type PricingPlan = {
  id: PlanKey; name: string; shortLabel: string; description: string;
  basePrice: number; includedEmployees: number; sliderMax: number;
};
// Գնային հաշվիչի ինտերֆեյսի բոլոր տեքստերը (ադմինից խմբագրելի)
export type PricingLabels = {
  eyebrow: string; title: string; monthlyFrom: string; includedPrefix: string; includedSuffix: string;
  choosePlan: string; back: string; basePackagePrefix: string; employeeCount: string;
  includedChip: string; extraChip: string;
  summaryTitle: string; basePackage: string; extraUsers: string; subtotal: string;
  total: string; orderNow: string;
  addonsTitle: string;
  smartTitle: string; smartSub: string; smartWhy: string; currentPrice: string; newPrice: string;
  saveText: string; noExtraFees: string; switchTo: string; backTo: string;
  formTitle: string; formPlan: string; fFirstName: string; fLastName: string; fPhone: string; fEmail: string; fCompany: string;
  formNote: string; submit: string; submitting: string; orCall: string; required: string; badFormat: string; successMsg: string;
};

export type PricingConfig = {
  labels: PricingLabels;
  extraEmployeePrice: number;
  addonPriceByPlan: { basic: number; clinic: number; hospital: number };
  features: { label: string; items: string[] }[];
  guarantees: string[];
  serverNote: string;
  plans: PricingPlan[];
  addons: { id: string; label: string }[];
};

// ── Օգտատերերի հաշիվներ ──
// Իրավասությունը և հաշվի տվյալները պահվում են users աղյուսակում.
// դրանք կարող է փոխել ՄԻԱՅՆ ադմինը (սերվերում), օգտատերը ինքը՝ ոչ։
export type AppRole = "admin" | "client";
export type SubStatus = "pending" | "active" | "suspended" | "expired";

export type Subscription = {
  status: SubStatus;
  plan: PlanKey | "";
  employees: number;
  addons: string[];
  monthly_price: number;   // ֏, պայմանագրային գինը (կարող է տարբերվել հաշվարկայինից)
  start_date: string;      // YYYY-MM-DD
  end_date: string;        // YYYY-MM-DD
  payment_terms: string;   // օր.՝ «Ամսական, կանխավճարով»
  terms: string;           // պայմանագրի պայմանները՝ տեսանելի հաճախորդին
};

export type Account = {
  id: string;
  email: string;
  role: AppRole;
  full_name: string;
  phone: string;
  institution: string;
  subscription: Subscription;
  created_at: string;
  last_sign_in_at: string | null;
};

export type Settings = {
  accent_hue: number;
  default_theme: "dark" | "light";
  default_lang: Lang;
  section_spacing: "compact" | "comfortable" | "spacious";
  email: string;
  phone: string;
  address: ML;
  map_query: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  demo_url: string;
  privacy: ML;   // Գաղտնիության քաղաքականության տեքստը (բացվում է footer-ից)
  comparison: ComparisonConfig;  // «HospIT vs այլ համակարգեր» աղյուսակը
  // Կայքի նկարները (ադմինից փոխարինելի)
  logo_url: string;          // վերևի և ներքևի լոգոն
  hero_image_url: string;    // գլխավոր էջի թռչող պատկերը
  preview_image_url: string; // «Տեսեք HospIT-ը գործընթացի մեջ» նկարը
  partners_bg_url: string;   // «Գործընկերներ» էջի ֆոնային պատկերը
  pricing: PricingConfig;
  // Պահվում են app_settings-ում (առանձին աղյուսակ պետք չէ)
  faqs: Faq[];
  integrations: Integration[];
  quiz: QuizConfig;   // Ցուցահանդեսի վիկտորինա (/quiz)
};

export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "contacted" | "done";
  created_at: string;
};

// Ամբողջ կայքի բովանդակությունը մեկ օբյեկտում (server → client)
export type SiteContent = {
  texts: TextTree;
  features: Feature[];
  services: Service[];
  partners: Partner[];
  clients: Client[];
  values: AboutValue[];
  timeline: TimelineItem[];
  advantages: Advantage[];
  comparisons: ComparisonRow[];
  faqs: Faq[];
  integrations: Integration[];
  settings: Settings;
};

// Ստատիկ (ոչ-ցուցակ) տեքստերը՝ ըստ լեզվի
export type TextTree = Record<Lang, LangTexts>;

export type LangTexts = {
  nav: { home: string; services: string; partners: string; pricing: string; about: string; whyus: string; contact: string; cta: string; login: string; account: string; admin: string };
  hero: {
    eyebrow: string; title: string; body: string; cta1: string; cta2: string;
    stat1n: string; stat1l: string; stat2n: string; stat2l: string; stat3n: string; stat3l: string;
  };
  feat: { eyebrow: string; title: string; body: string };
  preview: {
    eyebrow: string; title: string; body: string;
    p1t: string; p1s: string; p2t: string; p2s: string; p3t: string; p3s: string; cta: string;
  };
  connected: {
    eyebrow: string; title: string; body: string;
    chip1t: string; chip1s: string; chip2t: string; chip2s: string; chip3t: string; chip3s: string;
    nodePatients: string; nodeDoctors: string; nodeLabs: string; nodePharmacy: string; nodeRecords: string; nodeAnalytics: string;
  };
  faq: { eyebrow: string; title: string; body: string };
  integrations: { eyebrow: string; title: string; body: string; learnMore: string; visit: string };
  whyHome: {
    eyebrow: string; title: string; body: string; cta: string;
    item1: string; item2: string; item3: string; item4: string; item5: string; item6: string;
  };
  trusted: { eyebrow: string; title: string; body: string };
  stats: { s1n: string; s1l: string; s2n: string; s2l: string; s3n: string; s3l: string; s4n: string; s4l: string };
  cta: { title: string; body: string; btn1: string; btn2: string };
  svcPage: {
    eyebrow: string; title: string; body: string;
    demoEyebrow: string; demoTitle: string; demoBody: string;
    vid1t: string; vid1s: string; vid2t: string; vid2s: string; vid3t: string; vid3s: string;
    ctaTitle: string; ctaBody: string; ctaBtn: string;
  };
  parPage: {
    eyebrow: string; title: string; body: string;
    valEyebrow: string; valTitle: string;
    val1t: string; val1d: string; val1e: string; val2t: string; val2d: string; val2e: string; val3t: string; val3d: string; val3e: string;
  };
  about: {
    eyebrow: string; title: string; body: string;
    missionLabel: string; missionTitle: string; missionDesc: string;
    visionLabel: string; visionTitle: string; visionDesc: string;
    storyEyebrow: string; storyTitle: string; storyP1: string; storyP2: string;
    valEyebrow: string; valTitle: string;
  };
  whyPage: {
    eyebrow: string; title: string; body: string;
    cmpEyebrow: string; cmpTitle: string; cmpBody: string;
    cmpFeature: string; cmpHospit: string; cmpTrad: string;
    ctaTitle: string; ctaBody: string; ctaBtn: string;
  };
  contact: {
    eyebrow: string; title: string; body: string;
    emailLbl: string; phoneLbl: string; locationLbl: string;
    formTitle: string; fName: string; fNamePh: string; fEmail: string; fEmailPh: string;
    fSubject: string; fSubjectPh: string; fMessage: string; fMessagePh: string;
    fSend: string; fSending: string; successTitle: string; successBody: string; successAgain: string;
  };
  footer: { tagline: string; platform: string; company: string; contactLabel: string; copy: string; privacy: string; terms: string };
};
