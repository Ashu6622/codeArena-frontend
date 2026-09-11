# Run Code Integration

## Purpose

Connect the problem workspace Run button to the backend `POST /run` endpoint.

## API

```http
POST /run
```

The frontend sends:

```json
{
  "problemSlug": "two-sum",
  "language": "JAVASCRIPT",
  "code": "function twoSum(nums, target) { ... }"
}
```

## Files

- `src/features/execution/run-code-api.ts`: request/response types and `useRunCode()` mutation.
- `src/features/problems/problem-workspace.tsx`: enabled Run button and result rendering.
- `tests/problem-workspace.spec.ts`: mocked browser test coverage for the Run request and displayed sample results.

## Behavior

Run sends the current problem slug, selected language, and current editor code to the backend. While the request is pending, the button shows a running state. On success, the workspace displays the overall verdict, pass count, total runtime, and per-sample expected output, actual output, runtime, and error when present.

Editing the code, resetting the starter code, or changing language clears the previous run result so stale output is not shown.

Submit is now handled separately through `POST /submissions`; this Run flow stays sample-only.

## Verification

Run:

```bash
npm run quality
npm test
npm run build
```

The browser tests mock `POST /run`, so they can verify the frontend contract without requiring the backend server.

## Next Step

Judged submission integration is documented in `submit-code-integration.md`. Next, add submission history/detail screens.
