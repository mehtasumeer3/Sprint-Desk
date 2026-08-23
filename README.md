# SprintDesk — Sprint Management Dashboard

Production-oriented frontend assignment implementation using React, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, dnd-kit, Recharts, Vitest and React Testing Library.

## Features
- DummyJSON login, protected routes, in-memory access token, persisted refresh token, silent session restoration, logout
- Authenticated fetch interceptor with bearer token, refresh-on-401 and single retry
- Four-column Kanban board with keyboard/pointer dnd-kit sensors, cross-column movement and reordering
- Persisted board state, create/edit/delete tasks, task drawer, comments, dynamic counts
- Bonus priority/assignee filtering and undo last move
- Responsive analytics: sprint velocity, task status, priority breakdown and completion trend, all derived from live board data
- Reusable Button, Input, Select, Modal, Toast, DataTable and Skeleton components built from scratch
- Simulated real-time notifications using JSONPlaceholder polling, unread state, pagination, persistence and visibility-aware polling
- Persistent light/dark theme
- Route-level lazy loading and focused memoization
- Required unit tests

## Tech requirements mapping
| Requirement | Implementation |
|---|---|
| React 18+ / Vite / strict TypeScript | Yes |
| TanStack Query v5 | API data, auth mutation, polling |
| Zustand | auth, board, notifications, theme, toast |
| Tailwind CSS v3+ | Yes; no external UI component library |
| React Router v6+ | `/login`, `/dashboard`, `/board`, `/analytics` |
| Recharts | Analytics |
| `@dnd-kit/core` | Board DnD |
| Vitest + RTL | Required unit tests |

## Local setup
```bash
npm install
cp .env.example .env
npm run dev
```
Open the local Vite URL. DummyJSON public test credentials are prefilled on the login page for reviewer convenience.

### Production build
```bash
npm run build
npm run preview
```

### Tests
```bash
npm run test
```

## Environment variables
```env
VITE_DUMMYJSON_BASE_URL=https://dummyjson.com
VITE_JSONPLACEHOLDER_BASE_URL=https://jsonplaceholder.typicode.com
```
No secrets are required.

## Data & architecture
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/API.md`](docs/API.md).

The provided `mock-data.json` is copied unchanged to `public/mock-data.json` and treated as a temporary backend. Components never fetch it directly; all access goes through the service layer.

## Assumptions & limitations
1. The provided JSON is a static asset and cannot accept writes. Task/comment mutations therefore persist in Zustand/localStorage to simulate client-side persistence. The service/store separation allows migration to real endpoints without restructuring UI components.
2. DummyJSON is a public demo API. Browser localStorage refresh-token persistence is used only because the assignment explicitly requests a local-storage simulation; a production application should prefer secure, httpOnly cookies where backend architecture allows it.
3. Notification polling uses JSONPlaceholder's fixed posts. Seen post IDs are persisted and deduplicated, so the same five posts do not repeatedly appear as new notifications.
4. Lighthouse results vary by machine/network. The app is built to support the requested thresholds, but final scores should be verified on the deployed URL before submission.
5. Optional Storybook, axe-core automation, date-range analytics filtering and PNG export were intentionally omitted in favor of completing and testing core requirements reliably.

## Accessibility
- Semantic labels for forms and controls
- Keyboard-operable navigation and modal dismissal
- KeyboardSensor for board dragging
- Focus-visible treatment
- Meaningful avatar alt text
- Responsive layout including 375px viewport behavior

## Deployment
Recommended: Vercel or Netlify. Build command: `npm run build`; output directory: `dist`.

## Reviewer demo flow
1. Login and refresh the page to demonstrate session restoration.
2. Open Board; drag a task within and across columns, refresh to prove persistence.
3. Create, edit, comment on and delete a task.
4. Filter by priority/assignee and use Undo move.
5. Open Analytics and demonstrate charts changing after board changes.
6. Open notification bell; wait for polling, mark items read/all read.
7. Toggle dark theme and resize to a 375px viewport.
8. Run `npm run test` and show passing tests.
# Sprint-Desk
