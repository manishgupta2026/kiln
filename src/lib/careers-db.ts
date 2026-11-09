import {
  prisma,
  withDatabaseTimeout,
  withDatabaseRetry,
} from "@/lib/prisma";

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
  const email = data.email.toLowerCase().trim();
  const name = data.name.trim();
  const role = data.role.trim();
  const skillsArray = data.skills || [];

  // Deduplication check: if identical applicant applied for same role within 60 seconds
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
  try {
    const existing = await prisma.careerApplication.findFirst({
      where: {
        email,
        role,
        createdAt: { gte: sixtySecondsAgo },
      },
    });

    if (existing) {
      console.warn(`[Career] Duplicate application detected for ${email} (${role}), returning existing.`);
      return {
        id: existing.id,
        type: existing.type as CareerApplicationRecord["type"],
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        location: existing.location,
        role: existing.role,
        experience: existing.experience,
        portfolioUrl: existing.portfolioUrl,
        githubUrl: existing.githubUrl,
        linkedinUrl: existing.linkedinUrl,
        resumeUrl: existing.resumeUrl,
        rateOrSalary: existing.rateOrSalary,
        availability: existing.availability,
        skills: existing.skills,
        coverNote: existing.coverNote,
        metadata: existing.metadata as Record<string, any>,
        status: existing.status as CareerApplicationRecord["status"],
        adminNotes: existing.adminNotes,
        createdAt: existing.createdAt.toISOString(),
        updatedAt: existing.updatedAt.toISOString(),
      };
    }
  } catch {
    // Proceed if lookup fails
  }

  try {
    const result = await withDatabaseTimeout(
      prisma.careerApplication.create({
        data: {
          type: data.type,
          name,
          email,
          phone: data.phone?.trim() || null,
          location: data.location?.trim() || null,
          role,
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
      }),
      10000,
      "createCareerApplication"
    );

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
  } catch (dbError: any) {
    console.error("[Database Error] Failed to persist career application to PostgreSQL:", dbError.message);
    throw new Error("Failed to submit career application. Database write could not be confirmed.");
  }
}

export async function getAllCareerApplications(filters?: {
  type?: string;
  status?: string;
}): Promise<CareerApplicationRecord[]> {
  return withDatabaseRetry(
    async () => {
      const where: any = {};
      if (filters?.type && filters.type !== "ALL") {
        where.type = filters.type.toUpperCase();
      }
      if (filters?.status && filters.status !== "ALL") {
        where.status = filters.status.toLowerCase();
      }

      const records = await withDatabaseTimeout(
        prisma.careerApplication.findMany({
          where,
          orderBy: { createdAt: "desc" },
        }),
        6000,
        "getAllCareerApplications"
      );

      return (records || []).map((r: any) => ({
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
    },
    { isIdempotent: true, operationName: "getAllCareerApplications" }
  );
}

export async function getCareerApplicationById(
  id: string
): Promise<CareerApplicationRecord | null> {
  return withDatabaseRetry(
    async () => {
      const r = await withDatabaseTimeout(
        prisma.careerApplication.findUnique({
          where: { id },
        }),
        6000,
        "getCareerApplicationById"
      );

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
    },
    { isIdempotent: true, operationName: "getCareerApplicationById" }
  );
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

    const updated = await withDatabaseTimeout(
      prisma.careerApplication.update({
        where: { id },
        data: updatePayload,
      }),
      10000,
      "updateCareerApplication"
    );

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
  } catch (dbError: any) {
    if (dbError?.code === "P2025") {
      return null;
    }
    console.error("[Database Error] Failed to update career application in PostgreSQL:", dbError.message);
    throw new Error("Failed to update career application. Database write could not be confirmed.");
  }
}

export async function deleteCareerApplication(id: string): Promise<boolean> {
  try {
    await withDatabaseTimeout(
      prisma.careerApplication.delete({
        where: { id },
      }),
      8000,
      "deleteCareerApplication"
    );
    return true;
  } catch (err: any) {
    if (err?.code === "P2025") {
      return false;
    }
    console.error("[Database Error] Failed to delete career application in PostgreSQL:", err.message);
    throw new Error("Failed to delete career application. Database delete could not be confirmed.");
  }
}
