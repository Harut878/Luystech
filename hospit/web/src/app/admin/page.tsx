import { q, q1 } from "@/lib/db";
import { requireAdminPage, USER_COLUMNS } from "@/lib/auth";
import { toAccount, type UserRow } from "@/lib/account";
import DashboardView from "@/components/admin/DashboardView";
import { L } from "@/components/admin/bi";
import type { ContactRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

type Counts = { features: number; services: number; partners: number; req_total: number; req_new: number };

export default async function Dashboard() {
  await requireAdminPage();
  const [counts, recent, users] = await Promise.all([
    q1<Counts>(`select
        (select count(*)::int from features)         as features,
        (select count(*)::int from services)         as services,
        (select count(*)::int from partners)         as partners,
        (select count(*)::int from contact_requests) as req_total,
        (select count(*)::int from contact_requests where status = 'new') as req_new`),
    q<ContactRequest>("select * from contact_requests order by created_at desc limit 5"),
    q<UserRow>(`select ${USER_COLUMNS} from users u where u.role = 'client'`),
  ]);
  const c = counts!;
  const accounts = users.map(toAccount);
  const pendingUsers = accounts.filter((a) => a.subscription.status === "pending").length;
  const activeClients = accounts.filter((a) => a.subscription.status === "active").length;

  const kpis = [
    { n: pendingUsers, label: L("Նոր գրանցված օգտատեր", "New registrations"), href: "/admin/users", highlight: pendingUsers > 0 },
    { n: activeClients, label: L("Ակտիվ հաճախորդ", "Active clients"), href: "/admin/users" },
    { n: c.req_new, label: L("Նոր հարցում", "New requests"), href: "/admin/requests", highlight: true },
    { n: c.req_total, label: L("Ընդամենը հարցում", "Total requests"), href: "/admin/requests" },
    { n: c.features, label: L("Հնարավորություն", "Features"), href: "/admin/features" },
    { n: c.services, label: L("Ծառայություն", "Services"), href: "/admin/services" },
    { n: c.partners, label: L("Գործընկեր", "Partners"), href: "/admin/partners" },
  ];

  return <DashboardView kpis={kpis} recent={recent} />;
}
