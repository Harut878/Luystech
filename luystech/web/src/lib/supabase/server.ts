import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Սերվերի կողմից աշխատող Supabase կապ (էջեր, server actions) — հարգում է RLS-ը
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // server component-ից կանչվելիս cookie-ն չի գրվի — middleware-ն է թարմացնում
          }
        },
      },
    }
  );
}
