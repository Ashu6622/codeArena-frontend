# Problem Notes Frontend

## What was added

- Added React Query hooks for private per-problem notes.
- Added a notes panel to the problem workspace below sample test cases.
- Users can load, edit, and manually save one private note per problem.
- Anonymous users see a login prompt when the notes API returns 401.

## API mapping

- GET /problems/:slug/note loads the current user's note for a published problem.
- PUT /problems/:slug/note saves the current user's note content.

## Validation

- The frontend limits notes to 10,000 characters to match backend validation.
- Playwright coverage verifies note loading, auth header usage, saving, and the saved state.
