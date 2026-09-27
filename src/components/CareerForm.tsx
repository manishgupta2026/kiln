"use client";

import { useState } from "react";

type FormType = "JOB" | "INTERNSHIP" | "FREELANCING";

const JOB_ROLES = [
  "Fullstack Engineer",
  "Frontend Specialist",
  "Backend & Systems",
  "UI / UX Product Designer",
  "Mobile Developer (React Native)",
  "AI / ML Engineer",
  "DevOps & Infrastructure",
  "Other",
];

const EXPERIENCE_CHIPS = [
  "0 – 1 Years",
  "1 – 3 Years",
  "3 – 5 Years",
  "5 – 8 Years",
  "8+ Years",
];

const NOTICE_CHIPS = [
  "Immediate",
  "15 Days",
  "30 Days",
  "60 Days",
  "90 Days",
];

const INTERN_DOMAINS = [
  "Frontend Web",
  "Backend APIs",
  "Fullstack Dev",
  "UI / UX Design",
  "AI & Integrations",
  "Mobile Apps",
];

const GRAD_YEARS = ["2025", "2026", "2027", "2028", "Other"];

const INTERN_DURATIONS = ["2 – 3 Months", "6 Months", "Flexible"];

const INTERN_HOURS = ["Full-Time (40h/wk)", "Part-Time (20h/wk)"];

const FREELANCE_DOMAINS = [
  "Next.js & Frontend",
  "UI/UX & Design Systems",
  "Fullstack Engineering",
  "Backend Architecture",
  "React Native Mobile",
  "Performance & SEO",
];

const FREELANCE_AVAILABILITY = [
  "10 – 20 hrs / wk",
  "20 – 30 hrs / wk",
  "30 – 40 hrs / wk",
  "Project-based sprints",
];

const POPULAR_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Prisma",
  "Tailwind CSS",
  "Figma",
  "Python",
  "Docker",
  "GraphQL",
  "REST APIs",
];

export default function CareerForm() {
  const [activeTab, setActiveTab] = useState<FormType>("JOB");

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // Job Specific
  const [jobRole, setJobRole] = useState(JOB_ROLES[0]);
  const [customJobRole, setCustomJobRole] = useState("");
  const [experience, setExperience] = useState(EXPERIENCE_CHIPS[1]);
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [noticePeriod, setNoticePeriod] = useState(NOTICE_CHIPS[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Next.js",
    "React",
    "TypeScript",
  ]);
  const [customSkills, setCustomSkills] = useState("");
  const [jobNote, setJobNote] = useState("");

  // Internship Specific
  const [collegeName, setCollegeName] = useState("");
  const [degreeMajor, setDegreeMajor] = useState("");
  const [gradYear, setGradYear] = useState(GRAD_YEARS[1]);
  const [internDomain, setInternDomain] = useState(INTERN_DOMAINS[0]);
  const [internDuration, setInternDuration] = useState(INTERN_DURATIONS[1]);
  const [internHours, setInternHours] = useState(INTERN_HOURS[0]);
  const [internStipend, setInternStipend] = useState("");
  const [proudestProject, setProudestProject] = useState("");
  const [internLearningGoal, setInternLearningGoal] = useState("");

  // Freelancing Specific
  const [freelanceDomain, setFreelanceDomain] = useState(FREELANCE_DOMAINS[0]);
  const [freelanceWeeklyHours, setFreelanceWeeklyHours] = useState(FREELANCE_AVAILABILITY[0]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [freelanceYears, setFreelanceYears] = useState("");
  const [clientProjectsLinks, setClientProjectsLinks] = useState("");
  const [timezoneOverlap, setTimezoneOverlap] = useState("");
  const [freelanceNote, setFreelanceNote] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Merge skills
    let finalSkills = [...selectedSkills];
    if (customSkills.trim()) {
      const extra = customSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      finalSkills = Array.from(new Set([...finalSkills, ...extra]));
    }

    let payload: Record<string, any> = {
      type: activeTab,
      name,
      email,
      phone,
      location: location || null,
      resumeUrl,
      portfolioUrl: portfolioUrl || null,
      githubUrl: githubUrl || null,
      linkedinUrl: linkedinUrl || null,
      website: honeypot,
    };

    if (activeTab === "JOB") {
      const targetRole = jobRole === "Other" && customJobRole.trim() ? customJobRole.trim() : jobRole;
      payload = {
        ...payload,
        role: targetRole,
        experience,
        rateOrSalary: expectedCtc ? `Expected: ${expectedCtc}${currentCtc ? ` (Current: ${currentCtc})` : ""}` : null,
        availability: noticePeriod,
        skills: finalSkills,
        coverNote: jobNote || "Interested in joining Kiln full-time.",
        metadata: {
          currentCompany: currentCompany || null,
          currentCtc: currentCtc || null,
          expectedCtc: expectedCtc || null,
          noticePeriod,
        },
      };
    } else if (activeTab === "INTERNSHIP") {
      payload = {
        ...payload,
        role: `Internship (${internDomain})`,
        experience: `Class of ${gradYear}`,
        rateOrSalary: internStipend ? `Expected Stipend: ${internStipend}` : null,
        availability: `${internDuration} (${internHours})`,
        skills: finalSkills,
        coverNote: `Proudest Project:\n${proudestProject}\n\nLearning Goals:\n${internLearningGoal}`,
        metadata: {
          collegeName,
          degreeMajor,
          gradYear,
          internDomain,
          internDuration,
          internHours,
          proudestProject,
          internLearningGoal,
          internStipend: internStipend || null,
        },
      };
    } else if (activeTab === "FREELANCING") {
      payload = {
        ...payload,
        role: `Freelance Specialist (${freelanceDomain})`,
        experience: freelanceYears ? `${freelanceYears} yrs consulting` : null,
        rateOrSalary: hourlyRate ? `Rate: ${hourlyRate}` : null,
        availability: `${freelanceWeeklyHours} (${timezoneOverlap || "Flexible overlap"})`,
        skills: finalSkills,
        coverNote: `Client Work & Links:\n${clientProjectsLinks}\n\nCollaboration Style & Passions:\n${freelanceNote}`,
        metadata: {
          freelanceDomain,
          freelanceWeeklyHours,
          hourlyRate,
          freelanceYears: freelanceYears || null,
          clientProjectsLinks,
          timezoneOverlap: timezoneOverlap || null,
          freelanceNote,
        },
      };
    }

    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit application. Please check your inputs.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="career-container">
      {/* 3 Forms Navigation Tabs */}
      <div className="career-tabs-bar" role="tablist" aria-label="Career Openings">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "JOB"}
          className={`career-tab-btn ${activeTab === "JOB" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("JOB");
            setErrorMessage(null);
          }}
        >
          <span className="career-tab-icon">💼</span>
          <span className="career-tab-title">Full-time Job</span>
          <span className="career-tab-badge">Core Team</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "INTERNSHIP"}
          className={`career-tab-btn ${activeTab === "INTERNSHIP" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("INTERNSHIP");
            setErrorMessage(null);
          }}
        >
          <span className="career-tab-icon">🎓</span>
          <span className="career-tab-title">Internship</span>
          <span className="career-tab-badge">Builders &amp; Students</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "FREELANCING"}
          className={`career-tab-btn ${activeTab === "FREELANCING" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("FREELANCING");
            setErrorMessage(null);
          }}
        >
          <span className="career-tab-icon">⚡</span>
          <span className="career-tab-title">Freelancing</span>
          <span className="career-tab-badge">Contractors</span>
        </button>
      </div>

      {/* Tab Context Card */}
      <div className="career-intro-box">
        {activeTab === "JOB" && (
          <div>
            <div className="career-intro-tag">Join as a Core Builder</div>
            <p>
              We look for engineers and designers with high agency, taste for fine details, and end-to-end
              ownership. Direct architecture decisions, zero corporate red-tape, and real ownership of client systems.
            </p>
          </div>
        )}
        {activeTab === "INTERNSHIP" && (
          <div>
            <div className="career-intro-tag">Ship Production Software from Day One</div>
            <p>
              No artificial toy projects or busywork. You will pair directly with our founding engineers,
              review pull requests, learn modern Next.js/TypeScript architecture, and ship live software to production.
            </p>
          </div>
        )}
        {activeTab === "FREELANCING" && (
          <div>
            <div className="career-intro-tag">High-Velocity Contracting &amp; Retainers</div>
            <p>
              Partner with Kiln on specialized modules, design systems, rapid prototypes, or performance optimizations.
              Clear milestones, prompt weekly/monthly disbursements, and asynchronous respect for your time.
            </p>
          </div>
        )}
      </div>

      {/* SUCCESS STATE */}
      {isSuccess ? (
        <div className="career-success-card">
          <div className="career-success-icon">✓</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: "28px", margin: "14px 0 8px" }}>
            Application Received!
          </h2>
          <p style={{ color: "var(--muted)", maxWidth: "560px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            Thank you for applying for a <strong>{activeTab.toLowerCase()}</strong> position at Kiln.
            We personally review every GitHub repository, portfolio link, and background note.
            If your craftsmanship matches what we&apos;re building, we will reach out directly via WhatsApp or email.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleResetForm}
          >
            Submit Another Application →
          </button>
        </div>
      ) : (
        /* APPLICATION FORM */
        <form className="brief-form career-form" onSubmit={handleSubmit}>
          {/* Honeypot field for bot protection */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="career_website">Website</label>
            <input
              type="text"
              id="career_website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="form-section-title">
            <span>01</span> Personal &amp; Contact Details
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="cName">Full Name *</label>
              <input
                type="text"
                id="cName"
                required
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="cEmail">Email Address *</label>
              <input
                type="email"
                id="cEmail"
                required
                placeholder="alex@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: "20px" }}>
            <div className="field">
              <label htmlFor="cPhone">Phone / WhatsApp *</label>
              <input
                type="tel"
                id="cPhone"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="cLocation">Current Location / City</label>
              <input
                type="text"
                id="cLocation"
                placeholder="e.g. Bengaluru, India or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-section-title">
            <span>02</span> Profiles &amp; Resume
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="cResume">Resume / CV Link *</label>
              <input
                type="url"
                id="cResume"
                required
                placeholder="Google Drive, Dropbox, or PDF URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
              />
              <span className="field-hint">
                Please ensure link sharing is set to &quot;Anyone with the link can view&quot;.
              </span>
            </div>

            <div className="field">
              <label htmlFor="cPortfolio">Portfolio / Personal Website</label>
              <input
                type="url"
                id="cPortfolio"
                placeholder="https://yourportfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: "20px" }}>
            <div className="field">
              <label htmlFor="cGithub">GitHub Profile</label>
              <input
                type="url"
                id="cGithub"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="cLinkedin">LinkedIn Profile</label>
              <input
                type="url"
                id="cLinkedin"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          {/* ================= TAB SPECIFIC FORM FIELDS ================= */}

          {/* 1. JOB FORM FIELDS */}
          {activeTab === "JOB" && (
            <>
              <div className="form-section-title">
                <span>03</span> Role &amp; Experience
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label>Target Role *</label>
                <div className="chip-row">
                  {JOB_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`chip ${jobRole === role ? "active" : ""}`}
                      onClick={() => setJobRole(role)}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                {jobRole === "Other" && (
                  <input
                    type="text"
                    style={{ marginTop: "10px" }}
                    placeholder="Specify the role you are applying for..."
                    value={customJobRole}
                    onChange={(e) => setCustomJobRole(e.target.value)}
                  />
                )}
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label>Years of Relevant Experience</label>
                <div className="chip-row">
                  {EXPERIENCE_CHIPS.map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      className={`chip ${experience === exp ? "active" : ""}`}
                      onClick={() => setExperience(exp)}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="jCompany">Current / Most Recent Company</label>
                  <input
                    type="text"
                    id="jCompany"
                    placeholder="Company or Studio Name"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="jCurrentCtc">Current Compensation (CTC)</label>
                  <input
                    type="text"
                    id="jCurrentCtc"
                    placeholder="e.g. ₹18 LPA or Confidential"
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: "18px" }}>
                <div className="field">
                  <label htmlFor="jExpectedCtc">Expected Compensation (CTC) *</label>
                  <input
                    type="text"
                    id="jExpectedCtc"
                    required
                    placeholder="e.g. ₹24 LPA or $80,000/yr"
                    value={expectedCtc}
                    onChange={(e) => setExpectedCtc(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Notice Period / Availability</label>
                  <div className="chip-row">
                    {NOTICE_CHIPS.map((notice) => (
                      <button
                        key={notice}
                        type="button"
                        className={`chip ${noticePeriod === notice ? "active" : ""}`}
                        onClick={() => setNoticePeriod(notice)}
                      >
                        {notice}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label>Tech Stack &amp; Skills</label>
                <div className="chip-row">
                  {POPULAR_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className={`chip ${selectedSkills.includes(skill) ? "active" : ""}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {selectedSkills.includes(skill) ? `✓ ${skill}` : skill}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  style={{ marginTop: "10px" }}
                  placeholder="Additional skills (comma-separated, e.g. AWS, Redis, GraphQL)"
                  value={customSkills}
                  onChange={(e) => setCustomSkills(e.target.value)}
                />
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label htmlFor="jNote">Why Kiln? / What drives your craftsmanship? *</label>
                <textarea
                  id="jNote"
                  required
                  rows={4}
                  placeholder="Tell us what you love building, the hardest bug you've solved, or why you prefer a small boutique studio over big tech."
                  value={jobNote}
                  onChange={(e) => setJobNote(e.target.value)}
                />
              </div>
            </>
          )}

          {/* 2. INTERNSHIP FORM FIELDS */}
          {activeTab === "INTERNSHIP" && (
            <>
              <div className="form-section-title">
                <span>03</span> Education &amp; Internship Focus
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="iCollege">College / University Name *</label>
                  <input
                    type="text"
                    id="iCollege"
                    required
                    placeholder="e.g. BITS Pilani, IIT Bombay, SRM, etc."
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="iDegree">Degree &amp; Major *</label>
                  <input
                    type="text"
                    id="iDegree"
                    required
                    placeholder="e.g. B.Tech Computer Science, B.Des, etc."
                    value={degreeMajor}
                    onChange={(e) => setDegreeMajor(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: "18px" }}>
                <div className="field">
                  <label>Graduation Year</label>
                  <div className="chip-row">
                    {GRAD_YEARS.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        className={`chip ${gradYear === yr ? "active" : ""}`}
                        onClick={() => setGradYear(yr)}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="iStipend">Expected Monthly Stipend</label>
                  <input
                    type="text"
                    id="iStipend"
                    placeholder="e.g. ₹20k - ₹35k / month"
                    value={internStipend}
                    onChange={(e) => setInternStipend(e.target.value)}
                  />
                </div>
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label>Focus Area *</label>
                <div className="chip-row">
                  {INTERN_DOMAINS.map((dom) => (
                    <button
                      key={dom}
                      type="button"
                      className={`chip ${internDomain === dom ? "active" : ""}`}
                      onClick={() => setInternDomain(dom)}
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: "18px" }}>
                <div className="field">
                  <label>Preferred Internship Duration</label>
                  <div className="chip-row">
                    {INTERN_DURATIONS.map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        className={`chip ${internDuration === dur ? "active" : ""}`}
                        onClick={() => setInternDuration(dur)}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Commitment</label>
                  <div className="chip-row">
                    {INTERN_HOURS.map((hr) => (
                      <button
                        key={hr}
                        type="button"
                        className={`chip ${internHours === hr ? "active" : ""}`}
                        onClick={() => setInternHours(hr)}
                      >
                        {hr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label>Tech Stack &amp; Skills You Know</label>
                <div className="chip-row">
                  {POPULAR_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className={`chip ${selectedSkills.includes(skill) ? "active" : ""}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {selectedSkills.includes(skill) ? `✓ ${skill}` : skill}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  style={{ marginTop: "10px" }}
                  placeholder="Other tools, libraries, or languages you use..."
                  value={customSkills}
                  onChange={(e) => setCustomSkills(e.target.value)}
                />
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label htmlFor="iProject">Tell us about your proudest project or live demo link *</label>
                <textarea
                  id="iProject"
                  required
                  rows={3}
                  placeholder="What does it do? Why did you build it? What was the hardest part? Include GitHub link or live deployment if available."
                  value={proudestProject}
                  onChange={(e) => setProudestProject(e.target.value)}
                />
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label htmlFor="iGoals">What do you hope to learn &amp; build at Kiln? *</label>
                <textarea
                  id="iGoals"
                  required
                  rows={3}
                  placeholder="What engineering or design superpowers do you want to develop during this internship?"
                  value={internLearningGoal}
                  onChange={(e) => setInternLearningGoal(e.target.value)}
                />
              </div>
            </>
          )}

          {/* 3. FREELANCING FORM FIELDS */}
          {activeTab === "FREELANCING" && (
            <>
              <div className="form-section-title">
                <span>03</span> Contracting Scope &amp; Availability
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label>Primary Consulting Domain *</label>
                <div className="chip-row">
                  {FREELANCE_DOMAINS.map((dom) => (
                    <button
                      key={dom}
                      type="button"
                      className={`chip ${freelanceDomain === dom ? "active" : ""}`}
                      onClick={() => setFreelanceDomain(dom)}
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label>Weekly Availability *</label>
                <div className="chip-row">
                  {FREELANCE_AVAILABILITY.map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      className={`chip ${freelanceWeeklyHours === hrs ? "active" : ""}`}
                      onClick={() => setFreelanceWeeklyHours(hrs)}
                    >
                      {hrs}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="fRate">Hourly Rate or Monthly Project Retainer *</label>
                  <input
                    type="text"
                    id="fRate"
                    required
                    placeholder="e.g. ₹2,500/hr, $45/hr, or ₹1.5L/module"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="fExp">Years as Independent Freelancer / Consultant</label>
                  <input
                    type="text"
                    id="fExp"
                    placeholder="e.g. 3+ years"
                    value={freelanceYears}
                    onChange={(e) => setFreelanceYears(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: "18px" }}>
                <div className="field field-full">
                  <label htmlFor="fTz">Timezone &amp; Working Hours</label>
                  <input
                    type="text"
                    id="fTz"
                    placeholder="e.g. IST (UTC+5:30), 4 hours daily overlap with US EST / CET"
                    value={timezoneOverlap}
                    onChange={(e) => setTimezoneOverlap(e.target.value)}
                  />
                </div>
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label>Key Technical Competencies</label>
                <div className="chip-row">
                  {POPULAR_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className={`chip ${selectedSkills.includes(skill) ? "active" : ""}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {selectedSkills.includes(skill) ? `✓ ${skill}` : skill}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  style={{ marginTop: "10px" }}
                  placeholder="Additional specialized tools (e.g. Supabase, WebGL, Tailwind, GSAP)..."
                  value={customSkills}
                  onChange={(e) => setCustomSkills(e.target.value)}
                />
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label htmlFor="fProjects">2 – 3 Recent Client Deliverables or Live Links *</label>
                <textarea
                  id="fProjects"
                  required
                  rows={3}
                  placeholder="Share live URLs of products you built for clients, your role, and what stack was used."
                  value={clientProjectsLinks}
                  onChange={(e) => setClientProjectsLinks(e.target.value)}
                />
              </div>

              <div className="field field-full" style={{ marginBottom: "18px" }}>
                <label htmlFor="fNote">What types of projects or modules excite you most? *</label>
                <textarea
                  id="fNote"
                  required
                  rows={3}
                  placeholder="e.g. Complex dashboards, design systems, rapid MVPs, high-concurrency Node backends..."
                  value={freelanceNote}
                  onChange={(e) => setFreelanceNote(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="brief-submit" style={{ marginTop: "24px" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: "200px" }}
            >
              {isSubmitting ? "Submitting Application..." : `Submit ${activeTab === "JOB" ? "Job" : activeTab === "INTERNSHIP" ? "Internship" : "Freelance"} Application →`}
            </button>

            {errorMessage && (
              <div className="form-error show">
                {errorMessage}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
