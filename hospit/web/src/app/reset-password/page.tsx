import type { Metadata } from "next";
import ResetForm from "@/components/account/ResetForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "HospIT", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <ResetForm token={typeof token === "string" ? token.slice(0, 200) : ""} />;
}
