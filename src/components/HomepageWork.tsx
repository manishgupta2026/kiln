"use client";

import { useState } from "react";
import Link from "next/link";
import { CaseStudyRecord } from "@/lib/case-studies-db";
import CaseStudyModal from "@/components/CaseStudyModal";
import ProjectCard, { WORK_PROJECTS } from "@/components/ProjectCard";

interface HomepageWorkProps {
  initialCaseStudies?: CaseStudyRecord[];
  initialProjects?: any[];
}

export default function HomepageWork({
  initialCaseStudies,
}: HomepageWorkProps) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<any | null>(null);

  // Merge database fields with local rich card metrics and mockups
  const projectsToDisplay = WORK_PROJECTS.map((wp) => {
    const match = (initialCaseStudies || []).find(
      (cs) => cs.name.toLowerCase() === wp.name.toLowerCase()
    );
    return {
      ...wp,
      liveUrl: match?.liveUrl || wp.liveUrl,
      version1Url: (match as any)?.version1Url || (wp as any).version1Url,
      version2Url: (match as any)?.version2Url || (wp as any).version2Url,
      briefDescription: match?.briefDescription || wp.briefDescription,
      resultStat: match?.resultStat || (wp as any).resultStat,
    };
  });

  // Showcase top 3 on landing page
  const featuredProjects = projectsToDisplay.slice(0, 3);

  return (
    <section className="work" id="work" aria-labelledby="work-heading">
      <div className="wrap">
        <div className="section-label reveal" id="work-heading">
          What we&apos;ve shipped
        </div>
        <h2 className="section-title reveal">
          Take a look at what we&apos;ve built.
        </h2>

        {/* Top 3 Featured Projects Showcase in One Row */}
        <div className="work-grid landing-row reveal" role="feed" aria-label="Featured projects">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              study={project}
              onOpenCaseStudy={(p) => setSelectedCaseStudy(p)}
            />
          ))}
        </div>

        <div className="view-all reveal">
          <Link href="/work" aria-label="View all shipped projects archive">
            View all work ({projectsToDisplay.length} projects) →
          </Link>
        </div>
      </div>

      <CaseStudyModal
        caseStudy={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
      />
    </section>
  );
}
