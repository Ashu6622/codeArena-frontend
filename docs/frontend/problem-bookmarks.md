ok# Problem Bookmarks Frontend

## What was added

- Added API helpers and React Query mutations for bookmarking problems.
- Added a bookmark toggle in the problem workspace header.
- Added bookmark status chips to the landing problem list.
- Added authenticated bookmark filters for the landing problem collection.

## API mapping

- PUT /problems/:slug/bookmark creates a bookmark.
- DELETE /problems/:slug/bookmark removes a bookmark.
- GET /problems?bookmarked=true filters the problem list to saved problems.

## UX rules

- Bookmark state comes from the problem list/detail response.
- Bookmark mutations update the open problem detail cache and invalidate problem lists.
- Bookmark filtering is only sent when the user is logged in.
