"use client";

import { useState, useMemo } from "react";
import { CaseStudyRecord } from "@/lib/case-studies-db";
import CaseStudyModal from "@/components/CaseStudyModal";
import ProjectCard, { WORK_PROJECTS } from "@/components/ProjectCard";

interface WorkFilterListProps {
  initialCaseStudies?: CaseStudyRecord[];
  initialProjects?: any[];
  initialFilter?: string;
}

export default function WorkFilterList({
  initialCaseStudies,
  initialFilter = "all",
}: WorkFilterListProps) {
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<any | null>(null);

  // Map to rich project card structures
  const allProjects = useMemo(() => {
    return WORK_PROJECTS.map((wp) => {
      const match = (initialCaseStudies || []).find(
        (cs) => cs.name.toLowerCase() === wp.name.toLowerCase()
      );
      return {
        ...wp,
        liveUrl: match?.liveUrl || wp.liveUrl,
        briefDescription: match?.briefDescription || wp.briefDescription,
      };
    });
  }, [initialCaseStudies]);

  const distinctCategories = useMemo(() => {
    const cats = new Set<string>();
    allProjects.forEach((p) => {
      if (p.category) cats.add(p.category.trim());
    });
    return Array.from(cats);
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((item) => {
      if (activeFilter === "all") return true;
      return item.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
             activeFilter.toLowerCase().includes(item.category.toLowerCase());
    });
  }, [allProjects, activeFilter]);

  return (
    <>
      <div className="filters reveal" role="tablist" aria-label="Filter case studies by category">
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "all"}
          className={`chip ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All
        </button>

        {distinctCategories.map((cat) => {
          const isActive = activeFilter.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`chip ${isActive ? "active" : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="work-grid reveal" aria-label="Case studies archive">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            study={project}
            onOpenCaseStudy={(p) => setSelectedCaseStudy(p)}
          />
        ))}
      </div>

      <CaseStudyModal
        caseStudy={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
      />
    </>
  );
}
