import type { Metadata } from "next";
import "./quiz.css";
import { loadQuizConfig } from "@/lib/quiz-server";
import QuizPlay from "@/components/quiz/QuizPlay";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "HospIT Quiz",
  description: "5 կարճ հարց HospIT-ի մասին։ Օրվա լավագույնը ստանում է մրցանակ։",
  robots: { index: false, follow: false },
};

// Հեռախոսի էջ՝ այցելուն բացում է QR-ով
export default async function QuizPage() {
  const cfg = await loadQuizConfig();
  return <QuizPlay cfg={cfg} />;
}
