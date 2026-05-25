import { z } from "zod";

// Constant for match statuses
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
} as const;

// Helper to check if a string is a valid ISO datetime
const isoDateString = z.iso.datetime();

// Schema to validate list matches query parameters
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Schema to validate match ID parameter
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Schema to validate match creation request body
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, "Sport must not be empty"),
    homeTeam: z.string().min(1, "Home team must not be empty"),
    awayTeam: z.string().min(1, "Away team must not be empty"),
    startTime: isoDateString,
    endTime: isoDateString,
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    // Only compare if both are valid dates
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (end <= start) {
        ctx.addIssue({
          code: "custom",
          message: "endTime must be chronologically after startTime",
          path: ["endTime"],
        });
      }
    }
  });

// Schema to validate score updates
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
