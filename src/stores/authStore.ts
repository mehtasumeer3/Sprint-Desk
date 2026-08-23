import { create } from 'zustand';
import type { AuthResponse, AuthUser } from '../types';

const REFRESH_KEY = 'sprintdesk-refresh-token';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: 'checking' | 'authenticated' | 'unauthenticated';
  setSession: (data: AuthResponse) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  setStatus: (status: AuthState['status']) => void;
};

function toUser(data: AuthResponse): AuthUser {
  const { id, username, email, firstName, lastName, image } = data;
  return { id, username, email, firstName, lastName, image };
}

export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'checking',
  setSession: (data) => {
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    set({ user: toUser(data), accessToken: data.accessToken, status: 'authenticated' });
  },
  updateTokens: (accessToken, refreshToken) => {
    localStorage.setItem(REFRESH_KEY, refreshToken);
    set({ accessToken });
  },
  clearSession: () => {
    localStorage.removeItem(REFRESH_KEY);
    set({ user: null, accessToken: null, status: 'unauthenticated' });
  },
  setStatus: (status) => set({ status }),
}));
