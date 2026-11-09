import {
  prisma,
  withDatabaseTimeout,
  withDatabaseRetry,
  isRealDatabaseConfigured,
} from "@/lib/prisma";
import staticTeamData from "../../data/team.json";

export interface TeamMemberRecord {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  displayOrder: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// In-memory cache with bounded 5-minute TTL for public team members
// Multi-Isolate Cache Semantics:
// 1. Scope: In-memory cache lives within the active Cloudflare Worker isolate.
// 2. Admin Invalidation: Admin mutations clear the local isolate cache and trigger revalidatePath().
// 3. Global Convergence: Other edge isolates converge to live PostgreSQL data within at most CACHE_TTL_MS (5 min).
// 4. Data Isolation: Public data only. Private client, financial, or authentication data is NEVER stored here.
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedTeam: { data: TeamMemberRecord[]; timestamp: number } | null = null;
let inFlightTeamPromise: Promise<TeamMemberRecord[]> | null = null;

function getLocalStaticFallback(): TeamMemberRecord[] {
  return (staticTeamData as unknown as TeamMemberRecord[]) || [];
}

export function invalidateTeamCache() {
  cachedTeam = null;
  inFlightTeamPromise = null;
}

export async function getTeamMembers(): Promise<TeamMemberRecord[]> {
  const now = Date.now();
  if (cachedTeam && now - cachedTeam.timestamp < CACHE_TTL_MS) {
    return cachedTeam.data;
  }

  // Fast-path: If database is not configured, return bundled static data
  if (!isRealDatabaseConfigured()) {
    const fallback = getLocalStaticFallback();
    cachedTeam = { data: fallback, timestamp: now };
    return fallback;
  }

  // Cache stampede prevention: reuse in-flight promise across concurrent requests
  if (inFlightTeamPromise) {
    return inFlightTeamPromise;
  }

  inFlightTeamPromise = (async () => {
    try {
      const items = await withDatabaseRetry(
        async () => {
          return await withDatabaseTimeout(
            prisma.teamMember.findMany({
              orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            }),
            6000,
            "getTeamMembers"
          );
        },
        { isIdempotent: true, operationName: "getTeamMembers" }
      );

      const formatted: TeamMemberRecord[] = (items || []).map((item: any) => {
        let name = item.name;
        if (name === "Kartik" || item.id === "cmtznchcj0003i2egsiheghzz") {
          name = "Kartik Gupta";
        }
        const bio = item.bio ? item.bio.replace(/Kiln's/g, "DigiGrantha's") : item.bio;

        return {
          id: item.id,
          name,
          role: item.role,
          avatar: item.avatar || (name ? name.charAt(0).toUpperCase() : "M"),
          bio,
          displayOrder: item.displayOrder ?? 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });

      cachedTeam = { data: formatted, timestamp: Date.now() };
      return formatted;
    } catch (error: any) {
      console.warn("[Team] Database read unavailable, falling back to static bundled team:", error.message);
      const fallback = getLocalStaticFallback();
      cachedTeam = { data: fallback, timestamp: Date.now() - (CACHE_TTL_MS - 30_000) };
      return fallback;
    } finally {
      inFlightTeamPromise = null;
    }
  })();

  return inFlightTeamPromise;
}

export async function getTeamMemberById(id: string): Promise<TeamMemberRecord | null> {
  try {
    const item = await withDatabaseTimeout(
      prisma.teamMember.findUnique({
        where: { id },
      }),
      6000,
      "getTeamMemberById"
    );

    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      role: item.role,
      avatar: item.avatar || (item.name ? item.name.charAt(0).toUpperCase() : "M"),
      bio: item.bio,
      displayOrder: item.displayOrder ?? 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  } catch {
    const all = await getTeamMembers();
    return all.find((item) => item.id === id) || null;
  }
}

export async function createTeamMember(
  data: Omit<TeamMemberRecord, "id" | "createdAt" | "updatedAt">
): Promise<TeamMemberRecord> {
  const avatar = data.avatar && data.avatar.trim() ? data.avatar.trim() : data.name.charAt(0).toUpperCase();

  try {
    const created = await withDatabaseTimeout(
      prisma.teamMember.create({
        data: {
          name: data.name.trim(),
          role: data.role.trim(),
          avatar,
          bio: data.bio.trim(),
          displayOrder: Number(data.displayOrder) || 0,
        },
      }),
      10000,
      "createTeamMember"
    );

    invalidateTeamCache();

    return {
      id: created.id,
      name: created.name,
      role: created.role,
      avatar: created.avatar || avatar,
      bio: created.bio,
      displayOrder: created.displayOrder,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  } catch (error: any) {
    console.error("[Database Error] Failed to create team member in PostgreSQL:", error.message);
    throw new Error("Failed to create team member. Database write could not be confirmed.");
  }
}

export async function updateTeamMember(
  id: string,
  data: Partial<Omit<TeamMemberRecord, "id" | "createdAt" | "updatedAt">>
): Promise<TeamMemberRecord | null> {
  try {
    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.role !== undefined) updatePayload.role = data.role.trim();
    if (data.avatar !== undefined) updatePayload.avatar = data.avatar.trim();
    if (data.bio !== undefined) updatePayload.bio = data.bio.trim();
    if (data.displayOrder !== undefined) updatePayload.displayOrder = Number(data.displayOrder);

    const updated = await withDatabaseTimeout(
      prisma.teamMember.update({
        where: { id },
        data: updatePayload,
      }),
      10000,
      "updateTeamMember"
    );

    invalidateTeamCache();

    return {
      id: updated.id,
      name: updated.name,
      role: updated.role,
      avatar: updated.avatar || (updated.name ? updated.name.charAt(0).toUpperCase() : "M"),
      bio: updated.bio,
      displayOrder: updated.displayOrder,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (error: any) {
    if (error?.code === "P2025") {
      return null;
    }
    console.error("[Database Error] Failed to update team member in PostgreSQL:", error.message);
    throw new Error("Failed to update team member. Database write could not be confirmed.");
  }
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  try {
    await withDatabaseTimeout(
      prisma.teamMember.delete({
        where: { id },
      }),
      8000,
      "deleteTeamMember"
    );
    invalidateTeamCache();
    return true;
  } catch (err: any) {
    if (err?.code === "P2025") {
      return false;
    }
    console.error("[Database Error] Failed to delete team member in PostgreSQL:", err.message);
    throw new Error("Failed to delete team member. Database delete could not be confirmed.");
  }
}
