import { notFound } from "next/navigation";
import { adminDb } from "@/lib/supabase/admin";
import { loadContent } from "@/lib/content";
import { ENTITY } from "@/components/admin/entityConfig";
import EntityEditor from "@/components/admin/EntityEditor";
import TextsEditor from "@/components/admin/TextsEditor";
import SettingsEditor from "@/components/admin/SettingsEditor";
import StoriesEditor from "@/components/admin/StoriesEditor";
import RequestsView from "@/components/admin/RequestsView";
import SectionToggle from "@/components/admin/SectionToggle";
import type { Story, ContactRequest, SectionKey } from "@/lib/types";

export const dynamic = "force-dynamic";

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

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const db = await adminDb();

  if (section === "texts") {
    const content = await loadContent();
    return <TextsEditor texts={content.texts} />;
  }
  if (section === "settings") {
    const content = await loadContent();
    return <SettingsEditor settings={content.settings} />;
  }
  if (section === "requests") {
    const { data } = await db.from("contact_requests").select("*").order("created_at", { ascending: false });
    return <RequestsView rows={(data || []) as ContactRequest[]} />;
  }

  // Ամբողջ բաժնի տեսանելիության անջատիչը (այս էջին համապատասխան)
  const content = await loadContent();
  const sec = SECTION_OF[section];
  const toggle = sec ? <SectionToggle sectionKey={sec.key} label={sec.label} initial={content.settings.sections?.[sec.key] !== false} /> : null;

  if (section === "stories") {
    const { data } = await db.from("stories").select("*").order("sort");
    return <>{toggle}<StoriesEditor rows={(data || []) as Story[]} /></>;
  }

  const cfg = ENTITY[section];
  if (!cfg) notFound();
  const { data } = await db.from(cfg.table).select("*").order("sort");
  return (
    <>
      {toggle}
      <EntityEditor
        table={cfg.table} title={cfg.title} sub={cfg.sub} titleKey={cfg.titleKey}
        fields={cfg.fields} defaults={cfg.defaults} rows={data || []}
      />
    </>
  );
}
