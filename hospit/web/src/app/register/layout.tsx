import type { Metadata } from "next";

// Անձնական էջերը որոնողական համակարգերում չեն ցուցադրվում
export const metadata: Metadata = { title: "HospIT", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
