import { dbConfigured, q } from "./db";
import { DEFAULT_CONTENT, DEFAULT_TEXTS, DEFAULT_SETTINGS } from "./defaults";
import type {
  SiteContent, TextTree, Settings, Feature, Service, Partner, Client,
  AboutValue, TimelineItem, Advantage, ComparisonRow,
} from "./types";

// Բազայի խափանման դեպքում կայքը չպետք է «կախվի». կապը սպասում է առավելագույնը 5 վրկ
// (lib/db.ts), իսկ ամբողջական ձախողումից հետո OUTAGE_COOLDOWN_MS բազային չենք դիմում
// և միանգամից տալիս ենք ֆոլբեքը (defaults.ts)։
const OUTAGE_COOLDOWN_MS = 30_000;
let dbDownUntil = 0;

// Խորը ձուլում (deep-merge)՝ DB-ի արժեքները դնում է ֆոլբեքի վրա
function deepMerge<T>(base: T, over: any): T {
  if (over == null) return base;
  if (typeof base !== "object" || Array.isArray(base)) return (over ?? base) as T;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const k of Object.keys(base as any)) {
    out[k] = deepMerge((base as any)[k], over?.[k]);
  }
  return out;
}

function mergeTexts(dbData: any): TextTree {
  return deepMerge(DEFAULT_TEXTS, dbData);
}
export function mergeSettings(dbData: any): Settings {
  return deepMerge(DEFAULT_SETTINGS, dbData);
}

const LIST_TABLES = ["features", "services", "partners", "clients", "about_values", "timeline", "advantages", "comparisons"] as const;
type ListTable = (typeof LIST_TABLES)[number];
type Raw = { texts: any; settings: any } & Record<ListTable, any[]>;

// Ամբողջ բովանդակությունը՝ ՄԵԿ հարցմամբ (մեկ կապ, մեկ շրջապտույտ)
const CONTENT_SQL = `select
  (select data from site_texts where id = 1)   as texts,
  (select data from app_settings where id = 1) as settings,
  ${LIST_TABLES.map((t) => `(select coalesce(json_agg(x order by x.sort, x.id), '[]'::json) from ${t} x) as ${t}`).join(",\n  ")}`;

// Ամբողջ կայքի բովանդակությունը՝ DB-ից, ֆոլբեքով։
// forEditing (ադմինկա)՝ ֆոլբեք ՉԵՆՔ տալիս. եթե բազան չպատասխանի, նետում ենք սխալ,
// որպեսզի ադմինը չխմբագրի և չպահպանի սկզբնական տեքստերը իրականի փոխարեն։
export async function loadContent(opts: { forEditing?: boolean } = {}): Promise<SiteContent> {
  const strict = opts.forEditing === true;
  if (!dbConfigured()) {
    if (strict) throw new Error("DATABASE_URL is not set");
    return DEFAULT_CONTENT;
  }
  if (!strict && Date.now() < dbDownUntil) return DEFAULT_CONTENT;

  let raw: Raw;
  try {
    raw = (await q<Raw>(CONTENT_SQL))[0];
  } catch (err: any) {
    if (strict) throw new Error("Database unavailable: " + (err?.message || err));
    dbDownUntil = Date.now() + OUTAGE_COOLDOWN_MS;
    console.error("loadContent: database unreachable, serving defaults:", err?.message || err);
    return DEFAULT_CONTENT;
  }

  const pick = <T>(rows: any[] | null | undefined, fallback: T[]): T[] => (rows?.length ? (rows as T[]) : fallback);
  const mergedSettings = mergeSettings(raw.settings);

  return {
    texts: mergeTexts(raw.texts),
    settings: mergedSettings,
    features: pick<Feature>(raw.features, DEFAULT_CONTENT.features).filter((x) => x.active),
    services: pick<Service>(raw.services, DEFAULT_CONTENT.services).filter((x) => x.active),
    partners: pick<Partner>(raw.partners, DEFAULT_CONTENT.partners).filter((x) => x.active),
    clients: pick<Client>(raw.clients, DEFAULT_CONTENT.clients).filter((x) => x.active),
    values: pick<AboutValue>(raw.about_values, DEFAULT_CONTENT.values).filter((x) => x.active),
    timeline: pick<TimelineItem>(raw.timeline, DEFAULT_CONTENT.timeline).filter((x) => x.active),
    advantages: pick<Advantage>(raw.advantages, DEFAULT_CONTENT.advantages).filter((x) => x.active),
    comparisons: pick<ComparisonRow>(raw.comparisons, DEFAULT_CONTENT.comparisons).filter((x) => x.active),
    // FAQ և ինտեգրացիաները պահվում են app_settings-ում (առանձին աղյուսակ չկա)
    faqs: (mergedSettings.faqs || []).filter((x) => x.active),
    integrations: (mergedSettings.integrations || []).filter((x) => x.active),
  };
}
