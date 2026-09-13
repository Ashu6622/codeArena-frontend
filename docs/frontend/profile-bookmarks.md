# Profile Saved Problems

## What was added

- Added a React Query hook for `GET /me/bookmarks`.
- Added a Saved problems section to `/profile`.
- Saved problem rows provide direct actions for `/problems/:slug` and `/problems/:slug/notes`.
- Empty, loading, and error states are handled in the profile layout.

## Displayed fields

- Problem title and workspace link.
- Private note link.
- Difficulty.
- Progress status.
- Tags.
- Bookmark creation date.

## Verification

- Playwright profile coverage now verifies the saved problems request, auth header, saved count, workspace link, private note link, and displayed metadata.
