import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CareerForm from "@/components/CareerForm";

export const metadata: Metadata = {
  title: "Careers — Digigrantha",
  description:
    "Join Digigrantha. Opportunities for Full-time Engineers & Designers, Interns, and Freelance Specialists.",
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
      <ScrollReveal />
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="page-head" style={{ paddingBottom: "24px" }}>
          <div className="wrap">
            <div className="eyebrow reveal">Careers at Digigrantha</div>
            <h1 className="reveal">Build software with high agency.</h1>
            <p className="page-sub reveal" style={{ maxWidth: "680px" }}>
              Digigrantha is a small, deliberate engineering &amp; design studio. We don&apos;t hire warm bodies
              for desks — we partner with craftspeople who care deeply about product feel, type, speed,
              and code cleanliness.
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
