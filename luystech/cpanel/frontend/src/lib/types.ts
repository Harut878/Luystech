// LuysTech — տվյալների տիպերը (DB-ի և ֆոլբեքի համար)

export type Lang = "am" | "en" | "ru";
export const LANGS: Lang[] = ["am", "en", "ru"];
export const DEFAULT_LANG: Lang = "am";

export type Role = "admin" | "client";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  created_at?: string;
};

// 3-լեզու տեքստային դաշտ
export type ML = { am: string; en: string; ru: string };

// Icon բանալիներ (SVG-ները սահմանված են icons.ts-ում)
export type IconKey =
  | "trend" | "cart" | "box" | "factory" | "truck" | "coin"
  | "gear" | "hub" | "chart" | "shield" | "bolt" | "store" | "people";

export type Module = {
  id: string;
  key: string;
  icon: IconKey;
  image_url: string | null;
  image_url_light: string | null;
  title: ML;
  desc: ML;
  long: ML;
  video_url: string | null;
  sort: number;
  active: boolean;
};

export type Benefit = {
  id: string;
  icon: IconKey;
  title: ML;
  desc: ML;
  sort: number;
  active: boolean;
};

export type WhyStat = {
  id: string;
  target: number;
  suffix: string;
  decimals: number;
  label: ML;
  sort: number;
};

export type Industry = {
  id: string;
  icon: IconKey;
  name: ML;
  desc: ML;
  sort: number;
  active: boolean;
};

export type LogoMode = "both" | "dark" | "light";

export type Client = {
  id: string;
  name: string;
  logo_url: string | null;
  logo_mode: LogoMode;
  url: string;
  sort: number;
  active: boolean;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  logo_mode: LogoMode;
  desc: ML;
  long: ML;
  link: string;
  sort: number;
  active: boolean;
};

export type StoryMetric = { target: number; suffix: string; decimals: number; label: ML };

export type Story = {
  id: string;
  name: string;
  logo_url: string | null;
  industry: ML;
  challenge: ML;
  solution: ML;
  metrics: StoryMetric[];
  sort: number;
  active: boolean;
};

export type Proof = {
  id: string;
  target: number;
  suffix: string;
  label: ML;
  sort: number;
};

export type SocialPlatform = "linkedin" | "facebook" | "instagram" | "youtube" | "telegram" | "x" | "tiktok";
export type SocialLink = { platform: SocialPlatform; url: string };

export type Settings = {
  phone: string;
  email: string;
  address: ML;
  hours: ML;
  socials: SocialLink[];
  map_embed: string;
  default_lang: Lang;
  default_theme: "dark" | "light";
  accent_yellow: boolean;
  heading_weight: number;
  body_weight: number;
  // Վիդեո «Ինչու BC» բաժնում (եռալեզու, դատարկ՝ չի ցուցադրվում)
  promo_video: ML;
  // Ամբողջ բաժինների տեսանելիությունը կայքում (ON/OFF)
  sections: SectionFlags;
};

export type SectionKey = "about" | "bc" | "benefits" | "stats" | "industries" | "clients" | "partners" | "stories" | "proof" | "demo";
export type SectionFlags = Record<SectionKey, boolean>;

export type ContactRequest = {
  id: string;
  company: string;
  person: string;
  phone: string;
  email: string;
  message: string;
  status: "new" | "contacted" | "done";
  created_at: string;
};

// Ամբողջ կայքի բովանդակությունը մեկ օբյեկտում (server → client)
export type SiteContent = {
  texts: TextTree;
  modules: Module[];
  benefits: Benefit[];
  whyStats: WhyStat[];
  industries: Industry[];
  clients: Client[];
  partners: Partner[];
  stories: Story[];
  proof: Proof[];
  settings: Settings;
};

// Ստատիկ (ոչ-ցուցակ) տեքստերը՝ ըստ լեզվի
export type TextTree = Record<Lang, LangTexts>;

export type LangTexts = {
  nav: { about: string; product: string; why: string; industries: string; trust: string; contact: string; cta: string };
  hero: { badge: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  about: {
    kicker: string; title: string; lead: string;
    whoLabel: string; whoText: string;
    whatLabel: string; whatText: string;
    missionLabel: string; missionText: string;
    visionLabel: string; visionText: string;
  };
  bc: { kicker: string; title: string; desc: string };
  why: { kicker: string; title: string };
  industries: { kicker: string; title: string };
  trust: {
    clientsKicker: string; clientsTitle: string;
    partnersKicker: string; partnersTitle: string;
    successKicker: string; successTitle: string;
    challenge: string; solution: string;
  };
  demo: { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  contact: {
    kicker: string; title: string;
    company: string; person: string; phone: string; email: string; message: string; submit: string; success: string;
    phoneLabel: string; emailLabel: string; addressLabel: string; hoursLabel: string; mapText: string;
  };
  footer: { desc: string; quickTitle: string; langTitle: string; rights: string };
  common: { visit: string; viewStory: string; watchVideo: string; close: string; results: string };
};
