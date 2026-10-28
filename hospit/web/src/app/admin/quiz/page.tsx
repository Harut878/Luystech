import { q } from "@/lib/db";
import { requireAdminPage } from "@/lib/auth";
import { loadContent } from "@/lib/content";
import { yerevanDay, type QuizPlayer } from "@/lib/quiz";
import QuizAdmin from "@/components/admin/QuizAdmin";

export const dynamic = "force-dynamic";

// Ադմին → Վիկտորինա. օրվա խաղացողներ (հեռախոսներով), հաղթող, հարցերի խմբագրում
export default async function QuizAdminPage() {
  await requireAdminPage();
  const today = yerevanDay();
  const [content, players, daysRaw] = await Promise.all([
    loadContent({ forEditing: true }),
    q<QuizPlayer>("select * from quiz_players where day = $1 order by score desc, total_ms asc", [today]),
    q<{ day: string; n: number }>("select day, count(*)::int as n from quiz_players group by day"),
  ]);
  const m = new Map<string, number>(daysRaw.map((r) => [r.day, r.n]));
  if (!m.has(today)) m.set(today, 0);
  const days = [...m.entries()].map(([day, n]) => ({ day, n })).sort((a, b) => b.day.localeCompare(a.day));

  return <QuizAdmin settings={content.settings} today={today} initialPlayers={players} days={days} />;
}
