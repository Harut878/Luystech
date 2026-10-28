import Home from "@/components/site/Home";
import { loadContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await loadContent();
  return <Home content={content} />;
}
