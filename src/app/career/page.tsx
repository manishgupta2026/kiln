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

            <div
              className="reveal"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
                marginTop: "16px",
              }}
            >
              {VALUES.map((item) => (
                <div
                  key={item.idx}
                  style={{
                    background: "var(--surface)",
                    padding: "24px",
                    borderRadius: "18px",
                    border: "2px solid var(--outline)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--body)",
                      fontSize: "12px",
                      color: "var(--ink)",
                      background: "var(--lime)",
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      border: "1.5px solid var(--outline)",
                      marginBottom: "14px",
                      fontWeight: 700,
                    }}
                  >
                    {item.idx}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: "20px",
                      fontWeight: 600,
                      marginBottom: "10px",
                      color: "var(--text)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer showNote={true} />
    </>
  );
}
