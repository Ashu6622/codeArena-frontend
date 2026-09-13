# Auth Pages

## Purpose

Add the V1 frontend entry points for signing up and signing in to CodeArena.

## Routes

- `/signup`: creates a new account with `POST /auth/signup`.
- `/login`: signs in with `POST /auth/login`.
- `/logout`: signs out with `POST /auth/logout`, clears the local access token, and redirects to login.
- `/profile`: loads the current user with `GET /auth/me`.

## API Behavior

Signup sends `email`, `password`, and optional `name`. The backend creates the user and returns the public user profile. Signup does not issue an access token, so the UI shows a success state with a link to login.

Login sends `email` and `password`. On success, the backend returns an access token and sets the HttpOnly refresh cookie. The frontend stores the access token through the shared session helper under `codearena_access_token`, then routes the user back to the problems section.

Logout calls the backend logout endpoint, clears `codearena_access_token` on completion, and redirects to `/login`. The backend clears the HttpOnly refresh cookie when it exists, and the frontend still clears local auth state if the logout request fails. Visible logout links are available from the landing page navigation, mobile navigation, footer, and problem workspace header.

All auth POST requests use `credentials: include` so the refresh cookie can be stored by the browser.

## Files

- `src/app/(auth)/login/page.tsx`: login route.
- `src/app/(auth)/signup/page.tsx`: signup route.
- `src/app/logout/page.tsx`: logout route.
- `src/app/profile/page.tsx`: current user profile route.
- `src/features/auth/auth-layout.tsx`: shared auth page shell.
- `src/features/auth/login-page.tsx`: login form and mutation handling.
- `src/features/auth/signup-page.tsx`: signup form and success state.
- `src/features/auth/logout-page.tsx`: automatic logout screen and redirect.
- `src/features/auth/profile-page.tsx`: current user profile UI.
- `src/features/problems/problem-workspace.tsx`: workspace header logout link.
- `src/features/auth/auth-api.ts`: auth request/response types and React Query mutations.
- `src/lib/auth-session.ts`: shared access-token storage and auth-state notifications.
- `src/lib/api-client.ts`: JSON POST support, API error messages, credentialed requests, Bearer tokens, and refresh retry.
- `src/features/landing/landing-page.tsx`: navigation links to login, signup, and logout.
- `tests/auth.spec.ts`: mocked browser coverage for login, signup, logout, and profile flows.

## Validation

The frontend uses browser-level required fields, email input validation, and a 15-character minimum on signup passwords to match the backend signup DTO. Backend validation remains the source of truth.

## Verification

Run:

```bash
npm run quality
npm test
npm run build
```

The auth tests mock backend responses so they do not require the NestJS API to be running.

## Current Limitations

Automatic refresh retry is documented in `session-management.md`. There is not yet a full profile/session provider for rendering the current user email, role, or admin-only navigation.
