import Link from "next/link";

interface FooterProps {
  showNote?: boolean;
}

export default function Footer({ showNote = true }: FooterProps) {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-inner">
          <Link href="/" className="logo-brand">
            <div className="logo-lockup">
              <div className="logo-mark-wrap">
                <img
                  src="/digigrantha-mark-on-dark.svg"
                  alt="DigiGrantha"
                  className="brand-mark-img"
                  width={38}
                  height={38}
                />
              </div>
              <div className="logo-text-group">
                <div className="logo-title">
                  <span className="logo-name-digi">Digi</span>
                  <span className="logo-name-grantha">Grantha</span>
                  <span className="logo-dot">.</span>
                </div>
                <span className="logo-tagline">Where ideas become digital</span>
              </div>
            </div>
          </Link>
          <div className="footer-links">
            <Link href="/work">Work</Link>
            <Link href="/#offerings">Offerings</Link>
            <Link href="/about">About</Link>
            <Link href="/career">Careers</Link>
            <Link href="/#brief">Start a project</Link>
            <Link href="/login" style={{ color: "var(--yellow)", fontWeight: 700 }}>
              Client Portal →
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-note">
            © 2026 DigiGrantha. Expressive digital product &amp; web studio. Built in-house, start to finish.
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--mint)" }}>
            ✦ Handcrafted in-house
          </div>
        </div>
      </div>
    </footer>
  );
}
