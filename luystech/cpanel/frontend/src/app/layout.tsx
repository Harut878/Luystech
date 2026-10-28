import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LuysTech — Business Control | Բիզնեսի ավտոմատացման հարթակ",
  description:
    "LuysTech-ն օգնում է բիզնեսներին ավտոմատացնել գործընթացները Business Control (BC) հարթակի միջոցով՝ վաճառք, գնումներ, պահեստ, արտադրություն, առաքումներ և ֆինանսներ մեկ տեղում։",
  openGraph: {
    title: "LuysTech — Business Control",
    description: "Բիզնեսի ավտոմատացման հարթակ",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Noto+Sans+Armenian:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: "#0b1120", fontFamily: "Inter, 'Noto Sans Armenian', system-ui, sans-serif" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
