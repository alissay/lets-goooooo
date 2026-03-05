import { Router } from "express";

export const pushRoutes = Router();

// Placeholder — push subscription management
// Will store VAPID subscriptions and send notifications

pushRoutes.post("/subscribe", async (_req, res) => {
  // TODO: Store push subscription in DB
  res.json({ message: "Push subscription saved" });
});

pushRoutes.delete("/subscribe", async (_req, res) => {
  // TODO: Remove push subscription from DB
  res.json({ message: "Push subscription removed" });
});
