# Leaderboard

## Purpose

Add a public leaderboard page so users can compare progress by accepted solutions.

## Route

- `/leaderboard`

The page is public. It fetches `GET /leaderboard?limit=50` and renders ranked users, solved count, accepted submission count, and latest accepted time.

## Files

- `src/features/leaderboard/leaderboard-api.ts`: leaderboard response types and `useLeaderboard()` query.
- `src/features/leaderboard/leaderboard-page.tsx`: leaderboard UI, top-three summary, empty state, and error state.
- `src/app/leaderboard/page.tsx`: route entry.
- `src/features/landing/landing-page.tsx`: desktop and mobile leaderboard navigation links.
- `src/features/auth/profile-page.tsx`: profile quick link to leaderboard.
- `tests/leaderboard.spec.ts`: Playwright coverage for ranked list, empty state, and backend errors.

## Behavior

The page shows a top-three summary when ranked users exist, then a full ranking list. If no accepted submissions exist, it shows an empty state that links back to problems.

## Verification

`npm run quality`, `npm test`, and `npm run build` passed. Playwright has 52 passing tests across desktop and mobile.
