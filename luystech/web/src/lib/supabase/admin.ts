import { createClient as createJsClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "./server";
import type { Profile } from "../types";

// Ծառայության բանալիով կապ — շրջանցում է RLS-ը։ ՄԻԱՅՆ սերվերում, ադմին գործողությունների համար։
export function createAdminClient() {
  return createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Ստուգում է՝ ընթացիկ մուտք գործած օգտատերն ադմին է թե ոչ։ Վերադարձնում է պրոֆիլը կամ null։
export async function getCurrentAdmin(): Promise<Profile | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!data || data.role !== "admin") return null;
  return data as Profile;
}

// Ադմին էջերի համար՝ ստուգում է իրավունքը և վերադարձնում է service-role կապ (կարդալու/գրելու)
export async function adminDb() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return createAdminClient();
}
