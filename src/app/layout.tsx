import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F5C52",
};

const fraunces = Fraunces({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--display",
  display: "swap",
});

const inter = Inter({
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
                localStorage.removeItem('dg-mode');
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.classList.remove('dark');
              } catch(e) {}
            })()`,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
