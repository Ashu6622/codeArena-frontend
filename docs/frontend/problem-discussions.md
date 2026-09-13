# Problem Discussions

## What was added

- Added React Query hooks for problem comments.
- Added a Discussion panel to the problem workspace.
- Comments are listed publicly.
- Posting a comment uses the logged-in user's Bearer token.

## API mapping

- `GET /problems/:slug/comments` loads discussion comments.
- `POST /problems/:slug/comments` creates a new comment.

## UX

- Comments render newest-first.
- Empty, loading, and error states are handled.
- Logged-out posting shows a login prompt when the API returns 401.
