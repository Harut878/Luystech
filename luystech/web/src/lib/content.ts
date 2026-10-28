import { createClient } from "./supabase/server";
import {
  DEFAULT_CONTENT, DEFAULT_TEXTS, DEFAULT_SETTINGS,
} from "./defaults";
import type {
  SiteContent, TextTree, Settings, Module, Benefit, WhyStat,
  Industry, Client, Partner, Story, Proof,
} from "./types";

// Ստուգում է՝ Supabase-ի բանալիները լրացված են թե ոչ
export function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return Boolean(url && !url.includes("XXXX") && anon);
}

// Խորը ձուլում (deep-merge)՝ DB-ի արժեքները դնում է ֆոլբեքի վրա
function deepMerge<T>(base: T, over: any): T {
  if (over == null) return base;
  if (typeof base !== "object" || Array.isArray(base)) return (over ?? base) as T;
  const out: any = { ...base };
  // Վերցնում ենք և՛ default-ի, և՛ DB-ի բանալիները (որ դինամիկ քարտեզները՝
  // օր. client_links, որոնց default-ը դատարկ {} է, չկորչեն)։
  const keys = new Set([...Object.keys(base as any), ...Object.keys(over || {})]);
  for (const k of keys) out[k] = deepMerge((base as any)[k], over?.[k]);
  return out;
}

function mergeTexts(dbData: any): TextTree {
  return deepMerge(DEFAULT_TEXTS, dbData);
}
function mergeSettings(dbData: any): Settings {
  return deepMerge(DEFAULT_SETTINGS, dbData);
}

// Ամբողջ կայքի բովանդակությունը՝ DB-ից, ֆոլբեքով
export async function loadContent(): Promise<SiteContent> {
  if (!supabaseConfigured()) return DEFAULT_CONTENT;

  try {
    const sb = await createClient();
    const [
      texts, settings, modules, benefits, whyStats,
      industries, clients, partners, stories, proof,
    ] = await Promise.all([
      sb.from("site_texts").select("data").eq("id", 1).maybeSingle(),
      sb.from("app_settings").select("data").eq("id", 1).maybeSingle(),
      sb.from("modules").select("*").order("sort"),
      sb.from("benefits").select("*").order("sort"),
      sb.from("why_stats").select("*").order("sort"),
      sb.from("industries").select("*").order("sort"),
      sb.from("clients").select("*").order("sort"),
      sb.from("partners").select("*").order("sort"),
      sb.from("stories").select("*").order("sort"),
      sb.from("proof").select("*").order("sort"),
    ]);

    const pick = <T>(rows: any, fallback: T[]): T[] =>
      rows?.data && rows.data.length ? (rows.data as T[]) : fallback;

    return {
      texts: mergeTexts(texts?.data?.data),
      settings: mergeSettings(settings?.data?.data),
      modules: pick<Module>(modules, DEFAULT_CONTENT.modules).filter((m) => m.active),
      benefits: pick<Benefit>(benefits, DEFAULT_CONTENT.benefits).filter((b) => b.active),
      whyStats: pick<WhyStat>(whyStats, DEFAULT_CONTENT.whyStats),
      industries: pick<Industry>(industries, DEFAULT_CONTENT.industries).filter((i) => i.active),
      clients: pick<Client>(clients, DEFAULT_CONTENT.clients).filter((c) => c.active),
      partners: pick<Partner>(partners, DEFAULT_CONTENT.partners).filter((p) => p.active),
      stories: pick<Story>(stories, DEFAULT_CONTENT.stories).filter((s) => s.active),
      proof: pick<Proof>(proof, DEFAULT_CONTENT.proof),
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}
