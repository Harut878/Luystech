// Գեներացնում է db/seed.sql-ը defaults.ts-ից (մեկ ճշմարտության աղբյուր)։
// Գործարկել՝  npm run db:gen-seed
// Բոլոր insert-ները «on conflict do nothing» են. կրկին գործարկելը ՉԻ վերագրում ադմինկայում փոխված բովանդակությունը։
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  DEFAULT_TEXTS, DEFAULT_SETTINGS, DEFAULT_FEATURES, DEFAULT_SERVICES,
  DEFAULT_PARTNERS, DEFAULT_CLIENTS, DEFAULT_VALUES, DEFAULT_TIMELINE, DEFAULT_ADVANTAGES, DEFAULT_COMPARISONS,
} from "../src/lib/defaults.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const j = (o: unknown) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
const s = (v: string | null) => (v == null ? "null" : `'${v.replace(/'/g, "''")}'`);
const n = (v: number) => String(v);
const b = (v: boolean) => (v ? "true" : "false");

const rows: string[] = [];
rows.push("-- HospIT seed — generated from src/lib/defaults.ts (npm run db:gen-seed). Run after schema.sql.\n-- Safe to re-run: existing rows are never overwritten.\n");

rows.push(`insert into site_texts (id, data) values (1, ${j(DEFAULT_TEXTS)})
  on conflict (id) do nothing;\n`);
rows.push(`insert into app_settings (id, data) values (1, ${j(DEFAULT_SETTINGS)})
  on conflict (id) do nothing;\n`);

for (const x of DEFAULT_FEATURES)
  rows.push(`insert into features (id,icon,title,"desc",sort,active) values (${s(x.id)},${s(x.icon)},${j(x.title)},${j(x.desc)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_SERVICES)
  rows.push(`insert into services (id,icon,title,"desc",bullets,sort,active) values (${s(x.id)},${s(x.icon)},${j(x.title)},${j(x.desc)},${j(x.bullets)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_PARTNERS)
  rows.push(`insert into partners (id,name,logo_url,sort,active) values (${s(x.id)},${s(x.name)},${s(x.logo_url)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_CLIENTS)
  rows.push(`insert into clients (id,name,logo_url,sort,active) values (${s(x.id)},${s(x.name)},${s(x.logo_url)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_VALUES)
  rows.push(`insert into about_values (id,emoji,title,"desc",sort,active) values (${s(x.id)},${s(x.emoji)},${j(x.title)},${j(x.desc)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_TIMELINE)
  rows.push(`insert into timeline (id,year,title,"desc",sort,active) values (${s(x.id)},${s(x.year)},${j(x.title)},${j(x.desc)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_ADVANTAGES)
  rows.push(`insert into advantages (id,emoji,title,"desc",stat,stat_label,sort,active) values (${s(x.id)},${s(x.emoji)},${j(x.title)},${j(x.desc)},${s(x.stat)},${j(x.stat_label)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

for (const x of DEFAULT_COMPARISONS)
  rows.push(`insert into comparisons (id,feature,sort,active) values (${s(x.id)},${j(x.feature)},${n(x.sort)},${b(x.active)}) on conflict (id) do nothing;`);

const out = join(__dirname, "..", "db", "seed.sql");
writeFileSync(out, rows.join("\n") + "\n", "utf8");
console.log("Wrote", out, "—", rows.length, "statements");
