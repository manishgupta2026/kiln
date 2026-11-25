import type { Metadata } from "next";
import Link from "next/link";
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
import { PortfolioJsonLd } from "@/components/JsonLd";
import { getSiteContent } from "@/lib/content-db";
import { getCaseStudies } from "@/lib/case-studies-db";
import { WORK_PROJECTS } from "@/lib/work-projects";
import { STUDIO_FACTS } from "@/lib/studio-facts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "DigiGrantha: Custom Web Apps & Product Studio",
  description:
    "We design and engineer custom web applications, fast Next.js websites, and private client portals in-house. Direct access to engineers, scoped in 1-2 business days.",
  alternates: {
    canonical: "https://digigrantha.com",
  },
  openGraph: {
    title: "DigiGrantha: Custom Web Apps & Product Studio",
    description:
      "Custom web applications, Next.js websites, and private client portals built end-to-end by senior engineers.",
    url: "https://digigrantha.com",
  },
};

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
  const portfolioItems = WORK_PROJECTS.map((wp) => {
    const match = caseStudies.find((c) => c.name.toLowerCase() === wp.name.toLowerCase());
    return {
      name: wp.name,
      description: match?.oneLiner || wp.oneLiner,
      category: wp.category,
      url: wp.liveUrl,
    };
  });

  return (
    <>
      <PortfolioJsonLd items={portfolioItems} />
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

                        {/* Studio Tag & connecting trail at top: THE PROMISE */}
                        <g>
                          <rect x="15" y="8" width="102" height="23" rx="11.5" fill="#F4A228" stroke="#17201E" strokeWidth="1.8" />
                          <text x="66" y="23.5" textAnchor="middle" fill="#17201E" fontFamily="var(--display)" fontSize="11" fontWeight="800" letterSpacing="0.05em">
                            THE PROMISE
                          </text>
                          <path d="M123 19.5 L246 19.5" stroke="#17201E" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.3" />
                        </g>

                        {/* Story Card: Containing all 4 lines with identical font & size */}
                        <g>
                          {/* Hard offset shadow */}
                          <rect x="11.5" y="39.5" width="246" height="168" rx="14" fill="#17201E" />
                          {/* Card body */}
                          <rect x="8" y="36" width="246" height="168" rx="14" fill="url(#story-card-grad)" stroke="#17201E" strokeWidth="2" />

                          {/* Left pine vertical stripe */}
                          <rect x="17" y="48" width="3.5" height="144" rx="1.75" fill="#0F5C52" />

                          {/* Narrative line 1: Your idea. Our craft. */}
                          <text x="27" y="67" fill="#17201E" fontFamily="var(--display)" fontSize="12.2" fontWeight="700" letterSpacing="-0.025em">
                            Your idea. Our craft.
                          </text>

                          {/* Narrative line 2: A product people love. */}
                          <text x="27" y="97" fill="#17201E" fontFamily="var(--display)" fontSize="12.2" fontWeight="700" letterSpacing="-0.025em">
                            A product people love.
                          </text>
                          {/* Amber star spark near love */}
                          <path d="M168 91 Q170 95 174 96 Q170 97 168 101 Q166 97 162 96 Q166 95 168 91 Z" fill="#F4A228" />

                          {/* Subtle separation line */}
                          <line x1="27" y1="115" x2="238" y2="115" stroke="#17201E" strokeWidth="1" strokeDasharray="2 3" opacity="0.18" />

                          {/* Narrative line 3: Every great product starts as a story. */}
                          <text x="27" y="143" fill="#17201E" fontFamily="var(--display)" fontSize="12.2" fontWeight="700" letterSpacing="-0.025em" textLength="202" lengthAdjust="spacing">
                            Every great product starts as a story.
                          </text>

                          {/* Narrative line 4: We help write yours. */}
                          <text x="27" y="173" fill="#17201E" fontFamily="var(--display)" fontSize="12.2" fontWeight="700" letterSpacing="-0.025em">
                            We help write yours.
                          </text>
                          {/* Amber sparkle star */}
                          <path d="M158 167 Q160 171 164 172 Q160 173 158 177 Q156 173 152 172 Q156 171 158 167 Z" fill="#F4A228" />
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
                  <Link href="/work" className="proof-project">CourseHunt</Link>: a Next.js course discovery platform students open every day.
                </span>
              </div>
              <div className="proof-item">
                <mark>Live in production:</mark>
                <span>
                  <Link href="/work" className="proof-project">TradeSage</Link>: an algorithmic trading platform running with real capital ({STUDIO_FACTS.metrics.tradesage.liveWinRate} live win rate).
                </span>
              </div>
              <div className="proof-item">
                <mark>4 role-based portals:</mark>
                <span>
                  <Link href="/work" className="proof-project">Coppter</Link>: an enterprise workforce management system unifying 4 distinct user roles.
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
                <h3>A good fit if:</h3>
                <ul>
                  <li>
                    You&apos;re pre-launch, early-stage, or building something new and need one team to{" "}
                    <Link href="/about" style={{ textDecoration: "underline", fontWeight: 600 }}>
                      design and engineer it in-house
                    </Link>
                    .
                  </li>
                  <li>You want direct access to the people writing the code.</li>
                  <li>You&apos;d rather ship something sharp than something bloated.</li>
                </ul>
              </div>
              <div className="fit-col no">
                <h3>Probably not if:</h3>
                <ul>
                  <li>You need a large team on standby around the clock.</li>
                  <li>You need a full product live in a matter of days.</li>
                  <li>You&apos;re looking for a big-name agency to put on a board deck. Want to build with us?{" "}
                    <Link href="/career" style={{ textDecoration: "underline", fontWeight: 600 }}>
                      See open roles
                    </Link>
                    .
                  </li>
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
                Help us with your requirement.
              </h2>
              <p>
                Projects run across clear budget tiers starting under ₹50k for focused sites,
                ₹50k-₹2L for custom apps, and ₹2L+ for multi-role platforms. We reply within{" "}
                {STUDIO_FACTS.replySla}.
              </p>
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
