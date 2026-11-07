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

import { OrganizationJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://digigrantha.com"),
  title: {
    default: "DigiGrantha — Digital Product & Web Development Studio",
    template: "%s | DigiGrantha",
  },
  description:
    "Bespoke digital product & web development studio. We design, engineer, and ship high-performance web applications, scalable client portals, and resilient digital systems start to finish.",
  applicationName: "DigiGrantha",
  authors: [{ name: "DigiGrantha Studio", url: "https://digigrantha.com" }],
  creator: "DigiGrantha",
  publisher: "DigiGrantha",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    "digital product studio",
    "web development studio",
    "custom web applications",
    "Next.js development company",
    "React 19 development",
    "TypeScript software engineering",
    "bespoke client portals",
    "SaaS product design",
    "UI UX design studio",
    "Cloudflare Workers development",
    "DigiGrantha",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DigiGrantha — Expressive Digital Product & Web Development Studio",
    description:
      "Handcrafted web applications, high-performance digital products, and high-agency engineering. Shipped in-house with real outcomes.",
    url: "https://digigrantha.com",
    siteName: "DigiGrantha",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DigiGrantha — Expressive Digital Product & Web Development Studio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiGrantha — Expressive Digital Product & Web Development Studio",
    description:
      "Handcrafted web apps, digital products, and high-agency engineering. Real products. Real numbers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
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
        <OrganizationJsonLd />
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
