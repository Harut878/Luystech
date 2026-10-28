import { NextResponse } from "next/server";
import { dbConfigured, json, q, q1 } from "@/lib/db";
import { loadQuizConfig } from "@/lib/quiz-server";
import { scoreAnswers, yerevanDay, normalizePhone, phoneLooksValid, rankSort, type BoardRow } from "@/lib/quiz";

export const dynamic = "force-dynamic";

const TOP = 10;

// GET /api/quiz  → օրվա TOP-10 (առանց հեռախոսների) — մեծ էկրանի համար
export async function GET() {
  const day = yerevanDay();
  if (!dbConfigured()) return NextResponse.json({ day, rows: [], total: 0 });
  try {
    const [rows, cnt] = await Promise.all([
      q<BoardRow>(
        `select name, org, score, total_ms, created_at from quiz_players
          where day = $1 order by score desc, total_ms asc limit $2`, [day, TOP]),
      q1<{ n: number }>("select count(*)::int as n from quiz_players where day = $1", [day]),
    ]);
    return NextResponse.json({ day, rows, total: cnt?.n ?? 0 });
  } catch {
    return NextResponse.json({ day, rows: [], total: 0 });
  }
}

// POST /api/quiz  → արդյունքի գրանցում. { name, phone, org?, answers:[{q,a,ms}] }
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const name = String(body.name || "").trim().slice(0, 60);
  const phone = normalizePhone(String(body.phone || ""));
  const org = String(body.org || "").trim().slice(0, 80) || null;
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, 50) : [];

  if (name.length < 2) return NextResponse.json({ error: "name" }, { status: 400 });
  if (!phoneLooksValid(phone)) return NextResponse.json({ error: "phone" }, { status: 400 });

  const cfg = await loadQuizConfig();
  const result = scoreAnswers(cfg, answers);
  const day = yerevanDay();
  const max = cfg.questions.filter((x) => x.active).length;

  if (!dbConfigured()) {
    return NextResponse.json({ ok: true, stored: false, score: result.score, max, total_ms: result.total_ms, rank: 1, total: 1, best: true });
  }

  try {
    // Նույն հեռախոսը այսօր արդեն խաղացե՞լ է — պահում ենք լավագույնը
    const prev = await q1<{ id: string; score: number; total_ms: number }>(
      "select id, score, total_ms from quiz_players where phone = $1 and day = $2", [phone, day]);
    let best = true;
    let finalScore = result.score, finalMs = result.total_ms;
    if (prev) {
      const better = result.score > prev.score || (result.score === prev.score && result.total_ms < prev.total_ms);
      if (better) {
        await q(`update quiz_players set name = $2, org = $3, score = $4, total_ms = $5, answers = $6::jsonb, created_at = now()
                  where id = $1`, [prev.id, name, org, result.score, result.total_ms, json(result.answers)]);
      } else {
        best = false; finalScore = prev.score; finalMs = prev.total_ms;
      }
    } else {
      // միաժամանակյա երկու ուղարկում նույն հեռախոսից՝ unique index-ը թույլ չի տա կրկնօրինակ
      await q(`insert into quiz_players (name, phone, org, score, total_ms, answers, day)
               values ($1, $2, $3, $4, $5, $6::jsonb, $7)
               on conflict (phone, day) do nothing`,
        [name, phone, org, result.score, result.total_ms, json(result.answers), day]);
    }

    // Դիրքը օրվա ցուցակում
    const all = await q<{ phone: string; score: number; total_ms: number }>(
      "select phone, score, total_ms from quiz_players where day = $1", [day]);
    const sorted = rankSort(all);
    const rank = Math.max(1, sorted.findIndex((r) => r.phone === phone) + 1);
    return NextResponse.json({ ok: true, stored: true, score: result.score, max, total_ms: result.total_ms, rank, total: sorted.length, best, bestScore: finalScore, bestMs: finalMs });
  } catch (e: any) {
    console.error("[quiz] save failed:", e?.message || e);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
