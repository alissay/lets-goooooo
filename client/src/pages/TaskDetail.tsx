import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface Task {
  id: string;
  title: string;
  firstStep: string | null;
  domain: string;
  status: string;
  breadcrumb: string | null;
  softDueAt: string | null;
  isNowMode: boolean;
  deferCount: number;
  createdAt: string;
}

const USER_ID = "seed-user";

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [decomposing, setDecomposing] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.tasks.list(USER_ID).then((tasks) => {
      const found = (tasks as Task[]).find((t) => t.id === id);
      setTask(found || null);
    });
  }, [id]);

  const handleDecompose = async () => {
    if (!id) return;
    setDecomposing(true);
    const result = await api.tasks.decompose(id);
    setMicroSteps(result.steps);
    setDecomposing(false);
  };

  const handleSetFirstStep = async (step: string) => {
    if (!id) return;
    await api.tasks.update(id, { firstStep: step });
    setTask((t) => (t ? { ...t, firstStep: step } : t));
  };

  const handleComplete = async () => {
    if (!id) return;
    await api.tasks.complete(id);
    navigate("/");
  };

  const handleDelete = async () => {
    if (!id) return;
    await api.tasks.delete(id);
    navigate(-1);
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-tertiary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="tap-target text-text-secondary mb-6 text-sm"
      >
        &larr; Back
      </button>

      <p className="text-xs uppercase tracking-wide text-text-tertiary mb-2">
        {task.domain.toLowerCase()}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-2xl mb-6">
        {task.title}
      </h1>

      {/* First step */}
      <div className="mb-6">
        <label className="text-sm text-text-secondary block mb-1">
          First step
        </label>
        <p className="text-text-primary italic">
          {task.firstStep || "Not set yet"}
        </p>
      </div>

      {/* Breadcrumb (work only) */}
      {task.domain === "WORK" && (
        <div className="mb-6">
          <label className="text-sm text-text-secondary block mb-1">
            Where did you leave off?
          </label>
          <p className="text-text-primary">
            {task.breadcrumb || "No notes yet"}
          </p>
        </div>
      )}

      {/* Decompose */}
      <button
        onClick={handleDecompose}
        disabled={decomposing}
        className="tap-target w-full py-3 mb-4 bg-bg-secondary text-text-primary rounded-[var(--radius-button)] hover:bg-bg-secondary/80 transition-colors duration-150 disabled:opacity-50"
      >
        {decomposing ? "Breaking it down..." : "Break this down further"}
      </button>

      {microSteps.length > 0 && (
        <div className="mb-6 space-y-2">
          {microSteps.map((step, i) => (
            <button
              key={i}
              onClick={() => handleSetFirstStep(step)}
              className="tap-target w-full text-left px-4 py-3 bg-bg-surface rounded-[var(--radius-button)] border border-bg-secondary hover:border-accent text-sm transition-colors duration-150"
            >
              {step}
            </button>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-text-tertiary space-y-1 mb-8">
        <p>Created {new Date(task.createdAt).toLocaleDateString()}</p>
        {task.deferCount > 0 && <p>Deferred {task.deferCount} time{task.deferCount !== 1 ? "s" : ""}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleComplete}
          className="tap-target flex-1 py-3 bg-accent text-white rounded-[var(--radius-button)] hover:bg-accent-hover transition-colors duration-150 font-medium"
        >
          Complete
        </button>
        <button
          onClick={handleDelete}
          className="tap-target px-6 py-3 text-text-tertiary hover:text-red-600 rounded-[var(--radius-button)] transition-colors duration-150"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
