import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function AppLayout({ children }: { children: ReactNode }) {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logoutUser();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
          <div className="font-semibold text-primary">
            CSV Reporting
          </div>

          <nav className="flex gap-4 text-sm">
            {[
              ["/", "Dashboard"],
              ["/imports", "Import"],
              ["/employees", "Mitarbeiter"],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive
                    ? "text-accent font-medium"
                    : "text-secondary hover:text-primary"
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="ml-auto text-sm text-secondary hover:text-primary"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
