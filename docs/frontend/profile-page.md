# Profile Page

## Purpose

Add the first frontend account page backed by `GET /auth/me`.

## Route

```http
/profile
```

## API

```http
GET /auth/me
```

The request uses the shared API client, so it includes the stored Bearer token and can recover through the refresh-token retry flow when the access token has expired.

## Behavior

The page shows the current user's display name, email, role, joined timestamp, submission activity heatmap, and quick links to submissions, problems, and logout.

## Submission Activity

The activity heatmap uses `GET /submissions/activity?days=365`. Each square represents one day. Empty days use a muted cell, and submitted days become darker green as the count increases. Hovering or focusing a day shows the exact submission count and date.

When the profile request still returns HTTP 401 after refresh fails, the page clears local auth state through the API client and shows a login-required state with a link to `/login`.

Logged-in landing navigation now includes Profile, Submissions, and Logout.

## Files

- `src/features/auth/auth-api.ts`: `useMe()` query and auth query key.
- `src/features/auth/profile-page.tsx`: profile UI, activity placement, and login-required fallback.
- `src/features/submissions/submission-activity-heatmap.tsx`: daily activity graph with hover/focus count labels.
- `src/app/profile/page.tsx`: profile route.
- `src/features/landing/landing-page.tsx`: logged-in Profile link.
- `src/features/problems/problem-workspace.tsx`: Profile link in workspace header.
- `src/features/submissions/submissions-page.tsx`: Profile link in history header.
- `src/features/submissions/submission-detail-page.tsx`: Profile link in detail header.
- `tests/auth.spec.ts`: profile success and login-required coverage.

## Verification

`npm run quality`, `npm test`, and `npm run build` passed. Playwright covers profile loading, Bearer auth header, displayed user fields, activity totals, day count tooltip/focus label, quick links, and login-required fallback after refresh failure.

## Next Step

Use the profile role to build admin-only problem creation UI when the backend admin endpoint is ready to expose in the frontend.
