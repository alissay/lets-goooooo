export function Settings() {
  return (
    <div className="max-w-lg mx-auto px-5 pt-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl mb-8">
        Settings
      </h1>

      <div className="space-y-6">
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
