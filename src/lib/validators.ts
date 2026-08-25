import { z } from "zod";

export const BriefSubmissionSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().optional().nullable(),
  projectType: z.string().min(1, "Please select a project type"),
  budget: z.string().optional().nullable(),
  description: z.string().min(10, "Please provide a few details about your project"),
});

export const ScheduleCallSchema = z.object({
  callScheduledAt: z.string().min(1, "Date and time are required"),
  callMeetingUrl: z.string().optional().nullable(),
  callNotes: z.string().optional().nullable(),
  status: z.enum(["call_scheduled", "call_completed", "new", "read", "converted", "archived"]).optional(),
  notifyClient: z.boolean().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid or missing token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export const ConvertBriefSchema = z.object({
  projectName: z.string().min(2, "Project name is required"),
  developerIds: z.array(z.string()).min(1, "Assign at least one developer"),
});

export const InviteDeveloperSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(2, "Developer name required"),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  phase: z.enum(["DISCOVER", "DESIGN", "BUILD", "SHIP_AND_ITERATE"]).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  nextCallAt: z.string().nullable().optional(),
  developerIds: z.array(z.string()).optional(),
});

export const CreateProjectUpdateSchema = z.object({
  note: z.string().min(3, "Update note cannot be empty").max(5000, "Update note is too long"),
});

export const CreateTicketSchema = z.object({
  subject: z.string().min(3, "Ticket subject is required").max(150, "Subject is too long"),
  body: z.string().min(5, "Ticket message cannot be empty").max(5000, "Message is too long"),
});

export const UpdateTicketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
});

export const CreateMessageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(5000, "Message is too long"),
  ticketId: z.string().optional().nullable(),
});
