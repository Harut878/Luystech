import { redirect } from "next/navigation";
import type { Metadata } from "next";
import "@/app/admin/admin.css";
import { getSessionUser } from "@/lib/auth";
import { loadContent } from "@/lib/content";
import AccountView from "@/components/account/AccountView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "HospIT — Իմ էջը", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const account = await getSessionUser();
  if (!account) redirect("/login");

  const { settings } = await loadContent();
  return (
    <AccountView
      account={account}
      plans={settings.pricing.plans.map((p) => ({ id: p.id, name: p.name, shortLabel: p.shortLabel }))}
      addons={settings.pricing.addons}
      contact={{ phone: settings.phone, email: settings.email }}
      logo={settings.logo_url || "/uploads/logo-wordmark.png"}
    />
  );
}
