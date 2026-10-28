import { notFound } from "next/navigation";
import { q } from "@/lib/db";
import { requireAdminPage, USER_COLUMNS } from "@/lib/auth";
import { toAccount, type UserRow } from "@/lib/account";
import UsersManager from "@/components/admin/UsersManager";
import { loadContent } from "@/lib/content";
import { ENTITY } from "@/components/admin/entityConfig";
import EntityEditor from "@/components/admin/EntityEditor";
import TextsEditor from "@/components/admin/TextsEditor";
import SettingsEditor from "@/components/admin/SettingsEditor";
import PricingEditor from "@/components/admin/PricingEditor";
import ComparisonEditor from "@/components/admin/ComparisonEditor";
import SettingsListEditor from "@/components/admin/SettingsListEditor";
import { SETTINGS_LISTS } from "@/components/admin/settingsListConfig";
import RequestsView from "@/components/admin/RequestsView";
import type { ContactRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const me = await requireAdminPage();

  if (section === "texts") {
    const content = await loadContent({ forEditing: true });
    return <TextsEditor texts={content.texts} />;
  }
  if (section === "settings") {
    const content = await loadContent({ forEditing: true });
    return <SettingsEditor settings={content.settings} />;
  }
  if (section === "pricing") {
    const content = await loadContent({ forEditing: true });
    return <PricingEditor settings={content.settings} />;
  }
  if (section === "users") {
    const [rows, content] = await Promise.all([
      q<UserRow>(`select ${USER_COLUMNS} from users u order by u.created_at desc`),
      loadContent({ forEditing: true }),
    ]);
    return <UsersManager accounts={rows.map(toAccount)} pricing={content.settings.pricing} meId={me.id} />;
  }
  if (section === "comparison") {
    const content = await loadContent({ forEditing: true });
    return <ComparisonEditor settings={content.settings} />;
  }
  if (section === "faqs" || section === "integrations") {
    const content = await loadContent({ forEditing: true });
    const cfg = SETTINGS_LISTS[section];
    return <SettingsListEditor settings={content.settings} listKey={section} {...cfg} />;
  }
  if (section === "requests") {
    const rows = await q<ContactRequest>("select * from contact_requests order by created_at desc");
    return <RequestsView rows={rows} />;
  }

  const cfg = Object.prototype.hasOwnProperty.call(ENTITY, section) ? ENTITY[section] : undefined;
  if (!cfg) notFound();
  // cfg.table-ը գալիս է ENTITY ֆիքսված ցուցակից (ոչ թե URL-ից)
  const data = await q(`select * from ${cfg.table} order by sort, id`);
  return (
    <EntityEditor
      table={cfg.table} title={cfg.title} sub={cfg.sub} titleKey={cfg.titleKey}
      fields={cfg.fields} defaults={cfg.defaults} rows={data}
    />
  );
}
