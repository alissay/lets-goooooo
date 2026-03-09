import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3456";

export function Settings() {
  const [calConnected, setCalConnected] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/calendar/status`)
      .then((r) => r.json())
      .then((data) => setCalConnected(data.connected))
      .catch(() => {});
  }, []);

  const disconnectCalendar = async () => {
    await fetch(`${API}/api/calendar/disconnect`, { method: "POST" });
    setCalConnected(false);
  };

  return (
    <div className="max-w-lg mx-auto px-5 pt-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl mb-8">
        Settings
      </h1>

      <div className="space-y-6">
        <div className="bg-bg-surface rounded-[var(--radius-card)] p-5">
          <h2 className="font-medium mb-3">Google Calendar</h2>
          {calConnected ? (
            <div className="flex items-center justify-between">
              <p className="text-text-secondary text-sm">Connected (read-only)</p>
              <button
                onClick={disconnectCalendar}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <a
              href={`${API}/api/auth/google/connect`}
              className="inline-block text-sm text-accent hover:underline"
            >
              Connect Google Calendar
            </a>
          )}
        </div>

        <div className="bg-bg-surface rounded-[var(--radius-card)] p-5">
          <h2 className="font-medium mb-3">Quiet Hours</h2>
          <p className="text-text-secondary text-sm">
            Default: 9pm - 8am. Notifications are silenced during this window.
          </p>
        </div>

        <div className="bg-bg-surface rounded-[var(--radius-card)] p-5">
          <h2 className="font-medium mb-3">Daily Check-in Time</h2>
          <p className="text-text-secondary text-sm">
            Default: 5:00 PM. When you'll get the "How's today feeling?" prompt.
          </p>
        </div>

        <div className="bg-bg-surface rounded-[var(--radius-card)] p-5">
          <h2 className="font-medium mb-3">Appearance</h2>
          <p className="text-text-secondary text-sm">
            Light mode (dark mode coming in Phase 2).
          </p>
        </div>
      </div>
    </div>
  );
}
