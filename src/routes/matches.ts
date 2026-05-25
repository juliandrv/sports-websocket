import { Router } from "express";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { createMatchSchema, listMatchesQuerySchema, MATCH_STATUS } from "../validation/matches.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

const matchRouter: Router = Router();

const MAX_LIMIT = 100;

matchRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit)

    res.json({ data })
  } catch (error) {
    res.status(500).json({
      error: "Failed to list matches",
      details: parsed.error
    })
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
  }

  const { startTime, endTime, homeScore, awayScore } = parsed.data;

  try {
    const [event] = await db.insert(matches).values({
      ...parsed.data,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      status: getMatchStatus(startTime, endTime) ?? MATCH_STATUS.SCHEDULED
    }).returning();

    res.status(201).json({ data: event });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create match", details: parsed.error });
  }

});

export default matchRouter;
