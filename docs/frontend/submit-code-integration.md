# Submit Code Integration

## Purpose

Connect the problem workspace Submit button to the backend `POST /submissions` endpoint.

## API

```http
POST /submissions
```

The frontend sends the current problem slug, selected language, and editor code:

```json
{
  "problemSlug": "two-sum",
  "language": "JAVASCRIPT",
  "code": "function twoSum(nums, target) { ... }"
}
```

The shared API client attaches the stored access token as a Bearer token when the user has logged in.

## Files

- `src/features/submissions/submit-code-api.ts`: request/response types and `useSubmitCode()` mutation.
- `src/lib/api-client.ts`: localStorage access-token header support.
- `src/features/problems/problem-workspace.tsx`: enabled Submit button and judged result rendering.
- `tests/problem-workspace.spec.ts`: mocked browser test coverage for the Submit request, auth header, saved verdict, and hidden-case privacy.

## Behavior

Submit sends the current editor code to the backend for full judging. While the request is pending, the button shows a submitting state and Run is disabled. On success, the workspace displays the final verdict, total passed count, runtime, saved submission status, sample-case details, and hidden-case aggregate counts.

Hidden test case details are not displayed by the UI. The frontend only renders what the backend returns: hidden passed count and hidden total count.

Editing code, changing language, resetting, running samples, or submitting clears stale results from the other action.

## Verification

`npm run quality`, `npm test`, and `npm run build` passed. Playwright covers the Submit request body, Bearer token header, saved verdict display, and hidden-case privacy.

## Next Step

Submission history and detail pages are documented in `submission-history.md`. Next, add automatic refresh-token handling for protected routes.
