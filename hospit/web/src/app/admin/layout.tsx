import type { Metadata } from "next";
import "./admin.css";
import { requireAdminPage } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "HospIT — Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Մուտք գործած, բայց ադմին չէ՝ իր անձնական էջ. մուտք չգործած՝ մուտքի էջ
  const admin = await requireAdminPage();

  return (
    <div className="adm-body">
      <AdminShell email={admin.email}>{children}</AdminShell>
    </div>
  );
}
