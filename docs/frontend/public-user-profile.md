# Public User Profile

## What was added

- Added `/users/:id` frontend route.
- Added React Query hook for `GET /users/:id/public-profile`.
- Leaderboard top cards and table rows now link to public profiles.
- Public profile displays joined date, arena stats, and recently solved problems.

## Privacy

- The public profile UI does not display email.
- It only renders the safe data returned by the backend public profile endpoint.

## Verification

- Playwright coverage checks leaderboard profile links and direct public profile rendering.
