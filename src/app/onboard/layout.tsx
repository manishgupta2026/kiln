import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Onboarding — DigiGrantha",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

