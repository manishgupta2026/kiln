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
      briefDescription: match?.briefDescription || wp.briefDescription,
    };
  });

  return (
    <section className="work" id="work" aria-labelledby="work-heading">
      <div className="wrap">
        <div className="section-label reveal" id="work-heading">
          What we&apos;ve shipped
        </div>
        <h2 className="section-title reveal">
          Real products. Real numbers. Tap any project to see the receipts.
        </h2>

        {/* 2x2 Rich Project Cards Grid */}
        <div className="work-grid reveal" role="feed" aria-label="Featured projects">
          {projectsToDisplay.map((project) => (
            <ProjectCard
              key={project.id}
              study={project}
              onOpenCaseStudy={(p) => setSelectedCaseStudy(p)}
            />
          ))}
        </div>

        <div className="view-all reveal">
          <Link href="/work" aria-label="View all shipped projects archive">
            View all work →
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
