import { redirect } from "next/navigation";
import "./admin.css";
import { getCurrentAdmin } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/content";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) redirect("/login");
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="adm-body">
      <AdminShell email={admin.email || ""}>{children}</AdminShell>
    </div>
  );
}
