import type { ReactNode } from "react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/employees", label: "Mitarbeiter" },
  { to: "/imports", label: "Import" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function onLogout() {
    await logoutUser();
    navigate("/login", { replace: true });
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Sticky + Glass Header */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/70 backdrop-blur supports-[backdrop-filter]:bg-surface/55">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
              <span className="text-accent font-bold">CSV</span>
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-primary text-base tracking-tight">
                CSV Reporting
              </div>
              <div className="text-xs text-secondary -mt-0.5">
                Schnell. Klar. Nachvollziehbar.
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center ml-6">
            <div className="inline-flex items-center gap-1 rounded-full bg-border/30 p-1 border border-border/60 shadow-sm">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    cn(
                      "relative px-4 py-2 rounded-full text-sm font-medium transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                      isActive
                        ? "bg-surface text-primary shadow-sm border border-border/70"
                        : "text-secondary hover:text-primary hover:bg-surface/60"
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              type="button"
              className={cn(
                "md:hidden inline-flex items-center justify-center",
                "h-10 w-10 rounded-xl border border-border/70 bg-surface/60",
                "text-secondary hover:text-primary hover:bg-surface transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              )}
              aria-label="Menü öffnen"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {/* Simple hamburger / close icon (no extra libs) */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <>
                    <path
                      d="M4 4L14 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 4L4 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    <path
                      d="M3 5H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 9H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 13H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
            </button>

            <button
              onClick={onLogout}
              className={cn(
                "inline-flex items-center gap-2",
                "h-10 px-4 rounded-xl border border-border/70 bg-surface/60",
                "text-sm text-secondary hover:text-primary hover:bg-surface transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              )}
            >
              Logout
              <span className="text-secondary/70">→</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <div className={cn("md:hidden overflow-hidden", mobileOpen ? "block" : "hidden")}>
          <div className="max-w-7xl mx-auto px-6 pb-4">
            <div className="mt-3 rounded-2xl border border-border/70 bg-surface/70 shadow-sm p-2">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-secondary hover:text-primary hover:bg-border/30"
                    )
                  }
                >
                  <span>{label}</span>
                  <span className="text-secondary/60">↵</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
