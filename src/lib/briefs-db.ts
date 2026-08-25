import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export interface BriefRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  projectType: string;
  budget: string | null;
  description: string;
  status: "new" | "read" | "call_scheduled" | "call_completed" | "converted" | "archived";
  callScheduledAt?: string | null;
  callMeetingUrl?: string | null;
  callNotes?: string | null;
  createdAt: string;
  project?: { id: string; name: string; phase: string; status: string } | null;
}

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "briefs.json");

function ensureLocalStore(): BriefRecord[] {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalStore(briefs: BriefRecord[]) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(briefs, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to local briefs fallback:", err);
  }
}

export async function createBrief(data: {
  name: string;
  email: string;
  phone?: string | null;
  projectType: string;
  budget?: string | null;
  description: string;
}): Promise<BriefRecord> {
  try {
    // Try Prisma (PostgreSQL / Neon)
    const result = await prisma.brief.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        projectType: data.projectType,
        budget: data.budget || null,
        description: data.description,
        status: "new",
      },
    });

    return {
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      projectType: result.projectType,
      budget: result.budget,
      description: result.description,
      status: result.status as BriefRecord["status"],
      createdAt: result.createdAt.toISOString(),
    };
  } catch (dbError) {
    console.warn(
      "[Database Warning] PostgreSQL unreachable via Prisma. Falling back to local data store for development. Error:",
      (dbError as Error).message
    );

    // Fallback for local development when Postgres is not running
    const briefs = ensureLocalStore();
    const newBrief: BriefRecord = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      projectType: data.projectType,
      budget: data.budget || null,
      description: data.description,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    briefs.unshift(newBrief);
    writeLocalStore(briefs);
    return newBrief;
  }
}

export async function getAllBriefs(): Promise<BriefRecord[]> {
  try {
    const records = await prisma.brief.findMany({
      include: {
        project: {
          select: { id: true, name: true, phase: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      projectType: r.projectType,
      budget: r.budget,
      description: r.description,
      status: r.status as BriefRecord["status"],
      callScheduledAt: r.callScheduledAt ? r.callScheduledAt.toISOString() : null,
      callMeetingUrl: r.callMeetingUrl,
      callNotes: r.callNotes,
      createdAt: r.createdAt.toISOString(),
      project: r.project,
    }));
  } catch (dbError) {
    console.warn(
      "[Database Warning] PostgreSQL unreachable via Prisma. Falling back to local data store for development. Error:",
      (dbError as Error).message
    );

    const briefs = ensureLocalStore();
    return briefs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export async function getBriefById(id: string): Promise<BriefRecord | null> {
  try {
    const r = await prisma.brief.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, phase: true, status: true },
        },
      },
    });

    if (!r) return null;

    return {
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      projectType: r.projectType,
      budget: r.budget,
      description: r.description,
      status: r.status as BriefRecord["status"],
      callScheduledAt: r.callScheduledAt ? r.callScheduledAt.toISOString() : null,
      callMeetingUrl: r.callMeetingUrl,
      callNotes: r.callNotes,
      createdAt: r.createdAt.toISOString(),
      project: r.project,
    };
  } catch {
    const briefs = ensureLocalStore();
    return briefs.find((b) => b.id === id) || null;
  }
}

export async function scheduleBriefCall(
  id: string,
  data: {
    callScheduledAt: string;
    callMeetingUrl?: string | null;
    callNotes?: string | null;
    status?: BriefRecord["status"];
  }
): Promise<BriefRecord | null> {
  try {
    const updated = await prisma.brief.update({
      where: { id },
      data: {
        callScheduledAt: new Date(data.callScheduledAt),
        callMeetingUrl: data.callMeetingUrl || null,
        callNotes: data.callNotes || null,
        status: data.status || "call_scheduled",
      },
      include: {
        project: { select: { id: true, name: true, phase: true, status: true } },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      projectType: updated.projectType,
      budget: updated.budget,
      description: updated.description,
      status: updated.status as BriefRecord["status"],
      callScheduledAt: updated.callScheduledAt ? updated.callScheduledAt.toISOString() : null,
      callMeetingUrl: updated.callMeetingUrl,
      callNotes: updated.callNotes,
      createdAt: updated.createdAt.toISOString(),
      project: updated.project,
    };
  } catch (dbError) {
    const briefs = ensureLocalStore();
    const index = briefs.findIndex((b) => b.id === id);
    if (index !== -1) {
      briefs[index].callScheduledAt = data.callScheduledAt;
      briefs[index].callMeetingUrl = data.callMeetingUrl || null;
      briefs[index].callNotes = data.callNotes || null;
      briefs[index].status = data.status || "call_scheduled";
      writeLocalStore(briefs);
      return briefs[index];
    }
    return null;
  }
}

export async function updateBriefStatus(
  id: string,
  status: BriefRecord["status"]
): Promise<BriefRecord | null> {
  try {
    const updated = await prisma.brief.update({
      where: { id },
      data: { status },
      include: {
        project: { select: { id: true, name: true, phase: true, status: true } },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      projectType: updated.projectType,
      budget: updated.budget,
      description: updated.description,
      status: updated.status as BriefRecord["status"],
      callScheduledAt: updated.callScheduledAt ? updated.callScheduledAt.toISOString() : null,
      callMeetingUrl: updated.callMeetingUrl,
      callNotes: updated.callNotes,
      createdAt: updated.createdAt.toISOString(),
      project: updated.project,
    };
  } catch (dbError) {
    console.warn(
      "[Database Warning] PostgreSQL unreachable via Prisma. Falling back to local data store for development. Error:",
      (dbError as Error).message
    );

    const briefs = ensureLocalStore();
    const index = briefs.findIndex((b) => b.id === id);
    if (index !== -1) {
      briefs[index].status = status;
      writeLocalStore(briefs);
      return briefs[index];
    }
    return null;
  }
}
