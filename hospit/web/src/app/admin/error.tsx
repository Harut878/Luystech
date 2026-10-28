"use client";

// Ադմինկայի էջը չբացվեց (օր.՝ բազան ժամանակավորապես անհասանելի է)։
// Ոչինչ չի պահպանվել և ոչինչ չի կորել՝ պարզապես փորձել կրկին։
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="adm-card" style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
      <h1 className="adm-h1" style={{ marginBottom: 10 }}>Տվյալները չհաջողվեց բեռնել</h1>
      <p className="adm-sub" style={{ marginBottom: 6 }}>
        Բազան ժամանակավորապես չի պատասխանում։ Ոչինչ չի փոխվել և ոչինչ չի կորել։
      </p>
      <p className="adm-sub" style={{ marginBottom: 20, opacity: 0.75 }}>
        The database is temporarily unavailable. Nothing was changed or lost.
      </p>
      <button type="button" className="adm-btn adm-btn-primary" onClick={() => reset()}>
        Փորձել կրկին / Try again
      </button>
    </div>
  );
}
