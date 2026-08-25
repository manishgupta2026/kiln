import Link from "next/link";

interface FooterProps {
  showNote?: boolean;
}

export default function Footer({ showNote = true }: FooterProps) {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-inner">
          <Link href="/" className="logo">
            Kiln<span>.</span>
          </Link>
          <div className="footer-links">
            <Link href="/work">Work</Link>
            <Link href="/#offerings">Offerings</Link>
            <Link href="/about">About</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/#brief">Start a project</Link>
            <Link href="/login" style={{ color: "var(--accent)" }}>
              Client Portal →
            </Link>
          </div>
        </div>

        {showNote && (
          <div className="footer-bottom">
            <div className="footer-note">
              © 2026 Kiln Studio. Design and development, in-house, start to finish.
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
