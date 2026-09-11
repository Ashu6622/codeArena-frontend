# Submission History

## Purpose

Add frontend pages for revisiting saved submissions after a user submits code.

## Routes

- `/submissions`: lists the current user's recent submissions.
- `/submissions/[id]`: shows one owned submission with the submitted source code.

## API

```http
GET /submissions?limit=20
GET /submissions/:id
```

Both requests use the shared API client, so the stored access token is sent as a Bearer token when present. If the access token has expired, the client attempts `POST /auth/refresh` and retries the request once.

## Files

- `src/features/submissions/submit-code-api.ts`: submission list/detail response types and React Query hooks.
- `src/features/submissions/submissions-page.tsx`: submission history UI.
- `src/features/submissions/submission-detail-page.tsx`: saved submission detail UI.
- `src/app/submissions/page.tsx`: history route.
- `src/app/submissions/[id]/page.tsx`: detail route.
- `src/features/problems/problem-workspace.tsx`: links to the latest submission detail and history page.
- `tests/submissions.spec.ts`: browser coverage for list, detail, auth errors, and hidden-data privacy.
- `tests/problem-workspace.spec.ts`: workspace link coverage after Submit.

## Behavior

The history page shows problem title, slug, language, verdict, runtime, and submitted time. The detail page shows verdict metadata and the saved source code for that attempt.

Hidden test case data is not rendered. The frontend only displays the fields returned by the backend read endpoints.

## Verification

`npm run quality`, `npm test`, and `npm run build` passed. Playwright covers history loading, detail loading, auth errors, hidden-data privacy, and workspace links to saved submissions.

## Next Step

Session refresh handling is documented in `session-management.md`. Next, add a profile/session provider when the UI needs current user metadata.
