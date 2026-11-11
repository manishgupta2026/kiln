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
            <img
              src="/digigrantha-logo-on-dark.svg"
              alt="DigiGrantha"
              className="logo-img"
              width={172}
              height={40}
            />
            <span className="logo-tagline">Where ideas become digital</span>
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
