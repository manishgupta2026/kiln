import type { Metadata } from "next";
import CareerPage from "../career/page";

export const metadata: Metadata = {
  title: "Careers — DigiGrantha",
  alternates: {
    canonical: "https://digigrantha.com/career",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default CareerPage;
