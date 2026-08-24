import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export interface BriefRecord {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string | null;
  description: string;
  status: "new" | "read" | "archived";
  createdAt: string;
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
      projectType: result.projectType,
      budget: result.budget,
      description: result.description,
      status: result.status as "new" | "read" | "archived",
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
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      projectType: r.projectType,
      budget: r.budget,
      description: r.description,
      status: r.status as "new" | "read" | "archived",
      createdAt: r.createdAt.toISOString(),
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

export async function updateBriefStatus(
  id: string,
  status: "new" | "read" | "archived"
): Promise<BriefRecord | null> {
  try {
    const updated = await prisma.brief.update({
      where: { id },
      data: { status },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      projectType: updated.projectType,
      budget: updated.budget,
      description: updated.description,
      status: updated.status as "new" | "read" | "archived",
      createdAt: updated.createdAt.toISOString(),
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
