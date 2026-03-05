import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const DOMAINS = [
  { value: "WORK", label: "Work", color: "bg-domain-work" },
  { value: "FITNESS", label: "Fitness", color: "bg-domain-fitness" },
  { value: "NUTRITION", label: "Nutrition", color: "bg-domain-nutrition" },
  { value: "HABITS", label: "Habits", color: "bg-domain-habits" },
  { value: "ADMIN", label: "Admin", color: "bg-domain-admin" },
] as const;

const USER_ID = "seed-user";

export function Capture() {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState<string>("WORK");
  const [firstStep, setFirstStep] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    await api.tasks.create({
      title: title.trim(),
      domain,
      firstStep: firstStep.trim() || undefined,
      userId: USER_ID,
    });

    navigate("/");
  };

  return (
    <div className="max-w-lg mx-auto px-5 pt-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl mb-8">
        Capture
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          autoFocus
          type="text"
          placeholder="What needs to happen?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim()) handleSubmit();
          }}
          className="w-full text-lg bg-transparent border-b-2 border-bg-secondary focus:border-accent outline-none pb-3 placeholder:text-text-tertiary transition-colors duration-150"
        />

        <div className="flex gap-2 flex-wrap">
          {DOMAINS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDomain(d.value)}
              className={`tap-target px-4 py-2 rounded-full text-sm transition-all duration-150 ${
                domain === d.value
                  ? `${d.color} text-white`
                  : "bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="What's the first tiny step? (optional)"
          value={firstStep}
          onChange={(e) => setFirstStep(e.target.value)}
          className="w-full bg-transparent border-b border-bg-secondary focus:border-accent outline-none pb-3 placeholder:text-text-tertiary text-sm transition-colors duration-150"
        />

        <button
          type="submit"
          disabled={!title.trim()}
          className="tap-target w-full py-3 bg-accent text-white rounded-[var(--radius-button)] hover:bg-accent-hover disabled:opacity-40 transition-all duration-150 font-medium"
        >
          Add
        </button>
      </form>
    </div>
  );
}
