import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Win {
  id: string;
  title: string;
  domain: string;
  completedAt: string;
}

const DOMAIN_DOTS: Record<string, string> = {
  WORK: "bg-domain-work",
  FITNESS: "bg-domain-fitness",
  NUTRITION: "bg-domain-nutrition",
  HABITS: "bg-domain-habits",
  ADMIN: "bg-domain-admin",
};

const USER_ID = "seed-user";

export function Wins() {
  const [wins, setWins] = useState<Win[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    api.wins
      .list(USER_ID, filter || undefined)
      .then((w) => setWins(w as Win[]));
  }, [filter]);

  return (
    <div className="max-w-lg mx-auto px-5 pt-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl mb-6">
        Wins
      </h1>

      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs transition-colors duration-150 ${
            !filter ? "bg-accent text-white" : "bg-bg-secondary text-text-secondary"
          }`}
        >
          All
        </button>
        {Object.entries(DOMAIN_DOTS).map(([domain]) => (
          <button
            key={domain}
            onClick={() => setFilter(domain)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors duration-150 ${
              filter === domain ? "bg-accent text-white" : "bg-bg-secondary text-text-secondary"
            }`}
          >
            {domain.charAt(0) + domain.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {wins.length === 0 ? (
        <p className="text-text-tertiary text-center py-16">
          Your wins will show up here. Every completed task counts.
        </p>
      ) : (
        <div className="space-y-3">
          {wins.map((win) => (
            <div
              key={win.id}
              className="flex items-center gap-3 bg-bg-surface rounded-[var(--radius-card)] p-4"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${DOMAIN_DOTS[win.domain]}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{win.title}</p>
                <p className="text-text-tertiary text-xs">
                  {new Date(win.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
