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
            <div className="eyebrow reveal" style={{ background: "var(--yellow)", color: "#17201E" }}>
              <span>✦</span> Error 404 — Not Found
            </div>

            <h1 className="reveal" style={{ maxWidth: "20ch", marginBottom: "20px" }}>
              Looks like this piece hasn&apos;t been <em style={{ fontStyle: "italic", color: "var(--yellow)" }}>shipped</em> yet.
            </h1>

            <p className="page-sub reveal" style={{ maxWidth: "58ch", marginBottom: "40px" }}>
              The URL you requested doesn&apos;t exist, was moved to the archive, or was never
              crafted in the first place. We&apos;d rather give you a clean turn-around than a dead end.
            </p>

            {/* Action Cards with Neem Tactile Shadows */}
            <div
              className="reveal"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
                maxWidth: "880px",
                marginBottom: "44px",
              }}
            >
              <Link
                href="/work"
                className="nf-card"
                style={{
                  background: "var(--surface)",
                  border: "2px solid var(--outline)",
                  borderRadius: "18px",
                  padding: "26px",
                  boxShadow: "var(--shadow)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--body)", fontSize: "11px", fontWeight: 800, color: "var(--green)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                    Archive
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
                    What We&apos;ve Shipped
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.5 }}>
                    See live production products, win rates, and daily active users.
                  </div>
                </div>
                <div style={{ fontFamily: "var(--body)", fontSize: "13px", fontWeight: 700, color: "var(--text)", marginTop: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
                  Browse work →
                </div>
              </Link>

              <Link
                href="/about"
                className="nf-card"
                style={{
                  background: "var(--surface)",
                  border: "2px solid var(--outline)",
                  borderRadius: "18px",
                  padding: "26px",
                  boxShadow: "var(--shadow)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--body)", fontSize: "11px", fontWeight: 800, color: "var(--green)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                    Philosophy
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
                    Why We&apos;re Small
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.5 }}>
                    No account managers, no layers. Direct code, design, and receipts.
                  </div>
                </div>
                <div style={{ fontFamily: "var(--body)", fontSize: "13px", fontWeight: 700, color: "var(--text)", marginTop: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
                  Read manifesto →
                </div>
              </Link>

              <Link
                href="/#brief"
                className="nf-card"
                style={{
                  background: "var(--mint)",
                  color: "#17201E",
                  border: "2px solid var(--outline)",
                  borderRadius: "18px",
                  padding: "26px",
                  boxShadow: "var(--shadow)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--body)", fontSize: "11px", fontWeight: 800, color: "#17201E", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                    Start Building
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: "24px", fontWeight: 800, color: "#17201E", marginBottom: "8px" }}>
                    Tell Us Everything
                  </div>
                  <div style={{ fontSize: "14px", color: "#2B3B37", lineHeight: 1.5 }}>
                    Have a real project? Fill out our 60-second brief intake.
                  </div>
                </div>
                <div style={{ fontFamily: "var(--body)", fontSize: "13px", fontWeight: 800, color: "#17201E", marginTop: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
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

