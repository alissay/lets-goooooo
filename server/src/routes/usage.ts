import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const usageRoutes = Router();

// Export all usage events + feeling logs as JSON (for Claude analysis)
usageRoutes.get("/export", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const [events, feelings, tasks] = await Promise.all([
    prisma.usageEvent.findMany({
      where: { userId: userId as string },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.feelingLog.findMany({
      where: { userId: userId as string },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.task.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  res.json({ events, feelings, tasks });
});
