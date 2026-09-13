# Problem Tags UI

## What Was Added

- Added frontend problem tag types for public and admin API responses.
- Landing problem filters now send `tag` to the backend and display backend tag names as topic chips.
- Admin problem list includes a tag slug filter and shows tag chips per problem.
- Admin create/edit forms include a comma-separated `Tag slugs` input that sends `tagSlugs` to the backend.
- Problem workspace detail pages show the tags beside difficulty, time, and memory context.

## Admin Input

Use existing tag slugs such as `array`, `hash-map`, or `binary-search`. The UI normalizes comma-separated input before sending it to the backend.
