import { prisma } from "@/lib/prisma";
import { Project, projects as initialProjects } from "@/data/projects";
import { unstable_cache, revalidateTag } from "next/cache";
import fs from "fs";
import path from "path";

export interface TrustSlot {
  id: string;
  label: string;
  isHighlighted?: boolean;
}

export interface TrustSectionConfig {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  description: string;
  slots: TrustSlot[];
}

export interface SiteContent {
  trust: TrustSectionConfig;
  projects: Project[];
}

const DEFAULT_TRUST: TrustSectionConfig = {
  enabled: false,
  eyebrow: "Who we've worked with",
  heading: "Nobody yet — and we're not going to fake it.",
  description:
    "We're a young studio. No client logo wall, no invented quotes to look bigger than we are. What we do have is real, shipped work — you've just scrolled past it. If you work with us, your name goes in one of these.",
  slots: [
    {
      id: "slot-1",
      label: "Your logo\ncould go here",
      isHighlighted: true,
    },
    {
      id: "slot-2",
      label: "—",
      isHighlighted: false,
    },
    {
      id: "slot-3",
      label: "—",
      isHighlighted: false,
    },
    {
      id: "slot-4",
      label: "—",
      isHighlighted: false,
    },
  ],
};

const CONTENT_FILE_PATH = path.join(process.cwd(), "data", "site-content.json");

// In-memory cache for instant 0ms responses without repeated DB queries
let cachedSiteContent: { data: SiteContent; timestamp: number } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function getLocalFallback(): SiteContent {
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const raw = fs.readFileSync(CONTENT_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        trust: { ...DEFAULT_TRUST, ...(parsed.trust || {}) },
        projects: parsed.projects || initialProjects,
      };
    }
  } catch {}
  return { trust: DEFAULT_TRUST, projects: initialProjects };
}

function saveLocalFallback(content: SiteContent) {
  try {
    const dir = path.dirname(CONTENT_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(content, null, 2), "utf-8");
  } catch {}
}

export function invalidateContentCache() {
  cachedSiteContent = null;
  try {
    revalidateTag("site-content");
  } catch {}
}

async function fetchSiteContentFromDB(): Promise<SiteContent> {
  try {
    // 1. Fetch Trust config from Postgres
    const trustSetting = await prisma.siteSetting.findUnique({
      where: { key: "trust" },
    });

    // 2. Fetch Projects from Postgres
    const dbProjects = await prisma.project.findMany({
      orderBy: { idx: "asc" },
    });

    const trustConfig: TrustSectionConfig = trustSetting
      ? (trustSetting.value as unknown as TrustSectionConfig)
      : DEFAULT_TRUST;

    const projects: Project[] =
      dbProjects.length > 0
        ? dbProjects.map((p) => ({
            id: p.id,
            slug: p.slug,
            idx: p.idx,
            name: p.name,
            category: p.category as Project["category"],
            oneLiner: p.oneLiner,
            homepageOneLiner: p.homepageOneLiner || undefined,
            result: p.result,
            tags: p.tags,
            status: p.status === "in-progress" ? "in-progress" : undefined,
            mobilePreview: p.mobilePreview || p.oneLiner,
            preview: {
              label: p.previewLabel || p.result,
              svg:
                p.previewSvg ||
                `<svg viewBox="0 0 200 100"><rect x="20" y="20" width="160" height="60" rx="8" fill="#75801F" opacity="0.25"/><text x="100" y="55" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="#75801F">${p.name}</text></svg>`,
            },
            featured: p.featured,
          }))
        : initialProjects;

    const result = { trust: trustConfig, projects };
    saveLocalFallback(result);
    return result;
  } catch (error) {
    console.warn("Falling back to local cache for site content:", (error as Error).message);
    return getLocalFallback();
  }
}

// Next.js ISR Cached Fetcher (tagged for on-demand invalidation)
const getCachedSiteContent = unstable_cache(
  fetchSiteContentFromDB,
  ["site-content"],
  {
    tags: ["site-content"],
    revalidate: 3600,
  }
);

export async function getSiteContent(): Promise<SiteContent> {
  // Check memory cache first (instant 0ms response)
  const now = Date.now();
  if (cachedSiteContent && now - cachedSiteContent.timestamp < CACHE_TTL_MS) {
    return cachedSiteContent.data;
  }

  try {
    const data = await getCachedSiteContent();
    cachedSiteContent = { data, timestamp: now };
    return data;
  } catch {
    const data = await fetchSiteContentFromDB();
    cachedSiteContent = { data, timestamp: now };
    return data;
  }
}

export async function updateTrustConfig(
  updates: Partial<TrustSectionConfig>
): Promise<TrustSectionConfig> {
  try {
    const current = await getSiteContent();
    const updated: TrustSectionConfig = {
      ...current.trust,
      ...updates,
    };

    await prisma.siteSetting.upsert({
      where: { key: "trust" },
      update: { value: updated as any },
      create: { key: "trust", value: updated as any },
    });

    saveLocalFallback({ ...current, trust: updated });
    invalidateContentCache();
    return updated;
  } catch (error) {
    console.warn("Failed to update trust in Postgres, updating local cache:", (error as Error).message);
    const local = getLocalFallback();
    const updated = { ...local.trust, ...updates };
    saveLocalFallback({ ...local, trust: updated });
    invalidateContentCache();
    return updated;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  const content = await getSiteContent();
  return content.projects;
}

export async function createProject(projectData: Omit<Project, "id">): Promise<Project> {
  const slug =
    projectData.slug ||
    projectData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  try {
    const created = await prisma.project.create({
      data: {
        slug,
        idx: projectData.idx,
        name: projectData.name,
        category: projectData.category,
        oneLiner: projectData.oneLiner,
        homepageOneLiner: projectData.homepageOneLiner || null,
        result: projectData.result,
        tags: projectData.tags,
        status: projectData.status || null,
        mobilePreview: projectData.mobilePreview || null,
        previewLabel: projectData.preview?.label || projectData.result,
        previewSvg: projectData.preview?.svg || null,
        featured: projectData.featured ?? true,
      },
    });

    const project: Project = {
      id: created.id,
      slug: created.slug,
      idx: created.idx,
      name: created.name,
      category: created.category as Project["category"],
      oneLiner: created.oneLiner,
      homepageOneLiner: created.homepageOneLiner || undefined,
      result: created.result,
      tags: created.tags,
      status: created.status === "in-progress" ? "in-progress" : undefined,
      mobilePreview: created.mobilePreview || created.oneLiner,
      preview: {
        label: created.previewLabel || created.result,
        svg:
          created.previewSvg ||
          `<svg viewBox="0 0 200 100"><rect x="20" y="20" width="160" height="60" rx="8" fill="#75801F" opacity="0.25"/><text x="100" y="55" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="#75801F">${created.name}</text></svg>`,
      },
      featured: created.featured,
    };

    const current = await getSiteContent();
    saveLocalFallback({ ...current, projects: [...current.projects, project] });
    invalidateContentCache();
    return project;
  } catch (error) {
    console.warn("Failed to create project in Postgres, saving locally:", (error as Error).message);
    const newProj: Project = {
      ...projectData,
      id: slug,
      slug,
    };
    const current = getLocalFallback();
    saveLocalFallback({ ...current, projects: [...current.projects, newProj] });
    invalidateContentCache();
    return newProj;
  }
}

export async function updateProject(
  id: string,
  projectData: Partial<Project>
): Promise<Project | null> {
  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(projectData.name && { name: projectData.name }),
        ...(projectData.category && { category: projectData.category }),
        ...(projectData.oneLiner && { oneLiner: projectData.oneLiner }),
        ...(projectData.homepageOneLiner !== undefined && { homepageOneLiner: projectData.homepageOneLiner }),
        ...(projectData.result && { result: projectData.result }),
        ...(projectData.tags && { tags: projectData.tags }),
        ...(projectData.status !== undefined && { status: projectData.status || null }),
        ...(projectData.mobilePreview !== undefined && { mobilePreview: projectData.mobilePreview }),
        ...(projectData.featured !== undefined && { featured: projectData.featured }),
      },
    });

    const project: Project = {
      id: updated.id,
      slug: updated.slug,
      idx: updated.idx,
      name: updated.name,
      category: updated.category as Project["category"],
      oneLiner: updated.oneLiner,
      homepageOneLiner: updated.homepageOneLiner || undefined,
      result: updated.result,
      tags: updated.tags,
      status: updated.status === "in-progress" ? "in-progress" : undefined,
      mobilePreview: updated.mobilePreview || updated.oneLiner,
      preview: {
        label: updated.previewLabel || updated.result,
        svg:
          updated.previewSvg ||
          `<svg viewBox="0 0 200 100"><rect x="20" y="20" width="160" height="60" rx="8" fill="#75801F" opacity="0.25"/><text x="100" y="55" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="#75801F">${updated.name}</text></svg>`,
      },
      featured: updated.featured,
    };

    invalidateContentCache();
    return project;
  } catch (error) {
    console.warn("Failed to update project in Postgres, updating local fallback:", (error as Error).message);
    const local = getLocalFallback();
    const index = local.projects.findIndex((p) => p.id === id || p.slug === id);
    if (index !== -1) {
      local.projects[index] = { ...local.projects[index], ...projectData };
      saveLocalFallback(local);
      invalidateContentCache();
      return local.projects[index];
    }
    return null;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({
      where: { id },
    });
    invalidateContentCache();
    return true;
  } catch (error) {
    try {
      await prisma.project.delete({
        where: { slug: id },
      });
      invalidateContentCache();
      return true;
    } catch {
      console.warn("Failed to delete project in Postgres, removing from local fallback");
      const local = getLocalFallback();
      const prev = local.projects.length;
      local.projects = local.projects.filter((p) => p.id !== id && p.slug !== id);
      if (local.projects.length !== prev) {
        saveLocalFallback(local);
        invalidateContentCache();
        return true;
      }
      return false;
    }
  }
}
