import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface Task {
  id: string;
  title: string;
  firstStep: string | null;
  domain: string;
  isNowMode: boolean;
  nowModeEndsAt: string | null;
  softDueAt: string | null;
}

const DOMAIN_BORDER_COLORS: Record<string, string> = {
  WORK: "border-l-domain-work",
  FITNESS: "border-l-domain-fitness",
  NUTRITION: "border-l-domain-nutrition",
  HABITS: "border-l-domain-habits",
  ADMIN: "border-l-domain-admin",
};

const DOMAIN_DOT_COLORS: Record<string, string> = {
  WORK: "bg-domain-work",
  FITNESS: "bg-domain-fitness",
  NUTRITION: "bg-domain-nutrition",
  HABITS: "bg-domain-habits",
  ADMIN: "bg-domain-admin",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Alissa";
  if (hour < 17) return "Good afternoon, Alissa";
  return "Good evening, Alissa";
}

const USER_ID = "seed-user";

export function RightNow() {
  const [task, setTask] = useState<Task | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDefer, setShowDefer] = useState(false);
  const navigate = useNavigate();

  const loadTasks = async () => {
    const current = (await api.tasks.current(USER_ID)) as Task | null;
    setTask(current);
    const all = (await api.tasks.list(USER_ID)) as Task[];
    const upcoming = all
      .filter((t) => t.id !== current?.id && (t as any).status !== "DONE")
      .slice(0, 3);
    setUpcomingTasks(upcoming);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleComplete = async () => {
    if (!task) return;
    await api.tasks.complete(task.id);
    loadTasks();
  };

  const handleDefer = async (minutes: number) => {
    if (!task) return;
    const deferUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await api.tasks.defer(task.id, deferUntil);
    setShowDefer(false);
    loadTasks();
  };

  const handleNowMode = async () => {
    if (!task) return;
    await api.tasks.nowMode(task.id, 25);
    loadTasks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-tertiary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 relative h-full">
      <h1 className="font-[family-name:var(--font-display)] text-xl mb-5 text-text-primary">
        {getGreeting()}
      </h1>

      {task ? (
        <>
          {/* Main task card */}
          <div
            className={`bg-bg-surface rounded-[var(--radius-card)] border-l-[6px] ${DOMAIN_BORDER_COLORS[task.domain]} min-h-[42vh] flex flex-col`}
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <div className="p-6 flex-1">
              <p className="text-xs uppercase tracking-wide text-text-tertiary mb-2">
                {task.domain.toLowerCase()}
              </p>
              <h2 className="text-xl font-medium mb-3 line-clamp-3">{task.title}</h2>
              {task.firstStep && (
                <p className="text-text-secondary italic text-sm">
                  Start here: {task.firstStep}
                </p>
              )}
              <button
                onClick={() => navigate(`/task/${task.id}`)}
                className="text-text-tertiary text-xs mt-3 hover:text-accent transition-colors duration-150"
              >
                view details &rarr;
              </button>
            </div>
            <div className="flex items-center border-t border-bg-secondary px-2">
              <button
                onClick={handleComplete}
                className="press-target tap-target flex-1 py-4 text-center text-accent font-semibold hover:bg-bg-secondary transition-colors duration-150 rounded-bl-[var(--radius-card)]"
              >
                &#10003; Done
              </button>
              <button
                onClick={() => setShowDefer(true)}
                className="press-target tap-target flex-1 py-4 text-center text-text-secondary hover:bg-bg-secondary transition-colors duration-150"
              >
                &rarr; Not yet
              </button>
              <button
                onClick={handleNowMode}
                className="press-target tap-target flex-1 py-4 text-center font-semibold text-white bg-accent hover:bg-accent-hover transition-colors duration-150 rounded-br-[var(--radius-card)] now-mode-btn"
              >
                &#9889; Let's Gooooo
              </button>
            </div>
          </div>

          {/* Coming up */}
          {upcomingTasks.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-widest text-text-tertiary mb-2">
                Coming up
              </p>
              <div className="space-y-1.5">
                {upcomingTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/task/${t.id}`)}
                    className="press-target w-full text-left flex items-center gap-2.5 py-2.5 px-3 rounded-lg hover:bg-bg-surface transition-colors duration-150"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${DOMAIN_DOT_COLORS[t.domain]}`}
                    />
                    <span className="text-sm text-text-primary truncate">{t.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {upcomingTasks.length === 0 && (
            <p className="text-text-tertiary text-sm text-center mt-6">
              That's everything for now.
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-secondary mb-4">
            You're all clear right now. Add something or just rest.
          </p>
          <button
            onClick={() => navigate("/capture")}
            className="press-target tap-target px-6 py-3 bg-accent text-white rounded-[var(--radius-button)] hover:bg-accent-hover transition-colors duration-150"
          >
            Add a task
          </button>
        </div>
      )}

      {/* Feeling log floating button */}
      <button
        onClick={() => navigate("/feel")}
        className="press-target fixed bottom-20 right-4 bg-bg-surface text-text-secondary text-xs px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:text-accent transition-all duration-150 z-10"
      >
        How are you feeling?
      </button>

      {/* Defer bottom sheet */}
      {showDefer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowDefer(false)}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="relative bg-bg-surface rounded-t-2xl w-full max-w-lg p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-text-primary mb-4">
              Come back to this...
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "In 30 min", minutes: 30 },
                { label: "In 2 hours", minutes: 120 },
                { label: "Tomorrow morning", minutes: 60 * 14 },
                { label: "Next week", minutes: 60 * 24 * 7 },
              ].map((opt) => (
                <button
                  key={opt.minutes}
                  onClick={() => handleDefer(opt.minutes)}
                  className="press-target tap-target py-3 bg-bg-secondary rounded-[var(--radius-button)] text-sm text-text-primary hover:bg-bg-primary transition-colors duration-150"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDefer(false)}
              className="mt-4 w-full text-center text-text-tertiary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
