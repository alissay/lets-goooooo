import { Router, Request, Response } from "express";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

const router = Router();

// Token file lives at server/.google-tokens.json
const TOKEN_PATH = path.resolve(process.cwd(), ".google-tokens.json");

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function loadTokens(): any | null {
  try {
    const data = fs.readFileSync(TOKEN_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveTokens(tokens: any) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

// Check if connected
router.get("/status", (_req: Request, res: Response) => {
  const tokens = loadTokens();
  res.json({ connected: !!tokens });
});

// Start OAuth flow
router.get("/connect", (_req: Request, res: Response) => {
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    prompt: "consent",
  });
  res.redirect(url);
});

// OAuth callback
router.get("/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send("Missing authorization code");
    return;
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    saveTokens(tokens);
    // Redirect to the app's Today page
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5188"}/today?calendar=connected`);
  } catch (err: any) {
    console.error("Google OAuth error:", err.message);
    res.status(500).send("Failed to authenticate with Google");
  }
});

// Disconnect
router.post("/disconnect", (_req: Request, res: Response) => {
  try {
    fs.unlinkSync(TOKEN_PATH);
  } catch {}
  res.json({ disconnected: true });
});

// Get today's events
router.get("/events", async (_req: Request, res: Response) => {
  const tokens = loadTokens();
  if (!tokens) {
    res.status(401).json({ error: "Not connected to Google Calendar" });
    return;
  }

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);

    // Refresh token if needed
    oauth2Client.on("tokens", (newTokens) => {
      const merged = { ...tokens, ...newTokens };
      saveTokens(merged);
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = (response.data.items || []).map((event) => ({
      id: event.id,
      title: event.summary || "Untitled",
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime,
      location: event.location,
      description: event.description,
    }));

    res.json({ events });
  } catch (err: any) {
    console.error("Calendar fetch error:", err.message);
    if (err.code === 401 || err.message?.includes("invalid_grant")) {
      try { fs.unlinkSync(TOKEN_PATH); } catch {}
      res.status(401).json({ error: "Token expired. Please reconnect." });
      return;
    }
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});

export const calendarRoutes = router;
