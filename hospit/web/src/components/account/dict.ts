"use client";

// Մուտք / Գրանցում / Անձնական էջ՝ 3 լեզվով։ Լեզուն համաժամեցված է կայքի հետ (localStorage hospit_lang)։
import { useEffect, useState } from "react";
import type { Lang, SubStatus } from "@/lib/types";

const hy = {
  backToSite: "Վերադառնալ կայք",
  toSite: "Կայք",
  email: "Էլ. փոստ", password: "Գաղտնաբառ", confirmPassword: "Կրկնել գաղտնաբառը",
  fullName: "Անուն Ազգանուն", institution: "Բուժհաստատություն", phone: "Հեռախոս",
  notConfigured: "Համակարգը դեռ միացված չէ։",
  // login
  signedInTitle: "Դուք արդեն մուտք եք գործել", signedInAs: "Ընթացիկ հաշիվը", continueBtn: "Շարունակել", switchAccount: "Մուտք գործել այլ հաշվով", roleAdmin: "Ադմինիստրատոր", roleClient: "Օգտատեր",
  loginTitle: "Մուտք", loginSub: "Մուտք գործեք Ձեր անձնական էջ։", loginBtn: "Մուտք",
  forgot: "Մոռացե՞լ եք գաղտնաբառը", noAccount: "Հաշիվ չունե՞ք։", toRegister: "Գրանցվել",
  badCreds: "Սխալ էլ. փոստ կամ գաղտնաբառ։", linkError: "Հղումն անվավեր է կամ ժամկետանց։ Փորձեք կրկին։",
  forgotTitle: "Գաղտնաբառի վերականգնում", forgotSub: "Մուտքագրեք Ձեր էլ. փոստը՝ վերականգնման հղում ստանալու համար։",
  sendLink: "Ուղարկել հղումը", linkSent: "Եթե այս էլ. փոստով հաշիվ կա, ուղարկեցինք վերականգնման հղում։", backToLogin: "Վերադառնալ մուտքին",
  // register
  regTitle: "Գրանցում", regSub: "Ստեղծեք հաշիվ՝ Ձեր փաթեթի և պայմանագրի տվյալները տեսնելու համար։",
  regBtn: "Գրանցվել", haveAccount: "Արդեն ունե՞ք հաշիվ։", toLogin: "Մուտք",
  pwHint: "Առնվազն 8 նիշ", pwMismatch: "Գաղտնաբառերը չեն համընկնում։",
  errFull_name: "Մուտքագրեք անունը։", errInstitution: "Մուտքագրեք բուժհաստատության անվանումը։",
  errPhone: "Մուտքագրեք ճիշտ հեռախոսահամար։", errEmail: "Մուտքագրեք ճիշտ էլ. փոստ։",
  errExists: "Այս էլ. փոստով հաշիվ արդեն կա։ Փորձեք մուտք գործել։", errWeak: "Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։",
  errGeneric: "Չհաջողվեց։ Խնդրում ենք փորձել մի փոքր ուշ։",
  errLong: "Գաղտնաբառը պետք է լինի առավելագույնը 72 նիշ։",
  locked: "Չափազանց շատ անհաջող փորձեր։ Փորձեք 15 րոպեից։",
  unavailable: "Համակարգը ժամանակավորապես անհասանելի է։ Փորձեք մի փոքր ուշ։",
  resetUnavailable: "Էլ. փոստով վերականգնումը միացված չէ։ Գաղտնաբառը փոխելու համար դիմեք ադմինիստրատորին։",
  regAgree: "Գրանցվելով՝ Դուք համաձայնում եք մեր գաղտնիության քաղաքականությանը։",
  // account
  myPage: "Իմ էջը", hello: "Բարև", adminPanel: "Ադմին վահանակ", signOut: "Ելք",
  myPlan: "Իմ փաթեթը", noPlanTitle: "Փաթեթը դեռ ակտիվացված չէ",
  noPlanBody: "Ձեր հաշիվը ստեղծված է։ Մեր մասնագետը շուտով կկապվի Ձեզ հետ և կակտիվացնի Ձեր փաթեթը։",
  monthlyPrice: "Ամսական վճար", perMonth: "/ ամիս", employees: "Օգտատերերի քանակ", modules: "Լրացուցիչ մոդուլներ", none: "Չկան",
  period: "Պայմանագրի ժամկետ", from: "Սկիզբ", to: "Ավարտ", openEnded: "Անժամկետ", daysLeft: "օր է մնացել",
  paymentTerms: "Վճարման պայմաններ", terms: "Պայմանագրի պայմաններ",
  myData: "Իմ տվյալները", editNote: "Տվյալները փոխելու համար կապվեք մեզ հետ։",
  security: "Անվտանգություն", newPassword: "Նոր գաղտնաբառ", changePw: "Փոխել գաղտնաբառը", pwChanged: "Գաղտնաբառը փոխված է։",
  needHelp: "Հարցեր ունե՞ք", needHelpBody: "Մեր թիմը պատրաստ է օգնել։",
  status: { pending: "Սպասում է ակտիվացման", active: "Ակտիվ", suspended: "Կասեցված", expired: "Ժամկետանց" } as Record<SubStatus, string>,
};

type Dict = typeof hy;

const en: Dict = {
  backToSite: "Back to website",
  toSite: "Website",
  email: "Email", password: "Password", confirmPassword: "Repeat password",
  fullName: "Full name", institution: "Medical institution", phone: "Phone",
  notConfigured: "The system is not connected yet.",
  signedInTitle: "You are already signed in", signedInAs: "Current account", continueBtn: "Continue", switchAccount: "Sign in with another account", roleAdmin: "Administrator", roleClient: "User",
  loginTitle: "Sign in", loginSub: "Sign in to your personal page.", loginBtn: "Sign in",
  forgot: "Forgot your password?", noAccount: "No account yet?", toRegister: "Register",
  badCreds: "Wrong email or password.", linkError: "The link is invalid or expired. Please try again.",
  forgotTitle: "Reset password", forgotSub: "Enter your email to receive a reset link.",
  sendLink: "Send link", linkSent: "If an account exists for this email, we sent a reset link.", backToLogin: "Back to sign in",
  regTitle: "Register", regSub: "Create an account to see your plan and contract details.",
  regBtn: "Create account", haveAccount: "Already have an account?", toLogin: "Sign in",
  pwHint: "At least 8 characters", pwMismatch: "Passwords do not match.",
  errFull_name: "Enter your name.", errInstitution: "Enter your institution name.",
  errPhone: "Enter a valid phone number.", errEmail: "Enter a valid email.",
  errExists: "An account with this email already exists. Try signing in.", errWeak: "Password must be at least 8 characters.",
  errGeneric: "Something went wrong. Please try again shortly.",
  errLong: "Password must be at most 72 characters.",
  locked: "Too many failed attempts. Try again in 15 minutes.",
  unavailable: "The system is temporarily unavailable. Please try again shortly.",
  resetUnavailable: "Email reset is not enabled. Please contact the administrator to change your password.",
  regAgree: "By registering you agree to our privacy policy.",
  myPage: "My page", hello: "Hello", adminPanel: "Admin panel", signOut: "Sign out",
  myPlan: "My plan", noPlanTitle: "Your plan is not active yet",
  noPlanBody: "Your account has been created. Our specialist will contact you shortly to activate your plan.",
  monthlyPrice: "Monthly fee", perMonth: "/ month", employees: "Users", modules: "Additional modules", none: "None",
  period: "Contract period", from: "Start", to: "End", openEnded: "Open-ended", daysLeft: "days left",
  paymentTerms: "Payment terms", terms: "Contract terms",
  myData: "My details", editNote: "To change your details, please contact us.",
  security: "Security", newPassword: "New password", changePw: "Change password", pwChanged: "Password changed.",
  needHelp: "Questions?", needHelpBody: "Our team is ready to help.",
  status: { pending: "Awaiting activation", active: "Active", suspended: "Suspended", expired: "Expired" },
};

const ru: Dict = {
  backToSite: "Вернуться на сайт",
  toSite: "Сайт",
  email: "Эл. почта", password: "Пароль", confirmPassword: "Повторите пароль",
  fullName: "Имя и фамилия", institution: "Медицинское учреждение", phone: "Телефон",
  notConfigured: "Система ещё не подключена.",
  signedInTitle: "Вы уже вошли в систему", signedInAs: "Текущий аккаунт", continueBtn: "Продолжить", switchAccount: "Войти в другой аккаунт", roleAdmin: "Администратор", roleClient: "Пользователь",
  loginTitle: "Вход", loginSub: "Войдите в личный кабинет.", loginBtn: "Войти",
  forgot: "Забыли пароль?", noAccount: "Нет аккаунта?", toRegister: "Регистрация",
  badCreds: "Неверная почта или пароль.", linkError: "Ссылка недействительна или устарела. Попробуйте снова.",
  forgotTitle: "Восстановление пароля", forgotSub: "Введите почту, чтобы получить ссылку для восстановления.",
  sendLink: "Отправить ссылку", linkSent: "Если аккаунт с этой почтой существует, мы отправили ссылку.", backToLogin: "Вернуться ко входу",
  regTitle: "Регистрация", regSub: "Создайте аккаунт, чтобы видеть данные вашего пакета и договора.",
  regBtn: "Зарегистрироваться", haveAccount: "Уже есть аккаунт?", toLogin: "Войти",
  pwHint: "Не менее 8 символов", pwMismatch: "Пароли не совпадают.",
  errFull_name: "Введите имя.", errInstitution: "Введите название учреждения.",
  errPhone: "Введите корректный номер телефона.", errEmail: "Введите корректную почту.",
  errExists: "Аккаунт с этой почтой уже существует. Попробуйте войти.", errWeak: "Пароль должен содержать не менее 8 символов.",
  errGeneric: "Не удалось. Пожалуйста, попробуйте чуть позже.",
  errLong: "Пароль должен содержать не более 72 символов.",
  locked: "Слишком много неудачных попыток. Попробуйте через 15 минут.",
  unavailable: "Система временно недоступна. Попробуйте чуть позже.",
  resetUnavailable: "Восстановление по почте не включено. Обратитесь к администратору для смены пароля.",
  regAgree: "Регистрируясь, вы соглашаетесь с нашей политикой конфиденциальности.",
  myPage: "Личный кабинет", hello: "Здравствуйте", adminPanel: "Админ-панель", signOut: "Выйти",
  myPlan: "Мой пакет", noPlanTitle: "Пакет ещё не активирован",
  noPlanBody: "Ваш аккаунт создан. Наш специалист скоро свяжется с вами и активирует пакет.",
  monthlyPrice: "Ежемесячная плата", perMonth: "/ мес.", employees: "Пользователей", modules: "Дополнительные модули", none: "Нет",
  period: "Срок договора", from: "Начало", to: "Окончание", openEnded: "Бессрочно", daysLeft: "дн. осталось",
  paymentTerms: "Условия оплаты", terms: "Условия договора",
  myData: "Мои данные", editNote: "Чтобы изменить данные, свяжитесь с нами.",
  security: "Безопасность", newPassword: "Новый пароль", changePw: "Сменить пароль", pwChanged: "Пароль изменён.",
  needHelp: "Есть вопросы?", needHelpBody: "Наша команда готова помочь.",
  status: { pending: "Ожидает активации", active: "Активен", suspended: "Приостановлен", expired: "Истёк" },
};

export const DICTS: Record<Lang, Dict> = { hy, en, ru };
export type AccountDict = Dict;

const KEY = "hospit_lang";

export function useSiteLang(): { lang: Lang; setLang: (l: Lang) => void; d: Dict } {
  const [lang, setLangState] = useState<Lang>("hy");
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s === "hy" || s === "en" || s === "ru") setLangState(s);
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch {}
  };
  return { lang, setLang, d: DICTS[lang] };
}
