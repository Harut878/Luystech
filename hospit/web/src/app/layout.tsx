import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HospIT — Smart Healthcare Automation | Բուժհաստատությունների ավտոմատացում",
  description:
    "HospIT — խելացի ավտոմատացման հարթակ ժամանակակից բժշկական հաստատությունների համար՝ բուժառուների կառավարում, այցերի ամրագրում, վերլուծություն և անվտանգ ինտեգրացիա մեկ տեղում։",
  icons: { icon: "/uploads/logo-mark.png" },
  openGraph: {
    title: "HospIT — Smart Healthcare Automation",
    description: "Խելացի ավտոմատացում բժշկական հաստատությունների համար",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Noto+Sans+Armenian:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Noto Sans', 'Noto Sans Armenian', sans-serif" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
