import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

export const taskRoutes = Router();

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  domain: z.enum(["WORK", "FITNESS", "NUTRITION", "HABITS", "ADMIN"]),
  firstStep: z.string().optional(),
  softDueAt: z.string().datetime().optional(),
  goalId: z.string().optional(),
  userId: z.string(),
});

const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  firstStep: z.string().optional(),
  domain: z.enum(["WORK", "FITNESS", "NUTRITION", "HABITS", "ADMIN"]).optional(),
  breadcrumb: z.string().optional(),
  softDueAt: z.string().datetime().nullable().optional(),
  urgencyLevel: z.number().min(0).max(3).optional(),
});

// Create task
taskRoutes.post("/", async (req, res) => {
  try {
    const data = CreateTaskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: {
        ...data,
        softDueAt: data.softDueAt ? new Date(data.softDueAt) : undefined,
      },
    });
    res.status(201).json(task);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Invalid request" });
  }
});

// Get all tasks (filterable)
taskRoutes.get("/", async (req, res) => {
  const { domain, status, userId } = req.query;
  const tasks = await prisma.task.findMany({
    where: {
      userId: userId as string,
      ...(domain && { domain: domain as any }),
      ...(status && { status: status as any }),
    },
    orderBy: [{ isNowMode: "desc" }, { softDueAt: "asc" }, { createdAt: "asc" }],
    include: { goal: true },
  });
  res.json(tasks);
});

// Get current "right now" task
taskRoutes.get("/current", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });

  // Priority: NOW mode > earliest soft due > oldest pending
  const task = await prisma.task.findFirst({
    where: {
      userId: userId as string,
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
    orderBy: [{ isNowMode: "desc" }, { softDueAt: "asc" }, { createdAt: "asc" }],
    include: { goal: true },
  });
  res.json(task);
});

// Update task
taskRoutes.patch("/:id", async (req, res) => {
  try {
    const data = UpdateTaskSchema.parse(req.body);
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...data,
        softDueAt: data.softDueAt === null ? null : data.softDueAt ? new Date(data.softDueAt) : undefined,
      },
    });
    res.json(task);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Invalid request" });
  }
});

// Delete task
taskRoutes.delete("/:id", async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Complete task
taskRoutes.post("/:id/complete", async (req, res) => {
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      status: "DONE",
      completedAt: new Date(),
      isNowMode: false,
      nowModeEndsAt: null,
    },
  });

  // Log usage event
  await prisma.usageEvent.create({
    data: {
      eventType: "task_completed",
      domain: task.domain,
      userId: task.userId,
    },
  });

  res.json(task);
});

// Defer task
taskRoutes.post("/:id/defer", async (req, res) => {
  const { deferUntil } = req.body;
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      status: "DEFERRED",
      deferredAt: new Date(),
      deferCount: { increment: 1 },
      softDueAt: deferUntil ? new Date(deferUntil) : null,
      isNowMode: false,
      nowModeEndsAt: null,
    },
  });

  await prisma.usageEvent.create({
    data: {
      eventType: "task_deferred",
      domain: task.domain,
      userId: task.userId,
    },
  });

  res.json(task);
});

// NOW Mode
taskRoutes.post("/:id/now-mode", async (req, res) => {
  const { durationMinutes } = req.body;
  const endsAt = new Date(Date.now() + (durationMinutes || 25) * 60 * 1000);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      isNowMode: true,
      nowModeEndsAt: endsAt,
      status: "IN_PROGRESS",
    },
  });
  res.json(task);
});

// Decompose task with Claude
taskRoutes.post("/:id/decompose", async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (!process.env.CLAUDE_API_KEY) {
    return res.status(500).json({ error: "CLAUDE_API_KEY not configured" });
  }

  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    system: `You are a task decomposition assistant for someone with ADHD.
Your job is to break a single task into 3-5 concrete micro-steps that each take
under 5 minutes and require no decision-making. Steps must be physical actions
("open X", "type Y", "find Z"), never mental states ("think about", "decide", "plan").
The first step especially must feel almost embarrassingly easy.
Return ONLY a JSON array of strings. No explanation, no preamble.`,
    messages: [
      {
        role: "user",
        content: `Task: "${task.title}"\nDomain: ${task.domain}\n\nReturn 3-5 micro-steps as a JSON array.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const steps = JSON.parse(text);
    res.json({ steps });
  } catch {
    res.json({ steps: [text] });
  }
});
