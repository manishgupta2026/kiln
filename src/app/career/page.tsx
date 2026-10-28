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
        <section className="milestones" style={{ borderTop: "1px solid var(--line)", padding: "60px 0" }}>
          <div className="wrap">
            <div className="section-label reveal">Why Digigrantha</div>
            <h2 className="section-title reveal" style={{ fontSize: "32px", marginBottom: "32px" }}>
              How we like to build
            </h2>

            <div
              className="reveal"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "24px",
                marginTop: "16px",
              }}
            >
              {VALUES.map((item) => (
                <div
                  key={item.idx}
                  style={{
                    background: "var(--card)",
                    padding: "24px",
                    borderRadius: "14px",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "12px",
                      color: "var(--accent)",
                      marginBottom: "8px",
                      fontWeight: 500,
                    }}
                  >
                    {item.idx}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: "20px",
                      fontWeight: 400,
                      marginBottom: "8px",
                      color: "var(--ink)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "var(--muted)",
                      lineHeight: 1.55,
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
