import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const isElectron = !!(window as any).electronAPI?.isElectron;

const DOMAINS = [
  { key: "work", label: "Work", color: "bg-domain-work" },
  { key: "fitness", label: "Fitness", color: "bg-domain-fitness" },
  { key: "nutrition", label: "Nutrition", color: "bg-domain-nutrition" },
  { key: "habits", label: "Habits", color: "bg-domain-habits" },
  { key: "admin", label: "Admin", color: "bg-domain-admin" },
];

export function Layout() {
  const [showDomains, setShowDomains] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Now" },
    { to: "/today", label: "Today" },
    { to: "/capture", label: "+", isFab: true },
    { to: "/domains", label: "Domains", action: () => setShowDomains(true) },
    { to: "/feel", label: "Feel" },
  ];

  return (
    <div className={`flex flex-col h-full ${isElectron ? "rounded-xl overflow-hidden" : ""}`}>
      {isElectron && (
        <div
          className="h-8 bg-bg-secondary/80 flex items-center justify-between px-3 shrink-0"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <span className="text-[10px] font-medium text-text-tertiary tracking-wider uppercase">
            lets goooooo
          </span>
          <div className="flex gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
            {[
              { to: "/", label: "Now" },
              { to: "/today", label: "Today" },
              { to: "/capture", label: "+" },
              { label: "Domains", action: () => setShowDomains(true) },
              { to: "/feel", label: "Feel" },
            ].map((item, i) =>
              item.action ? (
                <button
                  key={i}
                  onClick={item.action}
                  className="px-2 py-0.5 rounded text-[10px] text-text-secondary hover:text-text-primary transition-colors duration-150"
                >
                  {item.label}
                </button>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to!}
                  className={({ isActive }) =>
                    `px-2 py-0.5 rounded text-[10px] transition-colors duration-150 ${
                      isActive
                        ? "bg-accent text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </div>
        </div>
      )}

      <main className={`flex-1 overflow-y-auto ${isElectron ? "" : "pb-20"}`}>
        <Outlet />
      </main>

      {!isElectron && (
        <nav className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-bg-secondary z-20">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            {navItems.map((item) =>
              item.isFab ? (
                <button
                  key="fab"
                  onClick={() => navigate("/capture")}
                  className="press-target w-12 h-12 -mt-5 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg hover:bg-accent-hover transition-colors duration-150"
                >
                  +
                </button>
              ) : item.action ? (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="tap-target flex flex-col items-center justify-center text-xs text-text-secondary transition-colors duration-150"
                >
                  {item.label}
                </button>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to!}
                  className={({ isActive }) =>
                    `tap-target flex flex-col items-center justify-center text-xs transition-colors duration-150 ${
                      isActive ? "text-accent font-medium" : "text-text-secondary"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </div>
        </nav>
      )}

      {/* Domains bottom sheet */}
      {showDomains && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowDomains(false)}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="relative bg-bg-surface rounded-t-2xl w-full max-w-lg p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-text-primary mb-4">Domains</p>
            <div className="grid grid-cols-2 gap-3">
              {DOMAINS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => {
                    setShowDomains(false);
                    navigate(`/domains/${d.key}`);
                  }}
                  className="press-target tap-target flex items-center gap-3 py-4 px-4 bg-bg-secondary rounded-[var(--radius-card)] hover:bg-bg-primary transition-colors duration-150"
                >
                  <span className={`w-3 h-3 rounded-full ${d.color}`} />
                  <span className="text-sm font-medium text-text-primary">{d.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDomains(false)}
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
