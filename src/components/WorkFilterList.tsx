"use client";

import { useState } from "react";
import { Project, ProjectCategory } from "@/data/projects";

interface WorkFilterListProps {
  initialProjects?: Project[];
  initialFilter?: string;
}

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Product", value: "product" },
  { label: "Trading & fintech", value: "trading" },
  { label: "Insurtech", value: "insurtech" },
  { label: "In progress", value: "in-progress" },
];

export default function WorkFilterList({
  initialProjects = [],
  initialFilter = "all",
}: WorkFilterListProps) {
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [openSlugs, setOpenSlugs] = useState<Record<string, boolean>>({});

  const toggleRowOpen = (slug: string) => {
    setOpenSlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const filteredProjects = initialProjects.filter((project) => {
    if (activeFilter === "all") return true;
    return project.category === (activeFilter as ProjectCategory);
  });

  return (
    <>
      <div className="filters reveal" role="tablist" aria-label="Filter projects by category">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={activeFilter === f.value}
            className={`chip ${activeFilter === f.value ? "active" : ""}`}
            data-filter={f.value}
            onClick={() => setActiveFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="work-list reveal" aria-label="Projects list">
        <div className="wrap">
          {filteredProjects.map((project: Project) => {
            const isOpen = !!openSlugs[project.slug];
            return (
              <div
                key={project.id}
                className={`work-row ${isOpen ? "open" : ""}`}
                data-cat={project.category}
                data-preview={project.slug}
                tabIndex={0}
                role="button"
                aria-expanded={isOpen}
                aria-label={`Project ${project.name}: ${project.oneLiner}`}
                onClick={() => toggleRowOpen(project.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleRowOpen(project.slug);
                  }
                }}
              >
                <div className="idx" aria-hidden="true">{project.idx}</div>
                <div>
                  <div className="wname">
                    {project.name}
                    {project.status === "in-progress" && (
                      <span className="status-pill">In progress</span>
                    )}
                  </div>
                  <div className="wline">{project.oneLiner}</div>
                  <div className="tags-row" aria-label="Tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mobile-preview" aria-hidden={!isOpen}>
                    <p>{project.mobilePreview || project.oneLiner}</p>
                  </div>
                </div>
                <div className="wresult">{project.result}</div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
