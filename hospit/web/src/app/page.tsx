import Home from "@/components/site/Home";
import { loadContent } from "@/lib/content";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [content, user] = await Promise.all([loadContent(), getSessionUser()]);
  return <Home content={content} me={user?.role ?? null} />;
}
