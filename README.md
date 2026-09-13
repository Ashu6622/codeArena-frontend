# CodeArena Frontend

Next.js App Router + TypeScript frontend for CodeArena V1.

The frontend provides the landing page, authentication screens, problem library, Monaco coding workspace, run/submit flows, submission history, profile stats, leaderboard, discussions, bookmarks, private notes, and admin problem/tag screens.

## Prerequisites

- Node.js 24 or compatible current Node version
- npm
- Backend running on `http://localhost:4000`

## Environment

Create the frontend env file:

```bash
cp .env.example .env.local
```

Default value:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Fresh Setup

```bash
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:3001
```

The dev script is already configured with `next dev --port 3001`.

## Scripts

```bash
npm run dev           # start local dev server on port 3001
npm run build         # production build
npm run start         # start built Next.js app
npm run typecheck     # TypeScript typecheck
npm run lint          # ESLint
npm run format:check  # Prettier check
npm run quality       # typecheck + lint + format check
npm test              # Playwright tests
```

Playwright tests require a browser. If the browser is missing on a fresh machine, run:

```bash
npx playwright install
```

## Backend Dependency

The frontend calls the backend through `NEXT_PUBLIC_API_BASE_URL`.

For local development, run both apps:

```bash
# backend
cd /Users/ashtoshroy/Desktop/Personal-Project/CodeArena/codeArena-backend
npm run start:dev

# frontend
cd /Users/ashtoshroy/Desktop/Personal-Project/CodeArena/codeArena-frontend
npm run dev
```

## Quality Gate

```bash
npm run quality
npm test
npm run build
```

Current known warning: `postcss.config.mjs` may report an ESLint warning for anonymous default export. It is non-blocking because there are no lint errors.

## V1 User Flow

1. Open `http://localhost:3001`.
2. Register or login.
3. Browse the problem library.
4. Open a problem workspace.
5. Edit JavaScript in Monaco.
6. Run sample tests.
7. Submit to hidden tests.
8. View submission history and submission details.
9. Check profile stats and activity heatmap.

## Feature Docs

Feature-by-feature notes live in `docs/frontend`.
