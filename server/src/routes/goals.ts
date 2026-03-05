import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

export const goalRoutes = Router();

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  domain: z.enum(["WORK", "FITNESS", "NUTRITION", "HABITS", "ADMIN"]),
  userId: z.string(),
});

goalRoutes.post("/", async (req, res) => {
  try {
    const data = CreateGoalSchema.parse(req.body);
    const goal = await prisma.goal.create({ data });
    res.status(201).json(goal);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Invalid request" });
  }
});

goalRoutes.get("/", async (req, res) => {
  const { userId, domain } = req.query;
  const goals = await prisma.goal.findMany({
    where: {
      userId: userId as string,
      ...(domain && { domain: domain as any }),
    },
    include: { tasks: { where: { status: { not: "DONE" } } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(goals);
});

goalRoutes.patch("/:id", async (req, res) => {
  const { title, description, status } = req.body;
  const goal = await prisma.goal.update({
    where: { id: req.params.id },
    data: { title, description, status },
  });
  res.json(goal);
});
