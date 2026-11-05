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
            <div className="logo">
              <span className="brand-mark" aria-hidden="true">D</span>
              <span className="logo-text">DigiGrantha</span>
              <span className="logo-dot">.</span>
            </div>
            <span className="logo-tagline">Where idea become Digital</span>
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
