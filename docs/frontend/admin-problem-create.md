# Admin Problem Management

## Purpose

Add admin-only frontend surfaces for creating, listing, and editing CodeArena problems.

## Routes

- `/admin/problems`: admin problem list with draft/published state, filters, counts, edit/open actions, and unpublish for published problems.
- `/admin/problems/new`: create a new problem.
- `/admin/problems/[slug]/edit`: edit an existing problem, including hidden test cases.

Each route checks the current session with `GET /auth/me`. Only users with role `ADMIN` can access the admin UI. Normal users see an admin access message, and expired sessions are sent back to login.

## API

- `GET /admin/problems`
- `GET /admin/problems/:slug`
- `POST /admin/problems`
- `PATCH /admin/problems/:slug`
- `PATCH /admin/problems/:slug/archive`

The API client attaches the stored Bearer access token and uses the existing refresh-token retry flow on expired access tokens.

## Files

- `src/features/problems/admin-problems-api.ts`: admin list/detail/create/update request and response types.
- `src/features/problems/admin-problems-page.tsx`: admin management list UI.
- `src/features/problems/admin-problem-form-page.tsx`: create problem form.
- `src/features/problems/admin-problem-edit-page.tsx`: edit problem form loaded from admin detail data.
- `src/app/admin/problems/page.tsx`: admin list route.
- `src/app/admin/problems/new/page.tsx`: create route.
- `src/app/admin/problems/[slug]/edit/page.tsx`: edit route.
- `src/lib/api-client.ts`: shared `apiPatch()` helper and boolean query param support.
- `src/features/auth/profile-page.tsx`: admin-only quick link to problem management.
- `tests/admin-problems.spec.ts`: Playwright coverage for create, list, edit, non-admin guard, and expired-session guard.

## Behavior

Admins can create and edit a problem with title, slug, description, difficulty, limits, publish status, language starter code, function signature, optional execution template, sample cases, and hidden cases.

The admin list shows drafts as well as published problems. Published problems can be opened from the list or unpublished without deleting their submissions.

The forms require at least one sample case and one hidden case before sending the request, matching the backend validation rules.

## Verification

`npm run quality`, `npm test`, and `npm run build` passed. Playwright has 46 passing tests across desktop and mobile.
