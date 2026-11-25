import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CareerForm from "@/components/CareerForm";

import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Engineering & Design Careers",
  description:
    "Explore full-stack TypeScript, Next.js, UI/UX design, and internship roles at DigiGrantha. Ship production software with high agency and zero bureaucracy.",
  alternates: {
    canonical: "https://digigrantha.com/career",
  },
  openGraph: {
    title: "Engineering & Design Careers | DigiGrantha",
    description:
      "Build production software with high agency. Opportunities for full-stack engineers, UI/UX designers, interns, and specialists.",
    url: "https://digigrantha.com/career",
  },
};

const VALUES = [
  {
    idx: "01",
    title: "High Agency, Zero Bureaucracy",
    desc: "We don't do five layers of management or endless status meetings. You own modules end-to-end, make architectural choices, and ship directly.",
  },
  {
    idx: "02",
    title: "Real Production Products",
    desc: "Every line of code and every UI component goes to real users. We build high-throughput systems, consumer apps, and private client infrastructure.",
  },
  {
    idx: "03",
    title: "Modern, Uncluttered Stack",
    desc: "We build with Next.js 15, React 19, TypeScript, PostgreSQL, Prisma, Tailwind, and Figma. No legacy enterprise bloat or ancient libraries.",
  },
  {
    idx: "04",
    title: "Transparent & Respectful",
    desc: "Whether you are a full-time builder, an intern shipping your first features, or a specialist contractor, we respect your time and pay promptly.",
  },
];

export default function CareerPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://digigrantha.com" },
          { name: "Careers", item: "https://digigrantha.com/career" },
        ]}
      />
      <ScrollReveal />
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="page-head" style={{ paddingBottom: "24px" }}>
          <div className="wrap">
            <div className="eyebrow reveal">Careers at DigiGrantha</div>
            <h1 className="reveal">Build software with high agency.</h1>
            <p className="page-sub reveal" style={{ maxWidth: "680px" }}>
              DigiGrantha is a small, deliberate engineering and design studio. We don&apos;t hire
              warm bodies for desks. We partner with craftspeople who care about product feel,
              typography, speed, and clean code. See{" "}
              <Link href="/work" style={{ textDecoration: "underline", fontWeight: 600 }}>
                our shipped work
              </Link>{" "}
              or learn{" "}
              <Link href="/about" style={{ textDecoration: "underline", fontWeight: 600 }}>
                how we stay small on purpose
              </Link>
              .
            </p>
          </div>
        </section>

        {/* FORMS SECTION */}
        <section style={{ padding: "0 0 60px" }}>
          <div className="wrap reveal">
            <CareerForm />
          </div>
        </section>

        {/* VALUES SECTION */}
        <section className="milestones" style={{ borderTop: "2px solid var(--outline)", padding: "64px 0" }}>
          <div className="wrap">
            <div className="section-label reveal">Why Digigrantha</div>
            <h2 className="section-title reveal" style={{ fontSize: "clamp(2rem, 3.5vw, 2.5rem)", marginBottom: "32px", fontFamily: "var(--display)" }}>
              How we like to build
            </h2>

            <div className="reveal career-values-grid">
              {VALUES.map((item) => (
                <div key={item.idx} className="career-value-card">
                  <div className="career-value-badge">
                    {item.idx}
                  </div>
                  <h3 className="career-value-title">
                    {item.title}
                  </h3>
                  <p className="career-value-desc">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
