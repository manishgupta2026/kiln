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
    <section className="work" id="work">
      <div className="wrap">
        <div className="section-label reveal">What we&apos;ve shipped</div>
        <h2 className="section-title reveal">Real products. Real numbers. Hover a row, or tap it.</h2>

        <div className="work-list">
          {featuredProjects.map((project) => {
            const isOpen = !!openSlugs[project.slug];
            return (
              <div
                key={project.id}
                className={`work-row reveal ${isOpen ? "open" : ""}`}
                data-preview={project.slug}
                onClick={() => toggleRow(project.slug)}
              >
                <div className="idx">{project.idx}</div>
                <div>
                  <div className="wname">{project.name}</div>
                  <div className="wline">{project.homepageOneLiner || project.oneLiner}</div>
                  <div className="mobile-preview">{project.mobilePreview}</div>
                </div>
                <div className="wresult">{project.result}</div>
              </div>
            );
          })}
        </div>

        <div className="view-all reveal">
          <Link href="/work">View all work →</Link>
        </div>
      </div>
    </section>
  );
}
