import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export interface CaseStudyRecord {
  id: string;
  name: string;
  category: string;
  oneLiner: string;
  resultStat: string;
  briefDescription: string;
  tags: string[];
  liveUrl: string | null;
  status: string; // "live" | "in-progress"
  featured: boolean;
  displayOrder: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const CACHE_FILE_PATH = path.join(process.cwd(), "data", "case-studies.json");
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

let cachedCaseStudies: { data: CaseStudyRecord[]; timestamp: number } | null = null;

function getLocalFallback(): CaseStudyRecord[] {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const fileData = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Failed to read local case-studies fallback:", err);
  }
  return [];
}

function saveLocalFallback(items: CaseStudyRecord[]) {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch {
    // Silently ignore in read-only environments
  }
}

export function invalidateCaseStudiesCache() {
  cachedCaseStudies = null;
}

export async function getCaseStudies(): Promise<CaseStudyRecord[]> {
  const now = Date.now();
  if (cachedCaseStudies && now - cachedCaseStudies.timestamp < CACHE_TTL_MS) {
    return cachedCaseStudies.data;
  }

  try {
    const items = await prisma.caseStudy.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    const formatted: CaseStudyRecord[] = items.map((item: any) => ({
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
    }));

    cachedCaseStudies = { data: formatted, timestamp: now };
    saveLocalFallback(formatted);
    return formatted;
  } catch (error) {
    console.warn("Using local cache for case studies:", (error as Error).message);
    const fallback = getLocalFallback();
    cachedCaseStudies = { data: fallback, timestamp: now };
    return fallback;
  }
}

export async function getFeaturedCaseStudies(): Promise<CaseStudyRecord[]> {
  const all = await getCaseStudies();
  return all.filter((item) => item.featured);
}

export async function getCaseStudyById(id: string): Promise<CaseStudyRecord | null> {
  try {
    const item = await prisma.caseStudy.findUnique({
      where: { id },
    });
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
  const created = await prisma.caseStudy.create({
    data: {
      name: data.name,
      category: data.category,
      oneLiner: data.oneLiner,
      resultStat: data.resultStat,
      briefDescription: data.briefDescription,
      tags: data.tags || [],
      liveUrl: data.liveUrl || null,
      status: data.status || "live",
      featured: Boolean(data.featured),
      displayOrder: Number(data.displayOrder) || 0,
    },
  });

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
}

export async function updateCaseStudy(
  id: string,
  data: Partial<Omit<CaseStudyRecord, "id" | "createdAt" | "updatedAt">>
): Promise<CaseStudyRecord | null> {
  const updatePayload: any = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.oneLiner !== undefined) updatePayload.oneLiner = data.oneLiner;
  if (data.resultStat !== undefined) updatePayload.resultStat = data.resultStat;
  if (data.briefDescription !== undefined) updatePayload.briefDescription = data.briefDescription;
  if (data.tags !== undefined) updatePayload.tags = data.tags;
  if (data.liveUrl !== undefined) updatePayload.liveUrl = data.liveUrl || null;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
  if (data.displayOrder !== undefined) updatePayload.displayOrder = Number(data.displayOrder);

  const updated = await prisma.caseStudy.update({
    where: { id },
    data: updatePayload,
  });

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
}

export async function deleteCaseStudy(id: string): Promise<boolean> {
  try {
    await prisma.caseStudy.delete({
      where: { id },
    });
    invalidateCaseStudiesCache();
    return true;
  } catch (err) {
    console.error("Failed to delete case study:", err);
    return false;
  }
}
