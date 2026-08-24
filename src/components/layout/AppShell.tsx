import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { NotificationBell } from "../notifications/NotificationBell";
import { NotificationPolling } from "../../features/notifications/NotificationPolling";
import { Button } from "../ui/Button";

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const links = [
    ["/dashboard", "Dashboard"],
    ["/board", "Board"],
    ["/analytics", "Analytics"],
  ] as const;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-100"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <NotificationPolling />

      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center px-3 sm:px-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            className="mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 md:hidden dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ☰
          </button>

          {/* Logo */}
          <NavLink
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex min-w-0 shrink-0 items-center gap-2 font-extrabold"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm text-white">
              S
            </span>

            <span className="whitespace-nowrap text-sm sm:text-base">
              SprintDesk
            </span>
          </NavLink>

          {/* Desktop navigation */}
          <nav
            className="ml-5 hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
            <NotificationBell />

            <Button
              variant="ghost"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-10 w-10 px-0"
            >
              {theme === "dark" ? "☀" : "◐"}
            </Button>

            {/* User information - desktop only */}
            <div className="hidden max-w-[190px] text-right lg:block">
              <div className="truncate text-sm font-semibold">
                {user?.firstName} {user?.lastName}
              </div>

              <div className="truncate text-xs text-slate-500">
                {user?.email}
              </div>
            </div>

            {/* IMPORTANT:
                Hide the WRAPPER instead of putting hidden on Button */}
            <div className="hidden md:block">
              <Button variant="secondary" onClick={clearSession}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-3 py-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
            <nav className="space-y-1">
              {links.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-100"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  clearSession();
                }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                Logout
              </button>
            </nav>

            {/* Mobile account details */}
            {user && (
              <div className="mt-3 border-t border-slate-200 px-3 pt-3 dark:border-slate-800">
                <div className="truncate text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </div>

                <div className="truncate text-xs text-slate-500">
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="mx-auto w-full min-w-0 max-w-[1600px] p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
