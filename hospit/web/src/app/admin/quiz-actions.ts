"use server";

import { revalidatePath } from "next/cache";
import { q } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { QuizPlayer } from "@/lib/quiz";
import type { ActionResult } from "./actions";

// ═══════════════ Վիկտորինա — ադմին գործողություններ ═══════════════

// Օրվա խաղացողները (հեռախոսներով) — միայն ադմինի համար
export async function listPlayers(day: string): Promise<QuizPlayer[]> {
  await requireAdmin();
  return q<QuizPlayer>("select * from quiz_players where day = $1 order by score desc, total_ms asc", [String(day).slice(0, 10)]);
}

// Օրերի ցուցակ, որոնցում խաղ է եղել
export async function listDays(): Promise<{ day: string; n: number }[]> {
  await requireAdmin();
  return q<{ day: string; n: number }>(
    "select day, count(*)::int as n from quiz_players group by day order by day desc");
}

export async function setWinner(id: string, winner: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    await q("update quiz_players set winner = $2 where id = $1", [id, Boolean(winner)]);
  } catch (err: any) {
    return { ok: false, error: err?.message || "error" };
  }
  revalidatePath("/admin/quiz");
  return { ok: true };
}

export async function deletePlayer(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await q("delete from quiz_players where id = $1", [id]);
  } catch (err: any) {
    return { ok: false, error: err?.message || "error" };
  }
  revalidatePath("/admin/quiz");
  return { ok: true };
}

// Ամբողջ օրվա արդյունքների մաքրում (օր.՝ փորձնական խաղերից հետո)
export async function clearDay(day: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await q("delete from quiz_players where day = $1", [String(day).slice(0, 10)]);
  } catch (err: any) {
    return { ok: false, error: err?.message || "error" };
  }
  revalidatePath("/admin/quiz");
  return { ok: true };
}
