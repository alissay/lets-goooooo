import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const FEELINGS = [
  { state: "CRASHED", emoji: "\uD83D\uDD34", label: "Crashed", bg: "bg-feeling-crashed" },
  { state: "ROUGH", emoji: "\uD83D\uDFE0", label: "Rough", bg: "bg-feeling-rough" },
  { state: "OKAY", emoji: "\uD83D\uDFE1", label: "Okay", bg: "bg-feeling-okay" },
  { state: "GOOD", emoji: "\uD83D\uDFE2", label: "Good", bg: "bg-feeling-good" },
  { state: "ON_FIRE", emoji: "\u2728", label: "On fire", bg: "bg-feeling-onfire" },
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
      <div className="flex items-center justify-center h-full animate-fade-in">
        <p className="text-text-secondary text-lg">Logged &#10003;</p>
      </div>
    );
  }

  // Step 1: State selection
  if (!selected) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-12">
        <h1 className="font-[family-name:var(--font-display)] text-2xl mb-8">
          How are you feeling?
        </h1>
        <div className="space-y-3">
          {FEELINGS.map((f) => (
            <button
              key={f.state}
              onClick={() => setSelected(f.state)}
              className={`press-target tap-target w-full flex items-center gap-4 p-5 rounded-2xl ${f.bg} text-white text-left hover:opacity-90 transition-opacity duration-150`}
            >
              <span className="text-3xl">{f.emoji}</span>
              <span className="text-lg font-medium">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Optional context
  const selectedFeeling = FEELINGS.find((f) => f.state === selected);

  return (
    <div className="max-w-lg mx-auto px-5 pt-12">
      <button
        onClick={() => setSelected(null)}
        className="text-text-tertiary text-sm mb-4 hover:text-text-secondary transition-colors duration-150"
      >
        &larr; Change
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{selectedFeeling?.emoji}</span>
        <span className="text-lg font-medium">{selectedFeeling?.label}</span>
      </div>

      <p className="text-sm text-text-tertiary mb-3">What's this about?</p>
      <div className="flex gap-2 flex-wrap mb-6">
        {DOMAINS.map((d) => (
          <button
            key={d.label}
            onClick={() => setDomainContext(d.value)}
            className={`press-target px-4 py-2 rounded-full text-sm transition-colors duration-150 ${
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
        placeholder="anything else..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="w-full bg-bg-surface border border-bg-secondary rounded-[var(--radius-input)] p-3 text-sm resize-none focus:outline-none focus:border-accent transition-colors duration-150 mb-6"
      />

      <button
        onClick={handleSubmit}
        className="press-target tap-target w-full py-3 bg-accent text-white rounded-[var(--radius-button)] hover:bg-accent-hover transition-colors duration-150 font-medium"
      >
        Logged &#10003;
      </button>
    </div>
  );
}
