"use client";

import { useEffect, useState } from "react";
import Home from "./Home";
import { INITIAL_CONTENT, fetchContent } from "@/lib/content";
import type { SiteContent } from "@/lib/types";

// Էջը միանգամից ցույց է տալիս build-ի պահի բովանդակությունը,
// ապա բազայից (PHP API) բերում է թարմը և թարմացնում տեղում։
export default function SiteLoader() {
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);

  useEffect(() => {
    let alive = true;
    fetchContent().then((c) => { if (alive && c) setContent(c); });
    return () => { alive = false; };
  }, []);

  return <Home content={content} />;
}
