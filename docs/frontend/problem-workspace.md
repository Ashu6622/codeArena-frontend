# Problem Workspace

## Purpose

Add the real V1 problem workspace page, connect it to the backend problem-detail endpoint, and provide the editor shell for running sample cases.

## Route

```text
/problems/[slug]
```

Example:

```text
/problems/two-sum
```

## API

The page calls:

```http
GET /problems/:slug
POST /run
```

The response is expected to include published problem metadata, description, limits, supported language starter code, function signature, and sample test cases only. Hidden test cases remain backend-only.

## Files

- `src/app/problems/[slug]/page.tsx`: App Router dynamic route.
- `src/features/problems/problem-workspace.tsx`: workspace UI and detail loading state.
- `src/features/problems/problems-api.ts`: `ProblemDetail` types and `useProblem(slug)` query.
- `src/features/landing/landing-page.tsx`: problem rows now link to `/problems/<slug>`.
- `src/features/execution/run-code-api.ts`: Run mutation types and `useRunCode()`.
- `tests/problem-workspace.spec.ts`: browser coverage for success, unavailable states, and sample Run output.
- `tests/landing.spec.ts`: updated landing assertions for workspace links.

## Behavior

The workspace displays problem title, difficulty, time limit, memory limit, description, sample test cases, language selector, function signature, and editable starter code.

The Reset button restores the starter code for the selected language. Run sends the current code to `POST /run` and displays sample-case results. Submit remains visible but disabled because judged submissions are the next V1 step.

## Verification

Run:

```bash
npm run quality
npm test
npm run build
```

The workspace browser tests mock backend responses, so they do not require the NestJS API to be running.

## Next Step

Build the judged submission flow: hidden test execution, submission persistence, and submission history.
