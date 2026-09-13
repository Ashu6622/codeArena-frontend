# Problem Progress Filter UI

## What Was Added

- Logged-in users now see progress filter controls in the landing problem list.
- Filters include `All progress`, `Solved`, `Attempted`, and `Not started`.
- The frontend sends `progressStatus` to `GET /problems` using React Query.
- Anonymous users do not see the progress filter controls.
