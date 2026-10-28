import type { ML, Lang } from "./types";

// ═══════════════════════ Ցուցահանդեսի վիկտորինա ═══════════════════════
// Այցելուն QR-ով բացում է /quiz, պատասխանում է հարցերին, արդյունքը գրվում է
// quiz_players աղյուսակում։ Մեծ էկրանը (/quiz/board) ցույց է տալիս օրվա TOP-10-ը։
// Հարցերը և տեքստերը խմբագրվում են ադմինից (Settings.quiz → app_settings.data.quiz)։

export type QuizQuestion = {
  id: string;
  text: ML;
  options: ML[];      // 4 տարբերակ
  correct: number;    // ճիշտ տարբերակի ինդեքսը (0..3)
  active: boolean;
};

export type QuizConfig = {
  title: ML;
  subtitle: ML;
  prize: ML;          // մրցանակի նկարագրությունը (ցուցադրվում է սկզբում և էկրանին)
  seconds: number;    // վայրկյան մեկ հարցի համար
  questions: QuizQuestion[];
};

// Խաղացողի տողը (quiz_players)
export type QuizPlayer = {
  id: string;
  name: string;
  phone: string;
  org: string | null;
  score: number;        // ճիշտ պատասխանների քանակ
  total_ms: number;     // ընդհանուր ժամանակ (մվ) — ցածրը ավելի լավ է
  answers: { q: string; a: number | null; ms: number }[];
  day: string;          // YYYY-MM-DD (Երևանի ժամանակով)
  winner: boolean;
  created_at: string;
};

// Մեծ էկրանի/հանրային տողը — առանց հեռախոսի
export type BoardRow = { name: string; org: string | null; score: number; total_ms: number; created_at: string };

const ml = (hy: string, en: string, ru: string): ML => ({ hy, en, ru });

export const DEFAULT_QUIZ: QuizConfig = {
  title: ml("HospIT վիկտորինա", "HospIT Quiz", "Викторина HospIT"),
  subtitle: ml(
    "5 կարճ հարց։ Օրվա լավագույն արդյունքը ստանում է մրցանակ։",
    "5 short questions. The best score of the day wins a prize.",
    "5 коротких вопросов. Лучший результат дня получает приз."
  ),
  prize: ml("Օրվա հաղթողին՝ մրցանակ HospIT-ից", "Prize of the day from HospIT", "Приз дня от HospIT"),
  seconds: 20,
  questions: [
    {
      id: "q1", active: true, correct: 0,
      text: ml("Ինչի՞ համար է նախատեսված HospIT-ը։", "What is HospIT built for?", "Для чего создан HospIT?"),
      options: [
        ml("Բժշկական հաստատությունների ավտոմատացման համար", "Automating medical institutions", "Автоматизация медицинских учреждений"),
        ml("Սննդի առաքման համար", "Food delivery", "Доставка еды"),
        ml("Բանկային փոխանցումների համար", "Bank transfers", "Банковские переводы"),
        ml("Ֆիթնես մարզումների համար", "Fitness workouts", "Фитнес-тренировки"),
      ],
    },
    {
      id: "q2", active: true, correct: 2,
      text: ml("Ի՞նչ է նշանակում HIS հապավումը։", "What does the abbreviation HIS stand for?", "Что означает аббревиатура HIS?"),
      options: [
        ml("High Internet Speed", "High Internet Speed", "High Internet Speed"),
        ml("Health Insurance Service", "Health Insurance Service", "Health Insurance Service"),
        ml("Hospital Information System", "Hospital Information System", "Hospital Information System"),
        ml("Home Isolation Standard", "Home Isolation Standard", "Home Isolation Standard"),
      ],
    },
    {
      id: "q3", active: true, correct: 1,
      text: ml("Ինչպե՞ս է HospIT-ը արագացնում բժշկի գրառումը։", "How does HospIT speed up a doctor's notes?", "Как HospIT ускоряет записи врача?"),
      options: [
        ml("Բժիշկը ավելի արագ է տպում", "The doctor types faster", "Врач печатает быстрее"),
        ml("Խոսքը ինքնաբերաբար վերածում է տեքստի", "Turns speech into text automatically", "Автоматически превращает речь в текст"),
        ml("Հիվանդն ինքն է լրացնում քարտը", "The patient fills in the card", "Пациент сам заполняет карту"),
        ml("Գրառում պետք չէ", "No notes are needed", "Записи не нужны"),
      ],
    },
    {
      id: "q4", active: true, correct: 3,
      text: ml("Որտե՞ղ է թղթային բժշկական քարտը ամենից հաճախ «կորչում»։", "Where does a paper medical card most often get \"lost\"?", "Где чаще всего «теряется» бумажная медкарта?"),
      options: [
        ml("Լաբորատորիայում", "In the laboratory", "В лаборатории"),
        ml("Ընդունարանում", "At the reception", "В регистратуре"),
        ml("Բժշկի սեղանին", "On the doctor's desk", "На столе врача"),
        ml("Բոլոր տեղերում միաժամանակ", "In all of these places at once", "Во всех этих местах сразу"),
      ],
    },
    {
      id: "q5", active: true, correct: 0,
      text: ml("Ո՞ր բաժիններն են աշխատում HospIT-ում մեկ համակարգով։", "Which departments run in HospIT as one system?", "Какие отделы работают в HospIT как одна система?"),
      options: [
        ml("Ընդունարան, մահճակալներ, լաբորատորիա, դեղեր, վճարումներ", "Reception, beds, lab, medicines, payments", "Регистратура, койки, лаборатория, лекарства, оплата"),
        ml("Միայն ընդունարանը", "Only the reception", "Только регистратура"),
        ml("Միայն հաշվապահությունը", "Only accounting", "Только бухгалтерия"),
        ml("Միայն լաբորատորիան", "Only the laboratory", "Только лаборатория"),
      ],
    },
  ],
};

// ── Օգնական ֆունկցիաներ ──

export function t(m: ML | undefined, lang: Lang): string {
  if (!m) return "";
  return m[lang] || m.hy || m.en || m.ru || "";
}

// Այսօրվա օրը Երևանի ժամանակով՝ YYYY-MM-DD
export function yerevanDay(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (k: string) => parts.find((p) => p.type === k)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Հեռախոսի նորմալացում՝ միայն թվեր և +
export function normalizePhone(raw: string): string {
  const s = String(raw || "").replace(/[^\d+]/g, "");
  if (!s) return "";
  // 0XX XXX XXX → +374XXXXXXXX
  if (/^0\d{8}$/.test(s)) return "+374" + s.slice(1);
  if (/^\d{8}$/.test(s)) return "+374" + s;
  if (/^374\d{8}$/.test(s)) return "+" + s;
  return s.startsWith("+") ? s : "+" + s;
}

export function phoneLooksValid(p: string): boolean {
  return /^\+\d{8,15}$/.test(p);
}

// Պատասխանների գնահատում սերվերում (հաճախորդին չենք վստահում)
export function scoreAnswers(
  cfg: QuizConfig,
  answers: { q: string; a: number | null; ms: number }[]
): { score: number; total_ms: number; answers: { q: string; a: number | null; ms: number }[] } {
  const limit = Math.max(5, Math.min(120, cfg.seconds || 20)) * 1000;
  const active = cfg.questions.filter((q) => q.active);
  const seen = new Set<string>();
  let score = 0, total = 0;
  const clean: { q: string; a: number | null; ms: number }[] = [];
  for (const q of active) {
    const ans = answers.find((x) => x && x.q === q.id);
    if (!ans || seen.has(q.id)) continue;
    seen.add(q.id);
    const a = typeof ans.a === "number" && ans.a >= 0 && ans.a < q.options.length ? ans.a : null;
    const ms = Math.max(0, Math.min(limit, Number(ans.ms) || limit));
    if (a !== null && a === q.correct) score++;
    total += ms;
    clean.push({ q: q.id, a, ms });
  }
  // Չպատասխանված հարցերը՝ լրիվ ժամանակ
  total += (active.length - clean.length) * limit;
  return { score, total_ms: total, answers: clean };
}

export function fmtTime(ms: number): string {
  return (ms / 1000).toFixed(1);
}

// Դասավորում՝ միավոր ↓, ժամանակ ↑
export function rankSort<T extends { score: number; total_ms: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => b.score - a.score || a.total_ms - b.total_ms);
}
