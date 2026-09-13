import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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

const CACHE_FILE_PATH = path.join(process.cwd(), "data", "team.json");
const CACHE_TTL_MS = 60 * 1000;

let cachedTeam: { data: TeamMemberRecord[]; timestamp: number } | null = null;

function getLocalFallback(): TeamMemberRecord[] {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const fileData = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Failed to read local team fallback:", err);
  }
  return [];
}

function saveLocalFallback(items: TeamMemberRecord[]) {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch {
    // Silently ignore in read-only environments
  }
}

export function invalidateTeamCache() {
  cachedTeam = null;
}

export async function getTeamMembers(): Promise<TeamMemberRecord[]> {
  const now = Date.now();
  if (cachedTeam && now - cachedTeam.timestamp < CACHE_TTL_MS) {
    return cachedTeam.data;
  }

  try {
    const items = await prisma.teamMember.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    const formatted: TeamMemberRecord[] = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      avatar: item.avatar || (item.name ? item.name.charAt(0).toUpperCase() : "M"),
      bio: item.bio,
      displayOrder: item.displayOrder ?? 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    cachedTeam = { data: formatted, timestamp: now };
    saveLocalFallback(formatted);
    return formatted;
  } catch (error) {
    console.warn("Using local cache for team members:", (error as Error).message);
    const fallback = getLocalFallback();
    cachedTeam = { data: fallback, timestamp: now };
    return fallback;
  }
}

export async function getTeamMemberById(id: string): Promise<TeamMemberRecord | null> {
  try {
    const item = await prisma.teamMember.findUnique({
      where: { id },
    });
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

  const created = await prisma.teamMember.create({
    data: {
      name: data.name.trim(),
      role: data.role.trim(),
      avatar,
      bio: data.bio.trim(),
      displayOrder: Number(data.displayOrder) || 0,
    },
  });

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
}

export async function updateTeamMember(
  id: string,
  data: Partial<Omit<TeamMemberRecord, "id" | "createdAt" | "updatedAt">>
): Promise<TeamMemberRecord | null> {
  const updatePayload: any = {};
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.role !== undefined) updatePayload.role = data.role.trim();
  if (data.avatar !== undefined) updatePayload.avatar = data.avatar.trim();
  if (data.bio !== undefined) updatePayload.bio = data.bio.trim();
  if (data.displayOrder !== undefined) updatePayload.displayOrder = Number(data.displayOrder);

  const updated = await prisma.teamMember.update({
    where: { id },
    data: updatePayload,
  });

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
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  try {
    await prisma.teamMember.delete({
      where: { id },
    });
    invalidateTeamCache();
    return true;
  } catch (err) {
    console.error("Failed to delete team member:", err);
    return false;
  }
}
