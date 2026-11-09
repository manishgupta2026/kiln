import {
  prisma,
  withDatabaseTimeout,
  withDatabaseRetry,
  isRealDatabaseConfigured,
} from "@/lib/prisma";
import { Project, projects as initialProjects } from "@/data/projects";
import staticContentData from "../../data/content.json";

export interface TrustSlot {
  id: string;
  label: string;
  isHighlighted?: boolean;
  logo?: string | null;
  bgStyle?: "clear" | "white" | "mint" | "default";
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

export interface DbProjectRecord {
  id: string;
  slug: string;
  idx: string;
  name: string;
  category: string;
  oneLiner: string;
  homepageOneLiner?: string | null;
  result: string;
  tags: string[];
  status?: string | null;
  mobilePreview?: string | null;
  previewLabel?: string | null;
  previewSvg?: string | null;
  featured: boolean;
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

// In-memory cache with bounded 5-minute TTL for public showcase content
// Multi-Isolate Cache Semantics:
// 1. Scope: In-memory cache lives within the active Cloudflare Worker isolate.
// 2. Admin Invalidation: Admin mutations clear the local isolate cache and trigger revalidatePath().
// 3. Global Convergence: Other edge isolates converge to live PostgreSQL data within at most CACHE_TTL_MS (5 min).
// 4. Data Isolation: Public data only. Private client, financial, or authentication data is NEVER stored here.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedSiteContent: { data: SiteContent; timestamp: number } | null = null;
let inFlightContentPromise: Promise<SiteContent> | null = null;

function getLocalStaticFallback(): SiteContent {
  try {
    if (
      staticContentData &&
      typeof staticContentData === "object" &&
      "trust" in staticContentData &&
      "projects" in staticContentData
    ) {
      return staticContentData as unknown as SiteContent;
    }
  } catch {
    // If static bundled json structure differs, return compile-time defaults
  }
  return { trust: DEFAULT_TRUST, projects: initialProjects };
}

export function invalidateContentCache() {
  cachedSiteContent = null;
  inFlightContentPromise = null;
}

export async function getSiteContent(): Promise<SiteContent> {
  const now = Date.now();
  if (cachedSiteContent && now - cachedSiteContent.timestamp < CACHE_TTL_MS) {
    return cachedSiteContent.data;
  }

  // Fast-path: If database is not configured, return bundled static data
  if (!isRealDatabaseConfigured()) {
    const fallback = getLocalStaticFallback();
    cachedSiteContent = { data: fallback, timestamp: now };
    return fallback;
  }

  // Cache stampede prevention: reuse in-flight promise if multiple concurrent requests arrive
  if (inFlightContentPromise) {
    return inFlightContentPromise;
  }

  inFlightContentPromise = (async () => {
    try {
      const content = await withDatabaseRetry(
        async () => {
          const trustQuery = prisma.siteSetting.findUnique({
            where: { key: "trust" },
          });
          const dbProjectsQuery = prisma.showcaseProject.findMany({
            orderBy: { idx: "asc" },
          });

          const [trustSetting, dbProjects] = await withDatabaseTimeout(
            Promise.all([trustQuery, dbProjectsQuery]),
            6000,
            "getSiteContent"
          );

          const trustConfig: TrustSectionConfig = trustSetting
            ? (trustSetting.value as unknown as TrustSectionConfig)
            : DEFAULT_TRUST;

          const projects: Project[] =
            dbProjects && dbProjects.length > 0
              ? dbProjects.map((p: DbProjectRecord) => ({
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

          return { trust: trustConfig, projects };
        },
        { isIdempotent: true, operationName: "getSiteContent" }
      );

      cachedSiteContent = { data: content, timestamp: Date.now() };
      return content;
    } catch (error: any) {
      console.warn("[SiteContent] Database read unavailable, falling back to static bundled content:", error.message);
      const fallback = getLocalStaticFallback();
      // Cache fallback briefly (30s) during transient downtime to avoid hammering the database
      cachedSiteContent = { data: fallback, timestamp: Date.now() - (CACHE_TTL_MS - 30_000) };
      return fallback;
    } finally {
      inFlightContentPromise = null;
    }
  })();

  return inFlightContentPromise;
}

export async function updateTrustConfig(
  updates: Partial<TrustSectionConfig>
): Promise<TrustSectionConfig> {
  const current = await getSiteContent();
  const updated: TrustSectionConfig = {
    ...current.trust,
    ...updates,
  };

  try {
    await withDatabaseTimeout(
      prisma.siteSetting.upsert({
        where: { key: "trust" },
        update: { value: JSON.parse(JSON.stringify(updated)) },
        create: { key: "trust", value: JSON.parse(JSON.stringify(updated)) },
      }),
      8000,
      "updateTrustConfig"
    );

    invalidateContentCache();
    return updated;
  } catch (error: any) {
    console.error("[Database Error] Failed to update trust settings in PostgreSQL:", error.message);
    throw new Error("Failed to update trust settings. Database write could not be confirmed.");
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
    const created: DbProjectRecord = await withDatabaseTimeout(
      prisma.showcaseProject.create({
        data: {
          slug,
          idx: projectData.idx,
          name: projectData.name.trim(),
          category: projectData.category,
          oneLiner: projectData.oneLiner.trim(),
          homepageOneLiner: projectData.homepageOneLiner || null,
          result: projectData.result.trim(),
          tags: projectData.tags,
          status: projectData.status || null,
          mobilePreview: projectData.mobilePreview || null,
          previewLabel: projectData.preview?.label || projectData.result,
          previewSvg: projectData.preview?.svg || null,
          featured: projectData.featured ?? true,
        },
      }),
      10000,
      "createProject"
    );

    invalidateContentCache();

    return {
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
  } catch (error: any) {
    console.error("[Database Error] Failed to create showcase project in PostgreSQL:", error.message);
    throw new Error("Failed to create project. Database write could not be confirmed.");
  }
}

export async function updateProject(
  id: string,
  projectData: Partial<Project>
): Promise<Project | null> {
  try {
    const updated: DbProjectRecord = await withDatabaseTimeout(
      prisma.showcaseProject.update({
        where: { id },
        data: {
          ...(projectData.name && { name: projectData.name.trim() }),
          ...(projectData.category && { category: projectData.category }),
          ...(projectData.oneLiner && { oneLiner: projectData.oneLiner.trim() }),
          ...(projectData.homepageOneLiner !== undefined && { homepageOneLiner: projectData.homepageOneLiner }),
          ...(projectData.result && { result: projectData.result.trim() }),
          ...(projectData.tags && { tags: projectData.tags }),
          ...(projectData.status !== undefined && { status: projectData.status || null }),
          ...(projectData.mobilePreview !== undefined && { mobilePreview: projectData.mobilePreview }),
          ...(projectData.featured !== undefined && { featured: projectData.featured }),
        },
      }),
      10000,
      "updateProject"
    );

    invalidateContentCache();

    return {
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
  } catch (error: any) {
    if (error?.code === "P2025") {
      return null;
    }
    console.error("[Database Error] Failed to update showcase project in PostgreSQL:", error.message);
    throw new Error("Failed to update project. Database write could not be confirmed.");
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await withDatabaseTimeout(
      prisma.showcaseProject.delete({
        where: { id },
      }),
      8000,
      "deleteProject"
    );
    invalidateContentCache();
    return true;
  } catch (error: any) {
    if (error?.code === "P2025") {
      return false;
    }
    console.error("[Database Error] Failed to delete showcase project in PostgreSQL:", error.message);
    throw new Error("Failed to delete project. Database delete could not be confirmed.");
  }
}
