import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  work: { label: "Work", color: "text-domain-work" },
  fitness: { label: "Fitness", color: "text-domain-fitness" },
  nutrition: { label: "Nutrition", color: "text-domain-nutrition" },
  habits: { label: "Habits", color: "text-domain-habits" },
  admin: { label: "Admin", color: "text-domain-admin" },
};

const USER_ID = "seed-user";

interface Task {
  id: string;
  title: string;
  firstStep: string | null;
  status: string;
  deferCount: number;
}

export function DomainDashboard() {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const meta = domain ? DOMAIN_META[domain] : null;

  useEffect(() => {
    if (!domain) return;
    api.tasks
      .list(USER_ID, domain.toUpperCase())
      .then((t) => setTasks(t as Task[]));
  }, [domain]);

  if (!meta) return <p>Unknown domain</p>;

  const activeTasks = tasks.filter((t) => t.status !== "DONE");

  return (
    <div className="max-w-lg mx-auto px-5 pt-12">
      <h1 className={`font-[family-name:var(--font-display)] text-2xl mb-2 ${meta.color}`}>
        {meta.label}
      </h1>
      <p className="text-text-tertiary text-sm mb-8">
        {activeTasks.length} active task{activeTasks.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {activeTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => navigate(`/task/${task.id}`)}
            className="tap-target w-full text-left bg-bg-surface rounded-[var(--radius-card)] p-4 hover:shadow-sm transition-shadow duration-150"
          >
            <p className="font-medium">{task.title}</p>
            {task.firstStep && (
              <p className="text-text-tertiary text-sm mt-1 italic">
                {task.firstStep}
              </p>
            )}
          </button>
        ))}

        {activeTasks.length === 0 && (
          <p className="text-text-tertiary text-center py-8">
            No tasks here yet.
          </p>
        )}
      </div>

      <button
        onClick={() => navigate("/capture")}
        className="tap-target mt-6 w-full py-3 border-2 border-dashed border-bg-secondary text-text-secondary rounded-[var(--radius-button)] hover:border-accent hover:text-accent transition-colors duration-150"
      >
        + Add task
      </button>
    </div>
  );
}
