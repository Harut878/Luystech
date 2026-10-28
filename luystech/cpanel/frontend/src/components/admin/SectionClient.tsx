"use client";

import { useEffect, useState } from "react";
import { ENTITY } from "./entityConfig";
import EntityEditor from "./EntityEditor";
import TextsEditor from "./TextsEditor";
import SettingsEditor from "./SettingsEditor";
import StoriesEditor from "./StoriesEditor";
import RequestsView from "./RequestsView";
import SectionToggle from "./SectionToggle";
import { listRows, getRequests } from "@/lib/api";
import { fetchTextsAndSettings } from "@/lib/content";
import type { Story, ContactRequest, SectionKey, TextTree, Settings } from "@/lib/types";

// Ո՞ր ադմին-էջը որ կայքի բաժինն է կառավարում (ամբողջ բաժնի ON/OFF-ի համար)
const SECTION_OF: Record<string, { key: SectionKey; label: string }> = {
  modules: { key: "bc", label: "Business Control" },
  benefits: { key: "benefits", label: "Առավելություններ" },
  stats: { key: "stats", label: "Վիճակագրություն" },
  industries: { key: "industries", label: "Ոլորտներ" },
  clients: { key: "clients", label: "Հաճախորդներ" },
  partners: { key: "partners", label: "Ինտեգրացիաներ" },
  proof: { key: "proof", label: "Թվեր" },
  stories: { key: "stories", label: "Հաջողության պատմություններ" },
};

type Loaded = { ts?: { texts: TextTree; settings: Settings }; rows?: any[]; requests?: ContactRequest[] };

export default function SectionClient({ section }: { section: string }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [err, setErr] = useState("");
  const cfg = ENTITY[section];

  useEffect(() => {
    let alive = true;
    (async () => {
      const out: Loaded = {};
      if (section === "requests") {
        const r = await getRequests();
        if (!r.ok) throw new Error(r.error);
        out.requests = r.rows || [];
      } else {
        const ts = await fetchTextsAndSettings();
        if (!ts) throw new Error("Չհաջողվեց բեռնել տվյալները");
        out.ts = ts;
        const table = section === "stories" ? "stories" : cfg?.table;
        if (table) {
          const r = await listRows(table);
          if (!r.ok) throw new Error(r.error);
          out.rows = r.rows || [];
        }
      }
      if (alive) setData(out);
    })().catch((e) => { if (alive) setErr(String(e?.message || "Սխալ")); });
    return () => { alive = false; };
  }, [section, cfg?.table]);

  if (err) return <p className="adm-sub" style={{ color: "#fca5a5" }}>Սխալ՝ {err}</p>;
  if (!data) return <p className="adm-sub">Բեռնվում է…</p>;

  if (section === "texts") return <TextsEditor texts={data.ts!.texts} />;
  if (section === "settings") return <SettingsEditor settings={data.ts!.settings} />;
  if (section === "requests") return <RequestsView rows={data.requests || []} />;

  const sec = SECTION_OF[section];
  const toggle = sec && data.ts ? <SectionToggle sectionKey={sec.key} label={sec.label} initial={data.ts.settings.sections?.[sec.key] !== false} /> : null;

  if (section === "stories") return <>{toggle}<StoriesEditor rows={(data.rows || []) as Story[]} /></>;
  if (!cfg) return <p className="adm-sub">Բաժինը չի գտնվել։</p>;

  return (
    <>
      {toggle}
      <EntityEditor
        table={cfg.table} title={cfg.title} sub={cfg.sub} titleKey={cfg.titleKey}
        fields={cfg.fields} defaults={cfg.defaults} rows={data.rows || []}
      />
    </>
  );
}
