# SprintDesk Architecture

## Overview
SprintDesk is a React single-page application with route-level code splitting. It deliberately separates server state, client state, and local UI state.

## Data flow

```text
UI components
  ↓
Feature hooks / TanStack Query
  ↓
Service & API layer
  ↓
mock-data.json | DummyJSON | JSONPlaceholder
```

- **TanStack Query:** server/request lifecycle, caching, polling and loading/error states.
- **Zustand:** authenticated session metadata, persistent Kanban state, notifications, theme, and toast UI state.
- **Local component state:** modal/drawer visibility, form inputs and filters.

## Authentication
The access token is kept in memory. The refresh token is stored in localStorage as the assignment-requested browser persistence simulation. On boot, SprintDesk validates the refresh token before rendering protected routes. `createAuthFetch` attaches the bearer token, refreshes after a 401, and retries the failed request once.

## Board
`mock-data.json` is read only through `mockDataService`. The first 30 tasks seed the persisted board store. Mutations are client-side because the supplied mock JSON is static; this is intentionally isolated behind store/service boundaries so a writable backend can replace it later.

## Performance
- Route-level `React.lazy` + `Suspense`
- React Query cache defaults
- Memoized task cards and derived analytics
- Lazy-loaded avatar images
- Polling stops while the tab is hidden
