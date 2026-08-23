import type { AuthResponse } from '../types';

const BASE_URL = import.meta.env.VITE_DUMMYJSON_BASE_URL ?? 'https://dummyjson.com';

export async function login(username: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 1 }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? 'Invalid username or password.');
  }
  return (await response.json()) as AuthResponse;
}

export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, expiresInMins: 1 }),
  });
  if (!response.ok) throw new Error('Session refresh failed.');
  return (await response.json()) as AuthResponse;
}
