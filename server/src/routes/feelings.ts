import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

export const feelingRoutes = Router();

const CreateFeelingSchema = z.object({
  type: z.enum(["AMBIENT_DAILY", "IN_THE_MOMENT"]),
  state: z.enum(["CRASHED", "ROUGH", "OKAY", "GOOD", "ON_FIRE"]),
  note: z.string().optional(),
  domainContext: z.enum(["WORK", "FITNESS", "NUTRITION", "HABITS", "ADMIN"]).optional(),
  userId: z.string(),
});

// Log a feeling
feelingRoutes.post("/", async (req, res) => {
  try {
    const data = CreateFeelingSchema.parse(req.body);
    const feeling = await prisma.feelingLog.create({ data });

    await prisma.usageEvent.create({
      data: {
        eventType: "feeling_logged",
        userId: data.userId,
        metadata: { state: data.state, type: data.type },
      },
    });

    res.status(201).json(feeling);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Invalid request" });
  }
});

// Get feeling log
feelingRoutes.get("/", async (req, res) => {
  const { userId, from, to } = req.query;
  const feelings = await prisma.feelingLog.findMany({
    where: {
      userId: userId as string,
      ...(from || to
        ? {
            loggedAt: {
              ...(from && { gte: new Date(from as string) }),
              ...(to && { lte: new Date(to as string) }),
            },
          }
        : {}),
    },
    orderBy: { loggedAt: "desc" },
  });
  res.json(feelings);
});
