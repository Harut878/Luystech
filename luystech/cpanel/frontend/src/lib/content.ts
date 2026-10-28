import { DEFAULT_CONTENT, DEFAULT_TEXTS, DEFAULT_SETTINGS } from "./defaults";
import snapshot from "./snapshot.json";
import { getContent } from "./api";
import type {
  SiteContent, TextTree, Settings, Module, Benefit, WhyStat,
  Industry, Client, Partner, Story, Proof,
} from "./types";

// DB-ի արժեքը default-ի վրա (DB-ում բացակայող դաշտերը վերցվում են default-ից)
function deepMerge<T>(base: T, over: any): T {
  if (over == null) return base;
  if (typeof base !== "object" || Array.isArray(base)) return (over ?? base) as T;
  const out: any = { ...base };
  // և՛ default-ի, և՛ DB-ի բանալիները (որ դինամիկ քարտեզները չկորչեն)
  const keys = new Set([...Object.keys(base as any), ...Object.keys(over || {})]);
  for (const k of keys) out[k] = deepMerge((base as any)[k], over?.[k]);
  return out;
}

// Թվային սյուները PostgreSQL-ից կարող են գալ տեքստով ("120")՝ բերում ենք թվի
const num = (v: any, d = 0) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? d : Number(v));
const normRow = <T>(r: any): T => ({
  ...r,
  ...("sort" in r ? { sort: num(r.sort) } : {}),
  ...("target" in r ? { target: num(r.target) } : {}),
  ...("decimals" in r ? { decimals: num(r.decimals) } : {}),
  ...("active" in r ? { active: r.active === true || r.active === "t" || r.active === "true" || r.active === 1 } : {}),
});

function list<T extends { sort: number }>(rows: any, fallback: T[], activeOnly: boolean): T[] {
  const src: any[] = Array.isArray(rows) && rows.length ? rows : fallback;
  return src.map((r) => normRow<T>(r))
    .filter((r: any) => !activeOnly || r.active !== false)
    .sort((a, b) => a.sort - b.sort);
}

// API-ի (կամ snapshot-ի) «հում» տվյալները → կայքի բովանդակություն
export function mergeContent(raw: any): SiteContent {
  return {
    texts: deepMerge<TextTree>(DEFAULT_TEXTS, raw?.texts),
    settings: deepMerge<Settings>(DEFAULT_SETTINGS, raw?.settings),
    modules: list<Module>(raw?.modules, DEFAULT_CONTENT.modules, true),
    benefits: list<Benefit>(raw?.benefits, DEFAULT_CONTENT.benefits, true),
    whyStats: list<WhyStat>(raw?.whyStats, DEFAULT_CONTENT.whyStats, false),
    industries: list<Industry>(raw?.industries, DEFAULT_CONTENT.industries, true),
    clients: list<Client>(raw?.clients, DEFAULT_CONTENT.clients, true),
    partners: list<Partner>(raw?.partners, DEFAULT_CONTENT.partners, true),
    stories: list<Story>(raw?.stories, DEFAULT_CONTENT.stories, true),
    proof: list<Proof>(raw?.proof, DEFAULT_CONTENT.proof, false),
  };
}

// Build-ի պահին «սառեցված» բովանդակություն՝ էջը միանգամից ցույց տալու և SEO-ի համար։
// Բրաուզերում այն անմիջապես փոխարինվում է բազայից եկած թարմ տվյալներով։
export const INITIAL_CONTENT: SiteContent = mergeContent(snapshot);

// Թարմ բովանդակություն բազայից (PHP API)
export async function fetchContent(): Promise<SiteContent | null> {
  const r = await getContent();
  if (!r.ok) return null;
  return mergeContent(r);
}

// Ադմինի համար՝ texts/settings ամբողջական (merge-ված) տեսքով
export async function fetchTextsAndSettings(): Promise<{ texts: TextTree; settings: Settings } | null> {
  const r = await getContent();
  if (!r.ok) return null;
  return { texts: deepMerge<TextTree>(DEFAULT_TEXTS, r.texts), settings: deepMerge<Settings>(DEFAULT_SETTINGS, r.settings) };
}
