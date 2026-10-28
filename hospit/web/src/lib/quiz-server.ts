import { dbConfigured, q1 } from "./db";
import { DEFAULT_QUIZ, type QuizConfig } from "./quiz";

// Վիկտորինայի կոնֆիգը՝ app_settings.data.quiz-ից (ադմինից խմբագրված), fallback՝ DEFAULT_QUIZ։
// Թեթև ընթերցում՝ միայն մեկ դաշտ, առանց ամբողջ կայքի բովանդակությունը բեռնելու։
export async function loadQuizConfig(): Promise<QuizConfig> {
  if (!dbConfigured()) return DEFAULT_QUIZ;
  try {
    const row = await q1<{ quiz: any }>("select data->'quiz' as quiz from app_settings where id = 1");
    const qz = row?.quiz;
    if (!qz || typeof qz !== "object") return DEFAULT_QUIZ;
    const questions = Array.isArray(qz.questions) && qz.questions.length ? qz.questions : DEFAULT_QUIZ.questions;
    return {
      title: qz.title || DEFAULT_QUIZ.title,
      subtitle: qz.subtitle || DEFAULT_QUIZ.subtitle,
      prize: qz.prize || DEFAULT_QUIZ.prize,
      seconds: Number(qz.seconds) || DEFAULT_QUIZ.seconds,
      questions,
    };
  } catch {
    return DEFAULT_QUIZ;
  }
}
