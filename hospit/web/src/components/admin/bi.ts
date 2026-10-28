// Երկլեզու (Հայերեն/English) օգնական — server-safe (ոչ "use client")
export type Bi = { hy: string; en: string };
export const L = (hy: string, en: string): Bi => ({ hy, en });
