# Frontend Structure

## Scope

Initial folder structure for the CodeArena V1 frontend. No packages, framework configuration, screens, or application behavior have been added yet.

## Layout

```text
src/
  app/
    (auth)/
      login/
      signup/
    problems/
      [slug]/
    submissions/
      [id]/
    profile/
    admin/
      problems/
        new/
  components/
    ui/
    layout/
  features/
    auth/
    problems/
    editor/
    submissions/
  lib/
    api/
  config/
  hooks/
  types/
public/
  images/
tests/
docs/
  frontend/
```

## Responsibilities

- `src/app/`: Next.js route pages and layouts. The root layout and root page will be added during framework setup.
- `(auth)`: route group for login and signup; the group name does not appear in URLs.
- `problems/` and `problems/[slug]/`: problem list and individual problem workspace.
- `submissions/` and `submissions/[id]/`: submission history and individual results.
- `profile/`: the signed-in user's basic profile.
- `admin/problems/new/`: problem creation screen. Backend authorization must enforce admin access.
- `components/ui/`: reusable UI primitives.
- `components/layout/`: shared navigation and page layout components.
- `features/`: feature-specific components, hooks, and types, added as each feature is implemented.
- `features/editor/`: editor integration, language selection, run/submit controls, and execution results.
- `lib/api/`: shared HTTP client and API error handling; feature-specific requests can live with their feature.
- `config/`: frontend configuration and public environment validation.
- `hooks/` and `types/`: only hooks and types shared across multiple features.
- `public/images/`: static image assets.
- `tests/`: cross-feature integration or end-to-end tests. Focused unit tests may be colocated with their feature.
- `docs/frontend/`: implementation documentation for each frontend feature.

Folders alone do not create working Next.js routes. Route components will be added in later steps. Empty directories contain `.gitkeep` placeholders so Git tracks the structure; remove a placeholder when adding real files to that directory.

## Documentation Convention

Add or update a Markdown document in `docs/frontend/` for every feature. Record its purpose, changed files, behavior, API dependencies, verification, and known limitations.

## Verification

Confirmed that the structure and documentation exist and that the patch has no whitespace errors. There is no runnable application or test suite at this stage.

## Next Step

Initialize Next.js and TypeScript in this repository, add linting and formatting, and configure the root layout and development scripts.
