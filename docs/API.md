# API Documentation

## DummyJSON Authentication

### POST `/auth/login`
Base: `https://dummyjson.com`

Request:
```json
{ "username": "emilys", "password": "emilyspass", "expiresInMins": 1 }
```
Response used by the app: user fields, `accessToken`, `refreshToken`.

### POST `/auth/refresh`
Request:
```json
{ "refreshToken": "<refresh-token>", "expiresInMins": 1 }
```
Used for boot-time session validation and 401 refresh/retry.

## JSONPlaceholder Notifications
### GET `/posts?_limit=5`
Base: `https://jsonplaceholder.typicode.com`
Polled every 15 seconds while the browser tab is visible. Previously seen post IDs are deduplicated.

## Local Mock Data
### GET `/mock-data.json`
Static Vite public asset. Access is centralized in `src/api/mockDataService.ts`. Provides users, sprints, tasks, comments, and initial notifications.
