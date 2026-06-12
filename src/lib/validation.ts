import { z } from "zod";

export const applicationSchema = z.object({
  discordUsername: z.string().min(2).max(80),
  discordUserId: z.string().regex(/^\d{15,25}$/),
  age: z.coerce.number().int().min(13).max(99),
  timezone: z.string().min(2).max(80),
  activityLevel: z.string().min(2).max(120),
  whyStaff: z.string().min(20).max(2000),
  vcProblemResponse: z.string().min(20).max(2000),
  argumentResponse: z.string().min(20).max(2000),
  previousExperience: z.string().min(2).max(2000),
});

export const reportSchema = z.object({
  type: z.enum(["report", "ban_appeal"]),
  discordUsername: z.string().min(2).max(80),
  discordUserId: z.string().regex(/^\d{15,25}$/),
  subject: z.string().min(4).max(160),
  details: z.string().min(20).max(3000),
  evidenceUrl: z.string().url().max(400).optional().or(z.literal("")),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const reportStatusSchema = z.object({
  status: z.enum(["open", "reviewing", "resolved", "dismissed"]),
});

export const staffSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  discordUserId: z.string().regex(/^\d{15,25}$/),
  displayName: z.string().min(1).max(100),
  rank: z.enum(["Owner", "Admin", "Moderator", "Trial Staff"]),
  status: z.enum(["online", "idle", "dnd", "offline", "unknown"]).default("unknown"),
  bio: z.string().min(1).max(500),
  sortOrder: z.coerce.number().int().min(0).max(999).default(50),
});

export const eventSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(2).max(100),
  description: z.string().min(8).max(700),
  startsAt: z.string().datetime(),
  host: z.string().max(100).optional().or(z.literal("")),
  eventType: z.string().min(2).max(80),
  isActive: z.coerce.boolean().default(true),
});
