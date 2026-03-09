import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const DOMAIN_META: Record<string, { label: string; bgColor: string; borderColor: string }> = {
  work: { label: "Work", bgColor: "bg-domain-work", borderColor: "border-l-domain-work" },
  fitness: { label: "Fitness", bgColor: "bg-domain-fitness", borderColor: "border-l-domain-fitness" },
  nutrition: { label: "Nutrition", bgColor: "bg-domain-nutrition", borderColor: "border-l-domain-nutrition" },
  habits: { label: "Habits", bgColor: "bg-domain-habits", borderColor: "border-l-domain-habits" },
  admin: { label: "Admin", bgColor: "bg-domain-admin", borderColor: "border-l-domain-admin" },
};

const USER_ID = "seed-user";

interface Task {
  id: string;
  title: string;
  firstStep: string | null;
  status: string;
  deferCount: number;
}

interface Goal {
  id: string;
  title: string;
  status: string;
}

export function DomainDashboard() {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const meta = domain ? DOMAIN_META[domain] : null;

  useEffect(() => {
    if (!domain) return;
    api.tasks.list(USER_ID, domain.toUpperCase()).then((t) => setTasks(t as Task[]));
    api.goals.list(USER_ID, domain.toUpperCase()).then((g) => setGoals(g as Goal[]));
  }, [domain]);

  if (!meta) return <p>Unknown domain</p>;

  const activeTasks = tasks.filter((t) => t.status !== "DONE");
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");

  return (
    <div>
      {/* Domain header band */}
      <div className={`${meta.bgColor} px-5 pt-10 pb-6 flex items-end justify-between`}>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">
            {meta.label}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/capture")}
          className="press-target w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white text-lg hover:bg-white/30 transition-colors duration-150"
        >
          +
        </button>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5">
        {/* Goals section */}
        {activeGoals.length > 0 && (
          <div className="mb-5">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-2 py-2 text-sm text-text-secondary"
              >
                <span className="text-text-tertiary">&#9670;</span>
                <span>{goal.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Task cards */}
        <div className="space-y-3">
          {activeTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => navigate(`/task/${task.id}`)}
              className={`press-target w-full text-left bg-bg-surface rounded-[var(--radius-card)] p-4 border-l-[6px] ${meta.borderColor} hover:shadow-sm transition-shadow duration-150`}
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <p className="font-medium">{task.title}</p>
              {task.firstStep && (
                <p className="text-text-tertiary text-sm mt-1 italic">
                  Start here: {task.firstStep}
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
          className="press-target tap-target mt-6 w-full py-3 border-2 border-dashed border-bg-secondary text-text-secondary rounded-[var(--radius-button)] hover:border-accent hover:text-accent transition-colors duration-150"
        >
          + Add task
        </button>
      </div>
    </div>
  );
}
