import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const winRoutes = Router();

// Get completed tasks (wins feed)
winRoutes.get("/", async (req, res) => {
  const { userId, domain } = req.query;
  const wins = await prisma.task.findMany({
    where: {
      userId: userId as string,
      status: "DONE",
      ...(domain && { domain: domain as any }),
    },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      title: true,
      domain: true,
      completedAt: true,
    },
  });
  res.json(wins);
});

// Weekly summary counts
winRoutes.get("/summary", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const wins = await prisma.task.findMany({
    where: {
      userId: userId as string,
      status: "DONE",
      completedAt: { gte: oneWeekAgo },
    },
    select: { domain: true },
  });

  const summary = wins.reduce(
    (acc, w) => {
      acc[w.domain] = (acc[w.domain] || 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0 } as Record<string, number>
  );

  res.json(summary);
});
