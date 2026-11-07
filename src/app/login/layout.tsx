import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal Login — DigiGrantha",
  description: "Secure client portal access for DigiGrantha project tracking.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

