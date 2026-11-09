import {
  prisma,
  withDatabaseTimeout,
  withDatabaseRetry,
} from "@/lib/prisma";

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

export async function createBrief(data: {
  name: string;
  email: string;
  phone?: string | null;
  projectType: string;
  budget?: string | null;
  description: string;
}): Promise<BriefRecord> {
  const email = data.email.toLowerCase().trim();
  const name = data.name.trim();
  const description = data.description.trim();

  // Deduplication check: if identical brief was submitted in the last 60 seconds, reuse it
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
  try {
    const existing = await prisma.brief.findFirst({
      where: {
        email,
        description,
        createdAt: { gte: sixtySecondsAgo },
      },
    });

    if (existing) {
      console.warn(`[Brief] Duplicate submission detected for ${email}, returning existing record.`);
      return {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        projectType: existing.projectType,
        budget: existing.budget,
        description: existing.description,
        status: existing.status as BriefRecord["status"],
        createdAt: existing.createdAt.toISOString(),
      };
    }
  } catch {
    // If deduplication lookup fails, proceed to attempt insert
  }

  try {
    const result = await withDatabaseTimeout(
      prisma.brief.create({
        data: {
          name,
          email,
          phone: data.phone?.trim() || null,
          projectType: data.projectType.trim(),
          budget: data.budget?.trim() || null,
          description,
          status: "new",
        },
      }),
      10000,
      "createBrief"
    );

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
  } catch (dbError: any) {
    console.error("[Database Error] Failed to persist brief to PostgreSQL:", dbError.message);
    throw new Error("Failed to submit project brief. Database write could not be confirmed.");
  }
}

export async function getAllBriefs(): Promise<BriefRecord[]> {
  return withDatabaseRetry(
    async () => {
      const records = await withDatabaseTimeout(
        prisma.brief.findMany({
          include: {
            project: {
              select: { id: true, name: true, phase: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        6000,
        "getAllBriefs"
      );

      return (records || []).map((r: any) => ({
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
    },
    { isIdempotent: true, operationName: "getAllBriefs" }
  );
}

export async function getBriefById(id: string): Promise<BriefRecord | null> {
  return withDatabaseRetry(
    async () => {
      const r = await withDatabaseTimeout(
        prisma.brief.findUnique({
          where: { id },
          include: {
            project: {
              select: { id: true, name: true, phase: true, status: true },
            },
          },
        }),
        6000,
        "getBriefById"
      );

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
    },
    { isIdempotent: true, operationName: "getBriefById" }
  );
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
    const updated = await withDatabaseTimeout(
      prisma.brief.update({
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
      }),
      10000,
      "scheduleBriefCall"
    );

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
  } catch (dbError: any) {
    if (dbError?.code === "P2025") {
      return null; // Not found
    }
    console.error("[Database Error] Failed to update brief meeting in PostgreSQL:", dbError.message);
    throw new Error("Failed to schedule brief meeting. Database write could not be confirmed.");
  }
}

export async function updateBriefStatus(
  id: string,
  status: BriefRecord["status"]
): Promise<BriefRecord | null> {
  try {
    const updated = await withDatabaseTimeout(
      prisma.brief.update({
        where: { id },
        data: { status },
        include: {
          project: { select: { id: true, name: true, phase: true, status: true } },
        },
      }),
      10000,
      "updateBriefStatus"
    );

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
  } catch (dbError: any) {
    if (dbError?.code === "P2025") {
      return null;
    }
    console.error("[Database Error] Failed to update brief status in PostgreSQL:", dbError.message);
    throw new Error("Failed to update brief status. Database write could not be confirmed.");
  }
}
