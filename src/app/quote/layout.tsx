import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quotation — DigiGrantha",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

