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
import { getSiteContent } from "@/lib/content-db";
import { getCaseStudies } from "@/lib/case-studies-db";

export const revalidate = 60;

const TICKER_ITEMS = [
  "Ideas into real products",
  "Design that makes sense",
  "Code built with purpose",
  "AI beyond the hype",
  "Full-stack, end to end",
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
                  <span>✦</span> Digital Product Studio
                </div>
                <HeroHeadline />
                <p className="hero-sub">
                  At DigiGrantha, we take ambitious ideas and shape them into thoughtful, well-engineered digital experiences, from sleek websites to powerful web apps and AI-driven platforms.
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
                    </div>
                    <div className="hero-ill-body">
                      <svg viewBox="0 0 360 215" fill="none" style={{ width: "100%", height: "auto" }}>
                        {/* Headline */}
                        <text x="18" y="36" fill="#17201E" fontFamily="var(--display)" fontSize="20" fontWeight="800" letterSpacing="-0.02em">
                          Your idea. Our craft.
                        </text>
                        {/* 3 teal spark rays above 'craft.' */}
                        <path d="M182 17 L176 9" stroke="#0F5C52" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M192 15 L192 6" stroke="#0F5C52" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M202 17 L208 9" stroke="#0F5C52" strokeWidth="2.5" strokeLinecap="round" />

                        {/* Line 2 with mint brush highlight under 'love.' */}
                        <text x="18" y="66" fill="#17201E" fontFamily="var(--display)" fontSize="20" fontWeight="800" letterSpacing="-0.02em">
                          A product people love.
                        </text>
                        <path d="M110 74 C138 72, 172 74, 198 72" stroke="#BFE5D9" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />

                        {/* Interactive Pill Buttons */}
                        <g>
                          <rect x="18" y="90" width="94" height="30" rx="15" fill="#F4A228" stroke="#17201E" strokeWidth="2" />
                          <text x="65" y="109" textAnchor="middle" fill="#17201E" fontFamily="var(--display)" fontSize="13" fontWeight="800">
                            Launch →
                          </text>
                        </g>

                        <g>
                          <rect x="122" y="90" width="84" height="30" rx="15" fill="#FFFFFF" stroke="#17201E" strokeWidth="2" />
                          <text x="164" y="109" textAnchor="middle" fill="#17201E" fontFamily="var(--display)" fontSize="13" fontWeight="800">
                            Inspect
                          </text>
                        </g>

                        {/* Stat Box 1: WIN RATE 60.5% */}
                        <g>
                          <rect x="18" y="140" width="134" height="48" rx="10" fill="#BFE5D9" stroke="#17201E" strokeWidth="2" />
                          <text x="30" y="157" fill="#17201E" fontFamily="var(--display)" fontSize="10" fontWeight="800" letterSpacing="0.06em">
                            WIN RATE
                          </text>
                          <text x="30" y="177" fill="#0F5C52" fontFamily="var(--display)" fontSize="18" fontWeight="800">
                            60.5%
                          </text>
                        </g>

                        {/* Stat Box 2: USERS 1,000+ */}
                        <g>
                          <rect x="162" y="140" width="96" height="48" rx="10" fill="#FFFFFF" stroke="#17201E" strokeWidth="2" />
                          <text x="174" y="157" fill="#17201E" fontFamily="var(--display)" fontSize="10" fontWeight="800" letterSpacing="0.06em">
                            USERS
                          </text>
                          <text x="174" y="177" fill="#17201E" fontFamily="var(--display)" fontSize="18" fontWeight="800">
                            1,000+
                          </text>
                        </g>

                        {/* Botanical Leaf Stem (Right Side) */}
                        <path d="M276 195 C272 155, 285 110, 326 58" stroke="#0F5C52" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                        {/* Leaf 1 (Mint, pointing left) */}
                        <path d="M275 160 C260 156, 256 166, 268 174 C276 177, 277 167, 275 160 Z" fill="#BFE5D9" stroke="#17201E" strokeWidth="2" />
                        {/* Leaf 2 (Amber, pointing right top) */}
                        <path d="M312 86 C326 78, 338 88, 332 98 C324 103, 316 93, 312 86 Z" fill="#F4A228" stroke="#17201E" strokeWidth="2" />
                        {/* Leaf 3 (Lime, pointing right mid) */}
                        <path d="M296 120 C310 112, 324 122, 318 132 C310 137, 301 127, 296 120 Z" fill="#C8F049" stroke="#17201E" strokeWidth="2" />
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
                <span>A product people open every single day.</span>
              </div>
              <div className="proof-item">
                <mark>Live in production:</mark>
                <span>An algorithmic trading platform running with real capital, where reliability isn&apos;t optional.</span>
              </div>
              <div className="proof-item">
                <mark>4 role-based portals:</mark>
                <span>An enterprise workforce intelligence platform serving every level of the organization, from one system.</span>
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
            <div className="stats-strip reveal">
              <div className="stat-col">
                <div className="stat-val">50+</div>
                <div className="stat-lbl">Projects delivered</div>
              </div>
              <div className="stat-col">
                <div className="stat-val">98%</div>
                <div className="stat-lbl">Client satisfaction</div>
              </div>
              <div className="stat-col">
                <div className="stat-val">2+</div>
                <div className="stat-lbl">Years of experience</div>
              </div>
              <div className="stat-col">
                <div className="stat-val">100%</div>
                <div className="stat-lbl">Passion for your growth</div>
              </div>
            </div>
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

      <Footer showNote={true} />
      <FloatingCta />
    </>
  );
}
