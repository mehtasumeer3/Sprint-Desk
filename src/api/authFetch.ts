import { refreshSession } from './authService';

type TokenAccess = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onRefreshed: (accessToken: string, refreshToken: string) => void;
  onAuthFailure: () => void;
};

export function createAuthFetch(tokens: TokenAccess) {
  return async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const execute = (token: string | null) =>
      fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

    let response = await execute(tokens.getAccessToken());
    if (response.status !== 401) return response;

    const refreshToken = tokens.getRefreshToken();
    if (!refreshToken) {
      tokens.onAuthFailure();
      return response;
    }

    try {
      const refreshed = await refreshSession(refreshToken);
      tokens.onRefreshed(refreshed.accessToken, refreshed.refreshToken);
      response = await execute(refreshed.accessToken);
      return response;
    } catch {
      tokens.onAuthFailure();
      return response;
    }
  };
}
