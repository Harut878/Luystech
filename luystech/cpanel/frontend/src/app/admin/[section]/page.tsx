import SectionClient from "@/components/admin/SectionClient";

// Ստատիկ export-ի համար՝ ադմինի բոլոր բաժինները նախօրոք (build-ի ժամանակ) գեներացվում են
const SECTIONS = ["texts", "settings", "requests", "modules", "benefits", "stats", "industries", "clients", "partners", "proof", "stories"];

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <SectionClient section={section} />;
}
