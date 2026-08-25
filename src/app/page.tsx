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

export const revalidate = 3600;

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <>
      <ScrollReveal />
      <Header />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-inner">
            <div className="eyebrow">Design &amp; development studio</div>
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
        </section>

        {/* PROOF LINE */}
        <section className="proof">
          <div className="wrap reveal">
            <p>
              One thing we&apos;ve shipped is already used by <mark>1,000+ people</mark>, every day.
              Another is trading real capital, live, at a <mark>60.5%</mark> win rate. A third
              placed <mark>top 60 nationally</mark> before most people had heard of it.
            </p>
          </div>
        </section>

        {/* OFFERINGS */}
        <OfferingsSection />

        {/* WORK */}
        <HomepageWork initialProjects={content.projects} />
        <CursorPreview projects={content.projects} />

        {/* RECOGNITION */}
        <section className="recognition">
          <div className="wrap">
            <div className="section-label reveal">Recognition, not claims</div>
            <h2 className="section-title reveal" style={{ marginBottom: 0 }}>
              We&apos;d rather point at receipts than adjectives.
            </h2>
            <div className="rec-grid reveal">
              <div className="rec-card">
                <div className="rv">1st</div>
                <div className="rl">Place — ITER SOA University hackathon</div>
              </div>
              <div className="rec-card">
                <div className="rv">Top 60</div>
                <div className="rl">Nationally — Guidewire DevTrails 2026</div>
              </div>
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
