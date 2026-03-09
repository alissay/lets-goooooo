import express from "express";
import cors from "cors";
import { taskRoutes } from "./routes/tasks.js";
import { feelingRoutes } from "./routes/feelings.js";
import { winRoutes } from "./routes/wins.js";
import { goalRoutes } from "./routes/goals.js";
import { pushRoutes } from "./routes/push.js";
import { usageRoutes } from "./routes/usage.js";
import { calendarRoutes } from "./routes/calendar.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/feelings", feelingRoutes);
app.use("/api/wins", winRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/auth/google", calendarRoutes);
app.use("/api/calendar", calendarRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
