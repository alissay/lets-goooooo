import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const FEELINGS = [
  { state: "CRASHED", emoji: "\uD83D\uDD34", label: "Crashed", color: "bg-feeling-crashed" },
  { state: "ROUGH", emoji: "\uD83D\uDFE0", label: "Rough", color: "bg-feeling-rough" },
  { state: "OKAY", emoji: "\uD83D\uDFE1", label: "Okay", color: "bg-feeling-okay" },
  { state: "GOOD", emoji: "\uD83D\uDFE2", label: "Good", color: "bg-feeling-good" },
  { state: "ON_FIRE", emoji: "\u2728", label: "On fire", color: "bg-feeling-onfire" },
] as const;

const DOMAINS = [
  { value: undefined, label: "General" },
  { value: "WORK", label: "Work" },
  { value: "FITNESS", label: "Fitness" },
  { value: "NUTRITION", label: "Nutrition" },
  { value: "HABITS", label: "Habits" },
  { value: "ADMIN", label: "Admin" },
] as const;

const USER_ID = "seed-user";

export function Feel() {
  const [selected, setSelected] = useState<string | null>(null);
  const [domainContext, setDomainContext] = useState<string | undefined>();
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selected) return;
    await api.feelings.log({
      type: "IN_THE_MOMENT",
      state: selected,
      note: note.trim() || undefined,
      domainContext,
      userId: USER_ID,
    });
    setSubmitted(true);
    setTimeout(() => navigate(-1), 1200);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary text-lg">Logged. Take care.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl mb-8">
        How are you feeling?
      </h1>

      <div className="flex justify-between mb-8">
        {FEELINGS.map((f) => (
          <button
            key={f.state}
            onClick={() => setSelected(f.state)}
            className={`tap-target flex flex-col items-center gap-1 p-3 rounded-[var(--radius-card)] transition-all duration-150 ${
              selected === f.state
                ? `${f.color} text-white scale-110`
                : "hover:bg-bg-secondary"
            }`}
          >
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-xs">{f.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="flex gap-2 flex-wrap mb-6">
            {DOMAINS.map((d) => (
              <button
                key={d.label}
                onClick={() => setDomainContext(d.value)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors duration-150 ${
                  domainContext === d.value
                    ? "bg-accent text-white"
                    : "bg-bg-secondary text-text-secondary"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Anything you want to note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full bg-bg-surface border border-bg-secondary rounded-[var(--radius-input)] p-3 text-sm resize-none focus:outline-none focus:border-accent transition-colors duration-150 mb-6"
          />

          <button
            onClick={handleSubmit}
            className="tap-target w-full py-3 bg-accent text-white rounded-[var(--radius-button)] hover:bg-accent-hover transition-colors duration-150 font-medium"
          >
            Log it
          </button>
        </>
      )}
    </div>
  );
}
