import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroIntake from "@/components/HeroIntake";
import OfferingsSection from "@/components/OfferingsSection";
import HomepageWork from "@/components/HomepageWork";
import BriefForm from "@/components/BriefForm";
import FaqSection from "@/components/FaqSection";
import CursorPreview from "@/components/CursorPreview";
import FloatingCta from "@/components/FloatingCta";
import ScrollReveal from "@/components/ScrollReveal";
import TrustSection from "@/components/TrustSection";
import PortalFeaturesSection from "@/components/PortalFeaturesSection";
import { getSiteContent } from "@/lib/content-db";
import { getCaseStudies } from "@/lib/case-studies-db";

export const revalidate = 60;

export default async function HomePage() {
  const content = await getSiteContent();
  const caseStudies = await getCaseStudies();

  return (
    <>
      <ScrollReveal />
      <Header />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-inner">
                <div className="eyebrow">
                  <span>✦</span> Design &amp; development studio
                </div>
                <h1 className="hero-headline">
                  Every agency promises <span className="strike">solutions.</span>
                  <br />
                  We&apos;d rather show you <em>receipts</em>.
                </h1>
                <p className="hero-sub">
                  Tell us what you&apos;re building — real details, not a sales call — and we&apos;ll tell
                  you honestly whether we&apos;re the right people to build it.
                </p>

                <HeroIntake />
              </div>

              {/* Handcrafted Flat Organic Workspace Illustration */}
              <div className="hero-visual reveal" aria-hidden="true">
                <div className="hero-illustration">
                  <div className="hero-ill-badge-float">
                    ⚡ Live in production
                  </div>
                  <div className="hero-ill-window">
                    <div className="hero-ill-topbar">
                      <span className="hero-ill-dot red" />
                      <span className="hero-ill-dot yellow" />
                      <span className="hero-ill-dot green" />
                      <span style={{ fontSize: "11px", fontFamily: "var(--mono)", marginLeft: "8px", opacity: 0.65 }}>
                        digigrantha.studio
                      </span>
                    </div>
                    <div className="hero-ill-body">
                      <svg viewBox="0 0 340 180" fill="none" style={{ width: "100%", height: "auto" }}>
                        <rect x="12" y="14" width="140" height="14" rx="4" fill="#0F5C52" opacity="0.8" />
                        <rect x="12" y="36" width="220" height="8" rx="3" fill="#17201E" opacity="0.3" />
                        <rect x="12" y="50" width="180" height="8" rx="3" fill="#17201E" opacity="0.2" />

                        <rect x="12" y="74" width="94" height="28" rx="14" fill="#F4B63F" stroke="#17201E" strokeWidth="2" />
                        <text x="59" y="92" textAnchor="middle" fill="#17201E" fontFamily="var(--body)" fontSize="11" fontWeight="700">Launch →</text>

                        <rect x="114" y="74" width="80" height="28" rx="14" fill="#FFFFFF" stroke="#17201E" strokeWidth="2" />
                        <text x="154" y="92" textAnchor="middle" fill="#17201E" fontFamily="var(--body)" fontSize="11" fontWeight="600">Inspect</text>

                        {/* Plant & Organic leaf stems */}
                        <path d="M260 160 C260 110, 290 85, 310 65" stroke="#0F5C52" strokeWidth="3" strokeLinecap="round" />
                        <path d="M280 120 C295 110, 315 115, 305 130 C295 135, 280 125, 280 120 Z" fill="#C6E04B" stroke="#17201E" strokeWidth="2" />
                        <path d="M265 140 C250 130, 235 140, 245 152 C255 155, 265 145, 265 140 Z" fill="#BFE3D6" stroke="#17201E" strokeWidth="2" />
                        <path d="M295 90 C310 80, 325 90, 318 102 C308 105, 298 95, 295 90 Z" fill="#F4B63F" stroke="#17201E" strokeWidth="2" />

                        {/* Metric cards */}
                        <rect x="12" y="118" width="130" height="46" rx="8" fill="#BFE3D6" stroke="#17201E" strokeWidth="2" />
                        <text x="24" y="136" fill="#17201E" fontFamily="var(--body)" fontSize="10" fontWeight="700">WIN RATE</text>
                        <text x="24" y="156" fill="#0F5C52" fontFamily="var(--display)" fontSize="18" fontWeight="800">60.5%</text>

                        <rect x="150" y="118" width="94" height="46" rx="8" fill="#FFFFFF" stroke="#17201E" strokeWidth="2" />
                        <text x="160" y="136" fill="#17201E" fontFamily="var(--body)" fontSize="10" fontWeight="700">USERS</text>
                        <text x="160" y="156" fill="#17201E" fontFamily="var(--display)" fontSize="18" fontWeight="800">1,000+</text>
                      </svg>
                    </div>
                  </div>
                  <div className="hero-ill-note">
                    Handcrafted in-house ✦
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle curved wave divider transitioning to cream background */}
          <div className="hero-wave-wrap" aria-hidden="true">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="none">
              <path d="M0,24 C360,60 1080,0 1440,32 L1440,60 L0,60 Z" fill="var(--bg)" />
            </svg>
          </div>
        </section>

        {/* ANIMATED TICKER BAND */}
        <div className="ticker-wrap" aria-label="Studio Capabilities">
          <div className="ticker-track">
            {[
              "Websites that convert",
              "High-agency web apps",
              "UI/UX Design systems",
              "Full-stack Next.js & PostgreSQL",
              "Private client portals",
              "Real numbers, no fluff",
              "In-house start to finish",
            ].map((text, idx) => (
              <span key={idx} className="ticker-item">
                <span>{text}</span>
                <span className="ticker-dot" aria-hidden="true" />
              </span>
            ))}
          </div>
          <div className="ticker-track" aria-hidden="true">
            {[
              "Websites that convert",
              "High-agency web apps",
              "UI/UX Design systems",
              "Full-stack Next.js & PostgreSQL",
              "Private client portals",
              "Real numbers, no fluff",
              "In-house start to finish",
            ].map((text, idx) => (
              <span key={`dup-${idx}`} className="ticker-item">
                <span>{text}</span>
                <span className="ticker-dot" />
              </span>
            ))}
          </div>
        </div>


        {/* PROOF LINE */}
        <section className="proof">
          <div className="wrap reveal">
            <p>
              One thing we&apos;ve shipped is already used by <mark>1,000+ people</mark>, every day.
              Another is trading real capital, live, at a <mark>60.5%</mark> win rate. A third
              shipped <mark>4 role-based portals</mark> for enterprise workforce intelligence.
            </p>
          </div>
        </section>

        {/* OFFERINGS */}
        <OfferingsSection />

        {/* WORK */}
        <HomepageWork initialCaseStudies={caseStudies} />
        <CursorPreview projects={caseStudies as any} />

        {/* RECOGNITION */}
        <section className="recognition">
          <div className="wrap">
            <div className="section-label reveal">Recognition, not claims</div>
            <h2 className="section-title reveal" style={{ marginBottom: 0 }}>
              We&apos;d rather point at receipts than adjectives.
            </h2>
            <div className="rec-grid reveal">
              <div className="rec-card">
                <div className="rv">1,000+</div>
                <div className="rl">Daily users — CourseHunt, live in production</div>
              </div>
              <div className="rec-card">
                <div className="rv">60.5%</div>
                <div className="rl">Win rate — TradeSage, live on real capital</div>
              </div>
            </div>
          </div>
        </section>

        {/* DYNAMIC TRUST / COMPANY SECTION */}
        <TrustSection config={content.trust} />

        {/* CLIENT PORTAL & WORKSPACE FEATURES */}
        <PortalFeaturesSection />

        {/* BRIEF FORM */}
        <section className="brief" id="brief">
          <div className="wrap">
            <div className="brief-head reveal">
              <div className="section-label">Okay, the real version</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Tell us everything.
              </h2>
              <p>The more specific you are, the faster we can tell you yes, no, or not yet.</p>
            </div>

            <BriefForm />
          </div>
        </section>

        {/* FIT */}
        <section className="fit">
          <div className="wrap">
            <div className="section-label reveal">Before you hit send</div>
            <h2 className="section-title reveal" style={{ marginBottom: 0 }}>
              We&apos;re small, and we say that plainly.
            </h2>
            <div className="fit-cols reveal">
              <div className="fit-col yes">
                <h4>A good fit if —</h4>
                <ul>
                  <li>
                    You&apos;re pre-launch or early-stage and need someone to design and build the whole
                    thing.
                  </li>
                  <li>You want direct access to the people writing the code.</li>
                  <li>You&apos;d rather ship something sharp than something padded.</li>
                </ul>
              </div>
              <div className="fit-col no">
                <h4>Probably not, if —</h4>
                <ul>
                  <li>You need a large team on standby around the clock.</li>
                  <li>You need something live this week.</li>
                  <li>You want a big-name agency roster for a board deck.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection />
      </main>

      <Footer showNote={true} />
      <FloatingCta />
    </>
  );
}
