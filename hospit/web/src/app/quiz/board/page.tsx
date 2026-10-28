import type { Metadata } from "next";
import "../quiz.css";
import { loadQuizConfig } from "@/lib/quiz-server";
import QuizBoard from "@/components/quiz/QuizBoard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "HospIT Quiz — Board",
  robots: { index: false, follow: false },
};

// Մեծ էկրան՝ օրվա TOP-10 + QR կոդ։ Բացեք ամբողջ էկրանով (F11)։
export default async function QuizBoardPage() {
  const cfg = await loadQuizConfig();
  return <QuizBoard cfg={cfg} />;
}
