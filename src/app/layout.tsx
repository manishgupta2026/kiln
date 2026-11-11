import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F5C52",
};

import { OrganizationJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://digigrantha.com"),
  title: {
    default: "DigiGrantha — Where ideas become digital",
    template: "%s | DigiGrantha",
  },
  description:
    "Bespoke digital product & web development studio. We design, engineer, and ship high-performance web applications, scalable client portals, and resilient digital systems start to finish.",
  applicationName: "DigiGrantha",
  authors: [{ name: "DigiGrantha Studio", url: "https://digigrantha.com" }],
  creator: "DigiGrantha",
  publisher: "DigiGrantha",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180.png" />
        <meta name="theme-color" content="#0F5C52" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />
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
      </body>
    </html>
  );
}
