# Problem Notes and Discussions Pages

## Purpose

Add dedicated pages for problem-specific discussion and private notes instead of only showing both inside the main coding workspace.

## Routes

- `/problems/:slug/discussions`: shows all comments for one problem and lets logged-in users post a comment.
- `/problems/:slug/notes`: shows and edits the logged-in user's private note for one problem.

## Backend APIs Used

- `GET /problems/:slug/comments`
- `POST /problems/:slug/comments`
- `GET /problems/:slug/note`
- `PUT /problems/:slug/note`

## Files

- `src/app/problems/[slug]/discussions/page.tsx`
- `src/app/problems/[slug]/notes/page.tsx`
- `src/features/problems/problem-discussions-page.tsx`
- `src/features/problems/problem-note-page.tsx`
- `src/features/problems/problem-workspace.tsx`
- `tests/problem-side-pages.spec.ts`
- `tests/problem-workspace.spec.ts`

## Behavior

- The workspace keeps compact notes and discussion panels.
- The workspace links to the full note and discussion pages.
- Discussion is readable publicly.
- Posting a discussion comment requires login.
- Private notes require login and are scoped to the current user.

## Verification

Ran `npx playwright test tests/problem-workspace.spec.ts tests/problem-side-pages.spec.ts`.
