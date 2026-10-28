// Գեներացնում է supabase/seed.sql-ը defaults.ts-ից (մեկ ճշմարտության աղբյուր)։
// Գործարկել՝  node scripts/gen-seed.ts
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  DEFAULT_TEXTS, DEFAULT_SETTINGS, DEFAULT_MODULES, DEFAULT_BENEFITS,
  DEFAULT_WHYSTATS, DEFAULT_INDUSTRIES, DEFAULT_CLIENTS, DEFAULT_PARTNERS,
  DEFAULT_STORIES, DEFAULT_PROOF,
} from "../src/lib/defaults.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const j = (o: unknown) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
const s = (v: string | null) => (v == null ? "null" : `'${v.replace(/'/g, "''")}'`);
const n = (v: number) => String(v);
const b = (v: boolean) => (v ? "true" : "false");

const rows: string[] = [];
rows.push("-- LuysTech seed — գեներացված defaults.ts-ից։ Գործարկել schema.sql-ից հետո։\n");

rows.push(`insert into public.site_texts (id, data) values (1, ${j(DEFAULT_TEXTS)})
  on conflict (id) do update set data = excluded.data;\n`);
rows.push(`insert into public.app_settings (id, data) values (1, ${j(DEFAULT_SETTINGS)})
  on conflict (id) do update set data = excluded.data;\n`);

for (const m of DEFAULT_MODULES)
  rows.push(`insert into public.modules (id,key,icon,image_url,image_url_light,title,"desc",sort,active) values (${s(m.id)},${s(m.key)},${s(m.icon)},${s(m.image_url)},${s(m.image_url_light)},${j(m.title)},${j(m.desc)},${n(m.sort)},${b(m.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_BENEFITS)
  rows.push(`insert into public.benefits (id,icon,title,"desc",sort,active) values (${s(x.id)},${s(x.icon)},${j(x.title)},${j(x.desc)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_WHYSTATS)
  rows.push(`insert into public.why_stats (id,target,suffix,decimals,label,sort) values (${s(x.id)},${n(x.target)},${s(x.suffix)},${n(x.decimals)},${j(x.label)},${n(x.sort)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_INDUSTRIES)
  rows.push(`insert into public.industries (id,icon,name,"desc",sort,active) values (${s(x.id)},${s(x.icon)},${j(x.name)},${j(x.desc)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_CLIENTS)
  rows.push(`insert into public.clients (id,name,logo_url,logo_mode,url,sort,active) values (${s(x.id)},${s(x.name)},${s(x.logo_url)},${s(x.logo_mode)},${s(x.url)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_PARTNERS)
  rows.push(`insert into public.partners (id,name,logo_url,logo_mode,"desc",long,link,sort,active) values (${s(x.id)},${s(x.name)},${s(x.logo_url)},${s(x.logo_mode)},${j(x.desc)},${j(x.long)},${s(x.link)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_STORIES)
  rows.push(`insert into public.stories (id,name,logo_url,industry,challenge,solution,metrics,sort,active) values (${s(x.id)},${s(x.name)},${s(x.logo_url)},${j(x.industry)},${j(x.challenge)},${j(x.solution)},${j(x.metrics)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_PROOF)
  rows.push(`insert into public.proof (id,target,suffix,label,sort) values (${s(x.id)},${n(x.target)},${s(x.suffix)},${j(x.label)},${n(x.sort)}) on conflict (id) do nothing;`);

const out = join(__dirname, "..", "supabase", "seed.sql");
writeFileSync(out, rows.join("\n") + "\n", "utf8");
console.log("Wrote", out, "—", rows.length, "statements");
