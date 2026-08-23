import { useEffect, type ReactNode } from 'react';
import { refreshSession } from '../../api/authService';
import { getStoredRefreshToken, useAuthStore } from '../../stores/authStore';
import { FullScreenLoader } from '../../components/ui/Skeleton';

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);
  const clearSession = useAuthStore((s) => s.clearSession);
  useEffect(() => {
    let active = true;
    const token = getStoredRefreshToken();
    if (!token) { setStatus('unauthenticated'); return; }
    refreshSession(token).then((data) => active && setSession(data)).catch(() => active && clearSession());
    return () => { active = false; };
  }, [clearSession, setSession, setStatus]);
  if (status === 'checking') return <FullScreenLoader />;
  return <>{children}</>;
}
