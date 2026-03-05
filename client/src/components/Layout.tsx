import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Now", icon: "+" },
  { to: "/capture", label: "Add", icon: "+" },
  { to: "/domains/work", label: "Work", icon: "W" },
  { to: "/wins", label: "Wins", icon: "W" },
  { to: "/feel", label: "Feel", icon: "F" },
];

export function Layout() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-bg-secondary">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `tap-target flex flex-col items-center justify-center text-xs transition-colors duration-150 ${
                  isActive ? "text-accent font-medium" : "text-text-secondary"
                }`
              }
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
