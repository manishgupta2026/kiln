"use client";

import { useState } from "react";
import Link from "next/link";
import { CaseStudyRecord } from "@/lib/case-studies-db";
import CaseStudyModal from "@/components/CaseStudyModal";
import FullScreenPhotoViewer from "@/components/FullScreenPhotoViewer";
import ProjectCard, { WORK_PROJECTS } from "@/components/ProjectCard";

interface HomepageWorkProps {
  initialCaseStudies?: CaseStudyRecord[];
  initialProjects?: any[];
}

export default function HomepageWork({
  initialCaseStudies,
}: HomepageWorkProps) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<any | null>(null);
  const [selectedPhotosProject, setSelectedPhotosProject] = useState<any | null>(null);

  // Merge database fields with local rich card metrics and mockups
  const projectsToDisplay = WORK_PROJECTS.map((wp) => {
    const match = (initialCaseStudies || []).find(
      (cs) => cs.name.toLowerCase() === wp.name.toLowerCase()
    );
    const resolvedLiveUrl = match !== undefined ? match.liveUrl : wp.liveUrl;
    return {
      ...wp,
      liveUrl: resolvedLiveUrl,
      version1Url: (match as any)?.version1Url || (wp as any).version1Url,
      version2Url: (match as any)?.version2Url || (wp as any).version2Url,
      briefDescription: match?.briefDescription || wp.briefDescription,
      resultStat: match?.resultStat || (wp as any).resultStat,
      photos: (match as any)?.photos || (wp as any).photos || [],
    };
  });

  // Showcase top 3 on landing page
  const featuredProjects = projectsToDisplay.slice(0, 3);

  return (
    <section className="work" id="work" aria-labelledby="work-heading">
      <div className="wrap">
        <div className="section-label reveal" id="work-heading">
          Work we are proud of
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
              onOpenPhotos={(p) => setSelectedPhotosProject(p)}
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

      <FullScreenPhotoViewer
        isOpen={!!selectedPhotosProject}
        projectName={selectedPhotosProject?.name || ""}
        photos={selectedPhotosProject?.photos || []}
        onClose={() => setSelectedPhotosProject(null)}
      />
    </section>
  );
}
