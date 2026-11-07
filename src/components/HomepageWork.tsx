"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CaseStudyRecord } from "@/lib/case-studies-db";
import ProjectCard, { WORK_PROJECTS } from "@/components/ProjectCard";

// Code-split modals so their markup and logic load on demand when opened
const CaseStudyModal = dynamic(() => import("@/components/CaseStudyModal"), {
  ssr: false,
});
const FullScreenPhotoViewer = dynamic(
  () => import("@/components/FullScreenPhotoViewer"),
  { ssr: false }
);

interface HomepageWorkProps {
  initialCaseStudies?: CaseStudyRecord[];
  initialProjects?: any[];
}

export default function HomepageWork({
  initialCaseStudies,
}: HomepageWorkProps) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<any | null>(null);
  const [selectedPhotosProject, setSelectedPhotosProject] = useState<any | null>(null);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState<number>(0);

  const handleOpenCaseStudy = useCallback((p: any) => {
    setSelectedCaseStudy(p);
  }, []);

  const handleCloseCaseStudy = useCallback(() => {
    setSelectedCaseStudy(null);
  }, []);

  const handleOpenPhotos = useCallback((p: any, index: number = 0) => {
    setSelectedPhotosProject(p);
    setInitialPhotoIndex(index);
  }, []);

  const handleClosePhotos = useCallback(() => {
    setSelectedPhotosProject(null);
    setInitialPhotoIndex(0);
  }, []);

  // Merge database fields with local rich card metrics and mockups (memoized)
  const projectsToDisplay = useMemo(() => {
    return WORK_PROJECTS.map((wp) => {
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
        photos:
          (match as any)?.photos && (match as any).photos.length > 0
            ? (match as any).photos
            : (wp.photos || []),
      };
    });
  }, [initialCaseStudies]);

  // Showcase top 3 on landing page (memoized)
  const featuredProjects = useMemo(
    () => projectsToDisplay.slice(0, 3),
    [projectsToDisplay]
  );

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
              onOpenCaseStudy={handleOpenCaseStudy}
              onOpenPhotos={handleOpenPhotos}
            />
          ))}
        </div>

        <div className="view-all reveal">
          <Link href="/work" aria-label="View all shipped projects archive">
            View all work ({projectsToDisplay.length} projects) →
          </Link>
        </div>
      </div>

      {selectedCaseStudy && (
        <CaseStudyModal
          caseStudy={selectedCaseStudy}
          onClose={handleCloseCaseStudy}
          onOpenPhotos={(study, initialIndex) => {
            handleCloseCaseStudy();
            handleOpenPhotos(study, initialIndex || 0);
          }}
        />
      )}

      {selectedPhotosProject && (
        <FullScreenPhotoViewer
          isOpen={!!selectedPhotosProject}
          projectName={selectedPhotosProject?.name || ""}
          photos={selectedPhotosProject?.photos || []}
          initialIndex={initialPhotoIndex}
          onClose={handleClosePhotos}
        />
      )}
    </section>
  );
}
