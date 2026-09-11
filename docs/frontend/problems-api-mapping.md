# Problems API Mapping

## Purpose

Connect the frontend problem collection to the backend `GET /problems` endpoint while keeping the landing playground usable during early V1 development.

## API

The first mapped endpoint is:

```http
GET /problems?limit=20&language=JAVASCRIPT&search=<query>
```

The frontend reads from `NEXT_PUBLIC_API_BASE_URL`, which defaults to `http://localhost:4000` for local development.

## Files

- `src/app/providers.tsx`: creates the React Query client and provider.
- `src/app/layout.tsx`: wraps the app with the provider.
- `src/config/env.ts`: exposes public frontend environment values.
- `src/lib/api-client.ts`: shared typed `GET` helper and API error type.
- `src/features/problems/problems-api.ts`: problem response types, query keys, and `useProblems()`.
- `src/features/landing/landing-page.tsx`: reads backend problems for the collection.
- `.env.example`: documents `NEXT_PUBLIC_API_BASE_URL`.
- `.env.local`: local ignored value for development.

## Behavior

The landing collection now requests published JavaScript problems from the backend. Backend rows are merged with the existing local preview metadata by slug, so seeded problems keep their richer topics, sample input, explanation, and sample solution on the landing playground.

If the backend is unavailable, the page falls back to the local preview problems. This keeps the landing page and Playwright tests usable while the API server is not running.

## Current Limitation

The list endpoint powers the landing collection, `GET /problems/:slug` powers the real problem workspace route, and `POST /run` powers sample execution from the editor. The landing playground still uses local preview details and local sample runners.

## Verification

Ran `npm run quality`, `npm test`, and `npm run build`. TypeScript, formatting, browser tests, and production build passed. ESLint reported the existing `postcss.config.mjs` anonymous default export warning, but no lint errors.
