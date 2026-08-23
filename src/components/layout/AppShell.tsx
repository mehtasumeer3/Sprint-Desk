import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { NotificationBell } from '../notifications/NotificationBell';
import { NotificationPolling } from '../../features/notifications/NotificationPolling';
import { Button } from '../ui/Button';

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s)=>s.user);
  const clearSession = useAuthStore((s)=>s.clearSession);
  const theme = useThemeStore((s)=>s.theme);
  const toggleTheme = useThemeStore((s)=>s.toggleTheme);
  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme === 'dark'); },[theme]);
  const links = [['/dashboard','Dashboard'],['/board','Board'],['/analytics','Analytics']] as const;
  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
    <NotificationPolling />
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <button className="rounded-lg p-2 md:hidden" onClick={()=>setMenuOpen((v)=>!v)} aria-label="Toggle navigation">☰</button>
        <NavLink to="/dashboard" className="flex items-center gap-2 font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">S</span><span>SprintDesk</span></NavLink>
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Primary navigation">{links.map(([to,label])=><NavLink key={to} to={to} className={({isActive})=>`rounded-lg px-3 py-2 text-sm font-medium ${isActive?'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-100':'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{label}</NavLink>)}</nav>
        <div className="ml-auto flex items-center gap-2"><NotificationBell/><Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">{theme==='dark'?'☀':'◐'}</Button><div className="hidden text-right sm:block"><div className="text-sm font-semibold">{user?.firstName} {user?.lastName}</div><div className="text-xs text-slate-500">{user?.email}</div></div><Button variant="secondary" onClick={clearSession}>Logout</Button></div>
      </div>
      {menuOpen && <nav className="border-t border-slate-200 p-3 md:hidden dark:border-slate-800">{links.map(([to,label])=><NavLink key={to} to={to} onClick={()=>setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm">{label}</NavLink>)}</nav>}
    </header>
    <main className="mx-auto max-w-[1600px] p-4 sm:p-6"><Outlet/></main>
  </div>;
}
