"use client";

import "./admin.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { me } from "@/lib/api";

// Ադմինի բոլոր էջերը՝ միայն մուտք գործած ադմինի համար (ստուգումը PHP session-ով)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    me().then((r) => {
      if (r.ok) setEmail(String(r.email || ""));
      else router.replace("/login/");
    });
  }, [router]);

  if (email === null) {
    return (
      <div className="adm-body" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="adm-sub">Բեռնվում է…</span>
      </div>
    );
  }

  return (
    <div className="adm-body">
      <AdminShell email={email}>{children}</AdminShell>
    </div>
  );
}
