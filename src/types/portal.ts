export type Role = "CLIENT" | "DEVELOPER" | "ADMIN";
export const Role = {
  CLIENT: "CLIENT" as const,
  DEVELOPER: "DEVELOPER" as const,
  ADMIN: "ADMIN" as const,
};

export type ProjectPhase = "DISCOVER" | "DESIGN" | "BUILD" | "SHIP_AND_ITERATE";
export const ProjectPhase = {
  DISCOVER: "DISCOVER" as const,
  DESIGN: "DESIGN" as const,
  BUILD: "BUILD" as const,
  SHIP_AND_ITERATE: "SHIP_AND_ITERATE" as const,
};

export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED";
export const ProjectStatus = {
  ACTIVE: "ACTIVE" as const,
  PAUSED: "PAUSED" as const,
  COMPLETED: "COMPLETED" as const,
};

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export const TicketStatus = {
  OPEN: "OPEN" as const,
  IN_PROGRESS: "IN_PROGRESS" as const,
  RESOLVED: "RESOLVED" as const,
};
