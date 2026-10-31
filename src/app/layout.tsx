import type { Metadata } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import CursorTrail from "@/components/CursorTrail";

const fraunces = Fraunces({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--display",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--body",
  display: "swap",
});

const caveat = Caveat({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digigrantha — Expressive Digital Product & Web Development Studio",
  description: "Handcrafted web apps, digital products, and high-agency engineering. Real products. Real numbers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var m = localStorage.getItem('dg-mode');
                if (!m) {
                  m = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', m);
                if (m === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            })()`,
          }}
        />
      </head>
      <body>
        <CursorTrail />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

