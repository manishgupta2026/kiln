import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroHeadline from "@/components/HeroHeadline";
import HeroIntake from "@/components/HeroIntake";
import OfferingsSection from "@/components/OfferingsSection";
import HomepageWork from "@/components/HomepageWork";
import BriefForm from "@/components/BriefForm";
import CursorPreview from "@/components/CursorPreview";
import FloatingCta from "@/components/FloatingCta";
import ScrollReveal from "@/components/ScrollReveal";
import TrustSection from "@/components/TrustSection";
import PortalFeaturesSection from "@/components/PortalFeaturesSection";
import ProcessSection from "@/components/ProcessSection";
import StatsStrip from "@/components/StatsStrip";
import { getSiteContent } from "@/lib/content-db";
import { getCaseStudies } from "@/lib/case-studies-db";

export const revalidate = 60;

const TICKER_ITEMS = [
  "Ideas into real products",
  "Design that makes sense",
  "Code built with purpose",
  "Full-stack architecture",
  "End to end engineering",
  "No unnecessary handoffs",
  "Real products, real outcomes",
  "Built in-house, start to finish",
];

const TICKER_LIST = [
  ...TICKER_ITEMS,
  ...TICKER_ITEMS,
  ...TICKER_ITEMS,
  ...TICKER_ITEMS,
];

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
                  <span>·</span> Digital Product Studio
                </div>
                <HeroHeadline />
                <p className="hero-sub">
                  At DigiGrantha, we take ambitious ideas and shape them into thoughtful, well-engineered digital experiences, from responsive web applications to scalable client portals and digital systems.
                </p>

                <HeroIntake />
              </div>

              {/* Handcrafted Flat Organic Workspace Illustration */}
              <div className="hero-visual reveal" aria-hidden="true">
                <div className="hero-illustration">
                  <div className="hero-ill-badge-float">
                    Live in production
                  </div>
                  <div className="hero-ill-window">
                    <div className="hero-ill-topbar">
                      <span className="hero-ill-dot red" />
                      <span className="hero-ill-dot yellow" />
                      <span className="hero-ill-dot green" />
                    </div>
                    <div className="hero-ill-body">
                      <svg viewBox="0 0 360 215" fill="none" style={{ width: "100%", height: "auto" }}>
                        <defs>
                          {/* Subtle dot pattern for workspace blueprint background */}
                          <pattern id="hero-dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="0.8" fill="#17201E" opacity="0.08" />
                          </pattern>
                          <linearGradient id="story-card-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="100%" stopColor="#FAF7EE" />
                          </linearGradient>
                        </defs>

                        {/* Background dot grid */}
                        <rect x="0" y="0" width="360" height="215" fill="url(#hero-dot-grid)" />

                        {/* Headline: Your idea. Our craft. */}
                        <text x="18" y="32" fill="#17201E" fontFamily="var(--display)" fontSize="19.5" fontWeight="800" letterSpacing="-0.025em">
                          Your idea. Our craft.
                        </text>
                        {/* 3 teal spark rays above 'craft.' */}
                        <path d="M180 15 L174 8" stroke="#0F5C52" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M190 13 L190 5" stroke="#0F5C52" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M200 15 L206 8" stroke="#0F5C52" strokeWidth="2.5" strokeLinecap="round" />

                        {/* Line 2: A product people love. */}
                        <text x="18" y="59" fill="#17201E" fontFamily="var(--display)" fontSize="19.5" fontWeight="800" letterSpacing="-0.025em">
                          A product people love.
                        </text>
                        {/* Mint brush highlight under 'love.' */}
                        <path d="M140 66 C166 64, 194 66, 214 65" stroke="#BFE5D9" strokeWidth="4.5" strokeLinecap="round" />
                        {/* Amber star spark near love */}
                        <path d="M224 53 Q226 57 230 58 Q226 59 224 63 Q222 59 218 58 Q222 57 224 53 Z" fill="#F4A228" />

                        {/* Studio Tag & connecting trail */}
                        <g>
                          <rect x="18" y="78" width="90" height="22" rx="11" fill="#F4A228" stroke="#17201E" strokeWidth="1.8" />
                          <text x="63" y="93" textAnchor="middle" fill="#17201E" fontFamily="var(--display)" fontSize="10" fontWeight="800" letterSpacing="0.04em">
                            THE PROMISE
                          </text>
                          <path d="M116 89 L238 89" stroke="#17201E" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.35" />
                        </g>

                        {/* Story Card: "Every great product starts as a story. We help write yours." */}
                        <g>
                          {/* Hard offset shadow */}
                          <rect x="21.5" y="112.5" width="228" height="88" rx="14" fill="#17201E" />
                          {/* Card body */}
                          <rect x="18" y="109" width="228" height="88" rx="14" fill="url(#story-card-grad)" stroke="#17201E" strokeWidth="2" />

                          {/* Left pine vertical stripe */}
                          <rect x="28" y="120" width="3.5" height="66" rx="1.75" fill="#0F5C52" />

                          {/* Subtitle tag */}
                          <text x="40" y="132" fill="#5F6B68" fontFamily="var(--display)" fontSize="9.5" fontWeight="800" letterSpacing="0.06em">
                            · THE BEGINNING
                          </text>

                          {/* Narrative line 1 */}
                          <text x="40" y="150" fill="#17201E" fontFamily="var(--display)" fontSize="11.5" fontWeight="700" letterSpacing="-0.01em">
                            Every great product starts as a story.
                          </text>

                          {/* Narrative line 2 (Payoff) */}
                          <text x="40" y="174" fill="#0F5C52" fontFamily="var(--display)" fontSize="14" fontWeight="800" fontStyle="italic" letterSpacing="-0.015em">
                            We help write yours.
                          </text>

                          {/* Amber sparkle star */}
                          <path d="M182 165 Q184 170 188 171 Q184 172 182 177 Q180 172 176 171 Q180 170 182 165 Z" fill="#F4A228" />

                          {/* Mint Ship button badge */}
                          <g>
                            <rect x="194" y="159" width="42" height="22" rx="11" fill="#BFE5D9" stroke="#17201E" strokeWidth="1.5" />
                            <text x="215" y="174" textAnchor="middle" fill="#0F5C52" fontFamily="var(--display)" fontSize="11" fontWeight="800">
                              Ship ↗
                            </text>
                          </g>
                        </g>

                        {/* Botanical Leaf Stem (Right Side) */}
                        <path d="M276 200 C270 155, 284 105, 328 48" stroke="#0F5C52" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                        {/* Leaf 1 (Mint, pointing left) */}
                        <path d="M274 162 C258 158, 254 168, 267 176 C275 179, 276 169, 274 162 Z" fill="#BFE5D9" stroke="#17201E" strokeWidth="2" />
                        {/* Leaf 2 (Amber, pointing right top) */}
                        <path d="M312 84 C326 76, 338 86, 332 96 C324 101, 316 91, 312 84 Z" fill="#F4A228" stroke="#17201E" strokeWidth="2" />
                        {/* Leaf 3 (Lime, pointing right mid) */}
                        <path d="M294 122 C308 114, 322 124, 316 134 C308 139, 299 129, 294 122 Z" fill="#C8F049" stroke="#17201E" strokeWidth="2" />
                        {/* Top sprout bud & star */}
                        <circle cx="328" cy="46" r="4.5" fill="#0F5C52" />
                        <path d="M326 22 Q328 26 332 27 Q328 28 326 32 Q324 28 320 27 Q324 26 326 22 Z" fill="#F4A228" />
                      </svg>
                    </div>
                  </div>
                  <div className="hero-ill-note">
                    Handcrafted in-house
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
            {TICKER_LIST.map((text, idx) => (
              <span key={idx} className="ticker-item">
                <span>{text}</span>
                <span className="ticker-dot" aria-hidden="true" />
              </span>
            ))}
          </div>
          <div className="ticker-track" aria-hidden="true">
            {TICKER_LIST.map((text, idx) => (
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
            <h2 className="proof-heading">Built. Shipped. Used.</h2>
            <div className="proof-items">
              <div className="proof-item">
                <mark>1,000+ daily users:</mark>
                <span>
                  <a href="#work" className="proof-project">CourseHunt</a> — a course discovery platform people open every single day.
                </span>
              </div>
              <div className="proof-item">
                <mark>Live in production:</mark>
                <span>
                  <a href="#work" className="proof-project">TradeSage</a> — an algorithmic trading platform running with real capital, where reliability isn&apos;t optional.
                </span>
              </div>
              <div className="proof-item">
                <mark>4 role-based portals:</mark>
                <span>
                  <a href="#work" className="proof-project">Coppter</a> — an enterprise workforce intelligence platform serving every level of the organization, from one system.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* OFFERINGS */}
        <OfferingsSection />

        {/* WORK */}
        <HomepageWork initialCaseStudies={caseStudies} />
        <CursorPreview projects={caseStudies as any} />

        {/* RECOGNITION / STATS */}
        <section className="recognition" id="recognition" aria-label="Key Milestones & Impact">
          <div className="wrap">
            <StatsStrip />
          </div>
        </section>

        {/* DYNAMIC TRUST / COMPANY SECTION */}
        <TrustSection config={content.trust} />

        {/* CLIENT PORTAL & WORKSPACE FEATURES */}
        <PortalFeaturesSection />

        {/* PROCESS: HOW WE WORK */}
        <ProcessSection />

        {/* FIT */}
        <section className="fit">
          <div className="wrap">
            <div className="section-label reveal">is this a fit?</div>
            <h2 className="section-title reveal" style={{ marginBottom: 0 }}>
              We&apos;re small, and we say that plainly.
            </h2>
            <div className="fit-cols reveal">
              <div className="fit-col yes">
                <h4>A good fit if:</h4>
                <ul>
                  <li>
                    You&apos;re pre-launch, early-stage, or building something new and need one team to design and build the whole thing.
                  </li>
                  <li>You want direct access to the people writing the code.</li>
                  <li>You&apos;d rather ship something sharp than something bloated.</li>
                </ul>
              </div>
              <div className="fit-col no">
                <h4>Probably not if:</h4>
                <ul>
                  <li>You need a large team on standby around the clock.</li>
                  <li>You need a full product live in a matter of days.</li>
                  <li>You&apos;re looking for a big-name agency to put on a board deck.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* BRIEF FORM */}
        <section className="brief" id="brief">
          <div className="wrap">
            <div className="brief-head reveal">
              <div className="section-label">Waiting to serve you</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Tell us everything.
              </h2>
              <p>The more specific you are, the faster we can tell you yes, no, or not yet.</p>
            </div>

            <BriefForm />
          </div>
        </section>
      </main>

      <Footer />
      <FloatingCta />
    </>
  );
}
