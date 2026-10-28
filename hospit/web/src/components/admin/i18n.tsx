"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Bi } from "./bi";
export { L } from "./bi";
export type { Bi } from "./bi";

// Ադմին-ինտերֆեյսի լեզուն (Հայերեն / English)
export type AdminLang = "hy" | "en";

type Ctx = { lang: AdminLang; setLang: (l: AdminLang) => void; at: (b: Bi | string, en?: string) => string };
const AdminI18nContext = createContext<Ctx>({ lang: "hy", setLang: () => {}, at: (b) => (typeof b === "string" ? b : b.hy) });

export function AdminI18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("hy");
  useEffect(() => {
    try { const s = localStorage.getItem("hospit_admin_lang") as AdminLang | null; if (s === "hy" || s === "en") setLangState(s); } catch {}
  }, []);
  const setLang = (l: AdminLang) => { setLangState(l); try { localStorage.setItem("hospit_admin_lang", l); } catch {} };
  // at(bi) կամ at("hy","en")
  const at = (b: Bi | string, en?: string): string => {
    if (typeof b === "string") return lang === "en" ? (en ?? b) : b;
    return lang === "en" ? b.en : b.hy;
  };
  return <AdminI18nContext.Provider value={{ lang, setLang, at }}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() { return useContext(AdminI18nContext); }
