"use client";

import { useState } from "react";
import Link from "next/link";
import { Project } from "@/data/projects";

interface HomepageWorkProps {
  initialProjects?: Project[];
}

export default function HomepageWork({ initialProjects = [] }: HomepageWorkProps) {
  const [openSlugs, setOpenSlugs] = useState<Record<string, boolean>>({});

  const featuredProjects = initialProjects.filter((p) => p.featured);

  const toggleRow = (slug: string) => {
    setOpenSlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  return (
    <section className="work" id="work" aria-labelledby="work-heading">
      <div className="wrap">
        <div className="section-label reveal" id="work-heading">
          What we&apos;ve shipped
        </div>
        <h2 className="section-title reveal">
          Real products. Real numbers. Hover a row, or tap it.
        </h2>

        <div className="work-list reveal" role="feed" aria-label="Featured projects">
          {featuredProjects.map((project) => {
            const isOpen = !!openSlugs[project.slug];
            return (
              <div
                key={project.id}
                className={`work-row ${isOpen ? "open" : ""}`}
                data-preview={project.slug}
                tabIndex={0}
                role="button"
                aria-expanded={isOpen}
                aria-label={`Project ${project.name}: ${project.homepageOneLiner || project.oneLiner}`}
                onClick={() => toggleRow(project.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleRow(project.slug);
                  }
                }}
              >
                <div className="idx" aria-hidden="true">{project.idx}</div>
                <div>
                  <div className="wname">{project.name}</div>
                  <div className="wline">{project.homepageOneLiner || project.oneLiner}</div>
                  <div className="mobile-preview" aria-hidden={!isOpen}>
                    <p style={{ marginBottom: "8px" }}>{project.mobilePreview || project.oneLiner}</p>
                    <div className="tags-row">
                      {project.tags.map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="wresult">{project.result}</div>
              </div>
            );
          })}
        </div>

        <div className="view-all reveal">
          <Link href="/work" aria-label="View all shipped projects archive">
            View all work →
          </Link>
        </div>
      </div>
    </section>
  );
}
