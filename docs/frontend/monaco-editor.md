# Monaco Editor Integration

## Purpose

Replace the plain problem workspace code textarea with Monaco Editor so CodeArena V1 has a real browser coding surface with syntax highlighting, line numbers, and editor ergonomics.

## Behavior

- Uses `@monaco-editor/react`.
- Supports the existing CodeArena language enum values.
- Maps `JAVASCRIPT` to Monaco's `javascript` language.
- Keeps the existing workspace code state unchanged, so Run, Submit, Reset, and language switching continue to use the same source value.
- Uses the `vs-dark` theme to match the current CodeArena workspace panel.
- Disables minimap and enables word wrap for a focused V1 editor.

## Files

- `src/features/problems/code-editor.tsx`: reusable Monaco wrapper.
- `src/features/problems/problem-workspace.tsx`: replaces the previous code textarea with `CodeEditor`.
- `tests/problem-workspace.spec.ts`: verifies the editor value still powers Run, Submit, and Reset.

## Testing Note

Monaco's visible editor surface is not a normal textarea. The component includes a synced, visually hidden `Code editor value` textarea so Playwright can set and assert editor state deterministically while users interact with Monaco in the UI.

## Verification

Ran focused workspace tests with `npx playwright test tests/problem-workspace.spec.ts`.
