# Session Management

## Purpose

Keep authenticated frontend requests working after the short-lived access token expires.

## Behavior

The shared API client attaches the current access token from `localStorage` to requests as a Bearer token. When a non-auth endpoint returns HTTP 401, the client calls `POST /auth/refresh` with credentials enabled. If refresh succeeds, the new access token is stored and the original request is retried once.

If refresh fails, the local access token is cleared and the original request returns its 401 error to the caller. Protected pages render a login prompt instead of a raw error.

Auth endpoints are not retried through refresh:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`

## Auth-Aware Navigation

The landing page reads the shared auth session state. Logged-out users see Login and Create account. Logged-in users see Submissions, Logout, and View submissions.

Session changes dispatch a browser event after localStorage updates so visible navigation can update in the current tab.

## Files

- `src/lib/auth-session.ts`: shared access-token storage helpers and auth-state subscription.
- `src/lib/api-client.ts`: Bearer token attachment, refresh request, one-time retry, and token clearing on failed refresh.
- `src/features/auth/auth-api.ts`: login stores tokens through shared helpers; logout clears them through shared helpers.
- `src/features/landing/landing-page.tsx`: auth-aware navigation.
- `src/features/submissions/submissions-page.tsx`: login-required state for protected history.
- `src/features/submissions/submission-detail-page.tsx`: login-required state for protected details.
- `tests/submissions.spec.ts`: refresh retry and failed-refresh login prompt coverage.
- `tests/landing.spec.ts`: logged-in and logged-out navigation coverage.

## Verification

Pending: run `npm run quality`, `npm test`, and `npm run build` after formatting.

## Next Step

Add a small profile/session provider when the app needs the current user's email, role, or admin-only navigation.
