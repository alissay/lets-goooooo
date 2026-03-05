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

const DOMAIN_COLORS: Record<string, string> = {
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

// TODO: Replace with actual user ID from auth
const USER_ID = "seed-user";

export function RightNow() {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.tasks.current(USER_ID).then((t) => {
      setTask(t as Task | null);
      setLoading(false);
    });
  }, []);

  const handleComplete = async () => {
    if (!task) return;
    await api.tasks.complete(task.id);
    const next = (await api.tasks.current(USER_ID)) as Task | null;
    setTask(next);
  };

  const handleDefer = async (minutes: number) => {
    if (!task) return;
    const deferUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await api.tasks.defer(task.id, deferUntil);
    const next = (await api.tasks.current(USER_ID)) as Task | null;
    setTask(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-tertiary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl mb-8 text-text-primary">
        {getGreeting()}
      </h1>

      {task ? (
        <div className="bg-bg-surface rounded-[var(--radius-card)] shadow-sm overflow-hidden">
          <div className={`${DOMAIN_COLORS[task.domain]} h-1`} />
          <div className="p-6">
            <p className="text-xs uppercase tracking-wide text-text-tertiary mb-2">
              {task.domain.toLowerCase()}
            </p>
            <h2 className="text-xl font-medium mb-3">{task.title}</h2>
            {task.firstStep && (
              <p className="text-text-secondary italic text-sm">
                Start here: {task.firstStep}
              </p>
            )}
          </div>
          <div className="flex border-t border-bg-secondary">
            <button
              onClick={handleComplete}
              className="tap-target flex-1 py-4 text-center text-accent font-medium hover:bg-bg-secondary transition-colors duration-150"
            >
              Done
            </button>
            <button
              onClick={() => handleDefer(120)}
              className="tap-target flex-1 py-4 text-center text-text-secondary hover:bg-bg-secondary transition-colors duration-150 border-l border-bg-secondary"
            >
              Not yet
            </button>
            <button
              onClick={() => navigate(`/task/${task.id}`)}
              className="tap-target flex-1 py-4 text-center text-text-secondary hover:bg-bg-secondary transition-colors duration-150 border-l border-bg-secondary"
            >
              Details
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-secondary mb-4">
            You're all clear right now. Add something or just rest.
          </p>
          <button
            onClick={() => navigate("/capture")}
            className="tap-target px-6 py-3 bg-accent text-white rounded-[var(--radius-button)] hover:bg-accent-hover transition-colors duration-150"
          >
            Add a task
          </button>
        </div>
      )}
    </div>
  );
}
