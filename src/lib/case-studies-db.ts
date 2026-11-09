import {
  prisma,
  withDatabaseTimeout,
  withDatabaseRetry,
  isRealDatabaseConfigured,
} from "@/lib/prisma";
import staticCaseStudiesData from "../../data/case-studies.json";

export interface CaseStudyRecord {
  id: string;
  name: string;
  category: string;
  oneLiner: string;
  resultStat: string;
  briefDescription: string;
  tags: string[];
  liveUrl: string | null;
  version1Url?: string | null;
  version2Url?: string | null;
  status: string; // "live" | "in-progress"
  featured: boolean;
  displayOrder: number;
  photos?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// In-memory cache with bounded 5-minute TTL for public case studies
// Multi-Isolate Cache Semantics:
// 1. Scope: In-memory cache lives within the active Cloudflare Worker isolate.
// 2. Admin Invalidation: Admin mutations clear the local isolate cache and trigger revalidatePath().
// 3. Global Convergence: Other edge isolates converge to live PostgreSQL data within at most CACHE_TTL_MS (5 min).
// 4. Data Isolation: Public data only. Private client, financial, or authentication data is NEVER stored here.
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedCaseStudies: { data: CaseStudyRecord[]; timestamp: number } | null = null;
let inFlightCaseStudiesPromise: Promise<CaseStudyRecord[]> | null = null;

function getLocalStaticFallback(): CaseStudyRecord[] {
  return (staticCaseStudiesData as unknown as CaseStudyRecord[]) || [];
}

export function invalidateCaseStudiesCache() {
  cachedCaseStudies = null;
  inFlightCaseStudiesPromise = null;
}

export async function getCaseStudies(): Promise<CaseStudyRecord[]> {
  const now = Date.now();
  if (cachedCaseStudies && now - cachedCaseStudies.timestamp < CACHE_TTL_MS) {
    return cachedCaseStudies.data;
  }

  // Fast-path: If database is not configured, return static bundled data
  if (!isRealDatabaseConfigured()) {
    const fallback = getLocalStaticFallback();
    cachedCaseStudies = { data: fallback, timestamp: now };
    return fallback;
  }

  // Cache stampede prevention: reuse in-flight promise across concurrent requests
  if (inFlightCaseStudiesPromise) {
    return inFlightCaseStudiesPromise;
  }

  inFlightCaseStudiesPromise = (async () => {
    try {
      const items = await withDatabaseRetry(
        async () => {
          return await withDatabaseTimeout(
            prisma.caseStudy.findMany({
              orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            }),
            6000,
            "getCaseStudies"
          );
        },
        { isIdempotent: true, operationName: "getCaseStudies" }
      );

      const localFallbackItems = getLocalStaticFallback();
      const formatted: CaseStudyRecord[] = items.map((item: any) => {
        const fallbackItem = localFallbackItems.find(
          (f) => f.name.toLowerCase() === item.name.toLowerCase()
        );
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          oneLiner: item.oneLiner,
          resultStat: item.resultStat,
          briefDescription: item.briefDescription,
          tags: item.tags || [],
          liveUrl: item.liveUrl || null,
          status: item.status || "live",
          featured: Boolean(item.featured),
          displayOrder: item.displayOrder ?? 0,
          photos: item.photos || fallbackItem?.photos,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });

      cachedCaseStudies = { data: formatted, timestamp: Date.now() };
      return formatted;
    } catch (error: any) {
      console.warn("[CaseStudy] Database read unavailable, falling back to static bundled case studies:", error.message);
      const fallback = getLocalStaticFallback();
      cachedCaseStudies = { data: fallback, timestamp: Date.now() - (CACHE_TTL_MS - 30_000) };
      return fallback;
    } finally {
      inFlightCaseStudiesPromise = null;
    }
  })();

  return inFlightCaseStudiesPromise;
}

export async function getFeaturedCaseStudies(): Promise<CaseStudyRecord[]> {
  const all = await getCaseStudies();
  return all.filter((item) => item.featured);
}

export async function getCaseStudyById(id: string): Promise<CaseStudyRecord | null> {
  try {
    const item = await withDatabaseTimeout(
      prisma.caseStudy.findUnique({
        where: { id },
      }),
      6000,
      "getCaseStudyById"
    );

    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      oneLiner: item.oneLiner,
      resultStat: item.resultStat,
      briefDescription: item.briefDescription,
      tags: item.tags || [],
      liveUrl: item.liveUrl || null,
      status: item.status || "live",
      featured: Boolean(item.featured),
      displayOrder: item.displayOrder ?? 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  } catch {
    const all = await getCaseStudies();
    return all.find((item) => item.id === id) || null;
  }
}

export async function createCaseStudy(
  data: Omit<CaseStudyRecord, "id" | "createdAt" | "updatedAt">
): Promise<CaseStudyRecord> {
  try {
    const created = await withDatabaseTimeout(
      prisma.caseStudy.create({
        data: {
          name: data.name.trim(),
          category: data.category.trim(),
          oneLiner: data.oneLiner.trim(),
          resultStat: data.resultStat.trim(),
          briefDescription: data.briefDescription.trim(),
          tags: data.tags || [],
          liveUrl: data.liveUrl || null,
          status: data.status || "live",
          featured: Boolean(data.featured),
          displayOrder: Number(data.displayOrder) || 0,
        },
      }),
      10000,
      "createCaseStudy"
    );

    invalidateCaseStudiesCache();

    return {
      id: created.id,
      name: created.name,
      category: created.category,
      oneLiner: created.oneLiner,
      resultStat: created.resultStat,
      briefDescription: created.briefDescription,
      tags: created.tags,
      liveUrl: created.liveUrl,
      status: created.status,
      featured: created.featured,
      displayOrder: created.displayOrder,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  } catch (error: any) {
    console.error("[Database Error] Failed to create case study in PostgreSQL:", error.message);
    throw new Error("Failed to create case study. Database write could not be confirmed.");
  }
}

export async function updateCaseStudy(
  id: string,
  data: Partial<Omit<CaseStudyRecord, "id" | "createdAt" | "updatedAt">>
): Promise<CaseStudyRecord | null> {
  try {
    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.category !== undefined) updatePayload.category = data.category.trim();
    if (data.oneLiner !== undefined) updatePayload.oneLiner = data.oneLiner.trim();
    if (data.resultStat !== undefined) updatePayload.resultStat = data.resultStat.trim();
    if (data.briefDescription !== undefined) updatePayload.briefDescription = data.briefDescription.trim();
    if (data.tags !== undefined) updatePayload.tags = data.tags;
    if (data.liveUrl !== undefined) updatePayload.liveUrl = data.liveUrl || null;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
    if (data.displayOrder !== undefined) updatePayload.displayOrder = Number(data.displayOrder);

    const updated = await withDatabaseTimeout(
      prisma.caseStudy.update({
        where: { id },
        data: updatePayload,
      }),
      10000,
      "updateCaseStudy"
    );

    invalidateCaseStudiesCache();

    return {
      id: updated.id,
      name: updated.name,
      category: updated.category,
      oneLiner: updated.oneLiner,
      resultStat: updated.resultStat,
      briefDescription: updated.briefDescription,
      tags: updated.tags,
      liveUrl: updated.liveUrl,
      status: updated.status,
      featured: updated.featured,
      displayOrder: updated.displayOrder,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (error: any) {
    if (error?.code === "P2025") {
      return null;
    }
    console.error("[Database Error] Failed to update case study in PostgreSQL:", error.message);
    throw new Error("Failed to update case study. Database write could not be confirmed.");
  }
}

export async function deleteCaseStudy(id: string): Promise<boolean> {
  try {
    await withDatabaseTimeout(
      prisma.caseStudy.delete({
        where: { id },
      }),
      8000,
      "deleteCaseStudy"
    );
    invalidateCaseStudiesCache();
    return true;
  } catch (err: any) {
    if (err?.code === "P2025") {
      return false;
    }
    console.error("[Database Error] Failed to delete case study in PostgreSQL:", err.message);
    throw new Error("Failed to delete case study. Database delete could not be confirmed.");
  }
}
