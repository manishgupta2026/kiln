import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export interface CareerApplicationRecord {
  id: string;
  type: "JOB" | "INTERNSHIP" | "FREELANCING";
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  role: string;
  experience?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  resumeUrl?: string | null;
  rateOrSalary?: string | null;
  availability?: string | null;
  skills: string[];
  coverNote: string;
  metadata?: Record<string, any> | null;
  status: "new" | "reviewing" | "shortlisted" | "interviewed" | "hired" | "rejected" | "archived";
  adminNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "careers.json");

function ensureLocalStore(): CareerApplicationRecord[] {
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

function writeLocalStore(items: CareerApplicationRecord[]) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to local careers fallback:", err);
  }
}

export async function createCareerApplication(data: {
  type: "JOB" | "INTERNSHIP" | "FREELANCING";
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  role: string;
  experience?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  resumeUrl?: string | null;
  rateOrSalary?: string | null;
  availability?: string | null;
  skills?: string[];
  coverNote: string;
  metadata?: Record<string, any> | null;
}): Promise<CareerApplicationRecord> {
  const skillsArray = data.skills || [];

  try {
    const result = await prisma.careerApplication.create({
      data: {
        type: data.type,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
        location: data.location?.trim() || null,
        role: data.role.trim(),
        experience: data.experience?.trim() || null,
        portfolioUrl: data.portfolioUrl?.trim() || null,
        githubUrl: data.githubUrl?.trim() || null,
        linkedinUrl: data.linkedinUrl?.trim() || null,
        resumeUrl: data.resumeUrl?.trim() || null,
        rateOrSalary: data.rateOrSalary?.trim() || null,
        availability: data.availability?.trim() || null,
        skills: skillsArray,
        coverNote: data.coverNote.trim(),
        metadata: data.metadata || {},
        status: "new",
      },
    });

    return {
      id: result.id,
      type: result.type as CareerApplicationRecord["type"],
      name: result.name,
      email: result.email,
      phone: result.phone,
      location: result.location,
      role: result.role,
      experience: result.experience,
      portfolioUrl: result.portfolioUrl,
      githubUrl: result.githubUrl,
      linkedinUrl: result.linkedinUrl,
      resumeUrl: result.resumeUrl,
      rateOrSalary: result.rateOrSalary,
      availability: result.availability,
      skills: result.skills,
      coverNote: result.coverNote,
      metadata: result.metadata as Record<string, any>,
      status: result.status as CareerApplicationRecord["status"],
      adminNotes: result.adminNotes,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  } catch (dbError) {
    console.warn(
      "[Database Warning] PostgreSQL unreachable via Prisma. Falling back to local data store for careers. Error:",
      (dbError as Error).message
    );

    const store = ensureLocalStore();
    const newRecord: CareerApplicationRecord = {
      id: `local_app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: data.type,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
      location: data.location?.trim() || null,
      role: data.role.trim(),
      experience: data.experience?.trim() || null,
      portfolioUrl: data.portfolioUrl?.trim() || null,
      githubUrl: data.githubUrl?.trim() || null,
      linkedinUrl: data.linkedinUrl?.trim() || null,
      resumeUrl: data.resumeUrl?.trim() || null,
      rateOrSalary: data.rateOrSalary?.trim() || null,
      availability: data.availability?.trim() || null,
      skills: skillsArray,
      coverNote: data.coverNote.trim(),
      metadata: data.metadata || {},
      status: "new",
      adminNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.unshift(newRecord);
    writeLocalStore(store);
    return newRecord;
  }
}

export async function getAllCareerApplications(filters?: {
  type?: string;
  status?: string;
}): Promise<CareerApplicationRecord[]> {
  try {
    const where: any = {};
    if (filters?.type && filters.type !== "ALL") {
      where.type = filters.type.toUpperCase();
    }
    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status.toLowerCase();
    }

    const records = await prisma.careerApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return records.map((r: any) => ({
      id: r.id,
      type: r.type as CareerApplicationRecord["type"],
      name: r.name,
      email: r.email,
      phone: r.phone,
      location: r.location,
      role: r.role,
      experience: r.experience,
      portfolioUrl: r.portfolioUrl,
      githubUrl: r.githubUrl,
      linkedinUrl: r.linkedinUrl,
      resumeUrl: r.resumeUrl,
      rateOrSalary: r.rateOrSalary,
      availability: r.availability,
      skills: r.skills || [],
      coverNote: r.coverNote,
      metadata: r.metadata as Record<string, any>,
      status: r.status as CareerApplicationRecord["status"],
      adminNotes: r.adminNotes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (dbError) {
    console.warn(
      "[Database Warning] PostgreSQL unreachable via Prisma. Falling back to local data store for careers. Error:",
      (dbError as Error).message
    );

    let store = ensureLocalStore();
    if (filters?.type && filters.type !== "ALL") {
      store = store.filter((r) => r.type.toUpperCase() === filters.type!.toUpperCase());
    }
    if (filters?.status && filters.status !== "ALL") {
      store = store.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
    }

    return store.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export async function getCareerApplicationById(
  id: string
): Promise<CareerApplicationRecord | null> {
  try {
    const r = await prisma.careerApplication.findUnique({
      where: { id },
    });

    if (!r) return null;

    return {
      id: r.id,
      type: r.type as CareerApplicationRecord["type"],
      name: r.name,
      email: r.email,
      phone: r.phone,
      location: r.location,
      role: r.role,
      experience: r.experience,
      portfolioUrl: r.portfolioUrl,
      githubUrl: r.githubUrl,
      linkedinUrl: r.linkedinUrl,
      resumeUrl: r.resumeUrl,
      rateOrSalary: r.rateOrSalary,
      availability: r.availability,
      skills: r.skills || [],
      coverNote: r.coverNote,
      metadata: r.metadata as Record<string, any>,
      status: r.status as CareerApplicationRecord["status"],
      adminNotes: r.adminNotes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  } catch {
    const store = ensureLocalStore();
    return store.find((b) => b.id === id) || null;
  }
}

export async function updateCareerApplication(
  id: string,
  data: {
    status?: CareerApplicationRecord["status"];
    adminNotes?: string | null;
  }
): Promise<CareerApplicationRecord | null> {
  try {
    const updatePayload: any = {};
    if (data.status) updatePayload.status = data.status;
    if (data.adminNotes !== undefined) updatePayload.adminNotes = data.adminNotes;

    const updated = await prisma.careerApplication.update({
      where: { id },
      data: updatePayload,
    });

    return {
      id: updated.id,
      type: updated.type as CareerApplicationRecord["type"],
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      location: updated.location,
      role: updated.role,
      experience: updated.experience,
      portfolioUrl: updated.portfolioUrl,
      githubUrl: updated.githubUrl,
      linkedinUrl: updated.linkedinUrl,
      resumeUrl: updated.resumeUrl,
      rateOrSalary: updated.rateOrSalary,
      availability: updated.availability,
      skills: updated.skills || [],
      coverNote: updated.coverNote,
      metadata: updated.metadata as Record<string, any>,
      status: updated.status as CareerApplicationRecord["status"],
      adminNotes: updated.adminNotes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (dbError) {
    const store = ensureLocalStore();
    const index = store.findIndex((b) => b.id === id);
    if (index !== -1) {
      if (data.status) store[index].status = data.status;
      if (data.adminNotes !== undefined) store[index].adminNotes = data.adminNotes;
      store[index].updatedAt = new Date().toISOString();
      writeLocalStore(store);
      return store[index];
    }
    return null;
  }
}

export async function deleteCareerApplication(id: string): Promise<boolean> {
  try {
    await prisma.careerApplication.delete({
      where: { id },
    });
    return true;
  } catch (err) {
    const store = ensureLocalStore();
    const filtered = store.filter((b) => b.id !== id);
    if (filtered.length !== store.length) {
      writeLocalStore(filtered);
      return true;
    }
    return false;
  }
}
