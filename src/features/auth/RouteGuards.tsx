import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
export function ProtectedRoute() { const authenticated = useAuthStore((s)=>s.status === 'authenticated'); return authenticated ? <Outlet/> : <Navigate to="/login" replace/>; }
export function GuestRoute() { const authenticated = useAuthStore((s)=>s.status === 'authenticated'); return authenticated ? <Navigate to="/dashboard" replace/> : <Outlet/>; }
