# Notes Notebook

## Purpose

Add a profile-level notes flow where users can open all saved private notes without going through each problem workspace.

## Routes

- `/notes`: lists all problems where the logged-in user has saved a private note.
- `/notes/:slug`: shows the saved note, problem metadata, and latest submitted code for that problem.

The note routes intentionally do not live under `/profile`.

## Backend APIs Used

- `GET /me/notes`
- `GET /me/notes/:slug`

## Files

- `src/app/notes/page.tsx`
- `src/app/notes/[slug]/page.tsx`
- `src/features/auth/notes-page.tsx`
- `src/features/auth/note-detail-page.tsx`
- `src/features/auth/auth-api.ts`
- `src/features/auth/profile-page.tsx`
- `tests/notes-pages.spec.ts`

## Behavior

- Profile has a `View notes` link.
- `/notes` lists note-bearing problems only.
- Clicking a note opens `/notes/:slug`.
- The detail page shows the full private note and the latest submitted code for that problem.

## Verification

Ran `npm run quality`.
