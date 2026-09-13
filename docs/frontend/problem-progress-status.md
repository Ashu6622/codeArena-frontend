# Problem Progress Status UI

## What Was Added

- Public problem API types now include optional `progressStatus`.
- Landing problem rows show `Solved`, `Attempted`, or `Not started` when the backend returns progress.
- Problem workspace headers show the same progress status for logged-in users.
- Anonymous users keep the same browsing experience because the status field is optional.
