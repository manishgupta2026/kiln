import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function NotFound() {
  return (
    <>
      <ScrollReveal />
      <Header />

      <main style={{ minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <section className="page-head" style={{ padding: "80px 0 60px" }}>
          <div className="wrap">
            <div className="eyebrow reveal" style={{ color: "var(--accent)" }}>
              Error 404 — Not Found
            </div>

            <h1 className="reveal" style={{ maxWidth: "18ch", marginBottom: "20px" }}>
              Looks like this piece hasn&apos;t been <em>fired</em> yet.
            </h1>

            <p className="page-sub reveal" style={{ maxWidth: "56ch", marginBottom: "40px" }}>
              The URL you requested doesn&apos;t exist, was moved to the archive, or was never
              shaped in the first place. We&apos;d rather give you a clean turn-around than a dead end.
            </p>

            {/* Action Cards */}
            <div
              className="reveal"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
                maxWidth: "860px",
                marginBottom: "44px",
              }}
            >
              <Link
                href="/work"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "14px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "border-color .2s ease, transform .2s ease",
                }}
                className="nf-card"
              >
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                    Archive
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)", marginBottom: "6px" }}>
                    What We&apos;ve Shipped
                  </div>
                  <div style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.5 }}>
                    See live production products, win rates, and daily active users.
                  </div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--ink)", marginTop: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                  Browse work →
                </div>
              </Link>

              <Link
                href="/about"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "14px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "border-color .2s ease, transform .2s ease",
                }}
                className="nf-card"
              >
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                    Philosophy
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)", marginBottom: "6px" }}>
                    Why We&apos;re Small
                  </div>
                  <div style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.5 }}>
                    No account managers, no layers. Direct code, design, and receipts.
                  </div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--ink)", marginTop: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                  Read manifesto →
                </div>
              </Link>

              <Link
                href="/#brief"
                style={{
                  background: "var(--accent-soft)",
                  border: "1.5px dashed var(--accent)",
                  borderRadius: "14px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "background .2s ease, transform .2s ease",
                }}
                className="nf-card"
              >
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                    Start Building
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)", marginBottom: "6px" }}>
                    Tell Us Everything
                  </div>
                  <div style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.5 }}>
                    Have a real project? Fill out our 60-second brief intake.
                  </div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent)", fontWeight: 600, marginTop: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                  Start a brief →
                </div>
              </Link>
            </div>

            {/* Primary Back Home Link */}
            <div className="reveal">
              <Link href="/" className="btn-primary">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer showNote={false} />
    </>
  );
}
