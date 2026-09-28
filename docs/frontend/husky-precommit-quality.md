# Husky Pre-commit Quality Hook Setup

## Overview

The frontend (`codeArena-frontend`) uses `husky` to execute automatic pre-commit checks before any git commit is recorded. This mirrors the backend quality gate enforcement.

---

## Pre-commit Verification Workflow

Whenever `git commit` is triggered, `.husky/pre-commit` automatically executes:

```bash
npm run quality
```

`npm run quality` executes three mandatory quality gates in sequence:

1. **Type Checking (`npm run typecheck`)**:
   - Executes `tsc --noEmit` to verify TypeScript types, prop types, and generics across all pages and components.

2. **Linting & Code Standards (`npm run lint`)**:
   - Executes `eslint .`.
   - Enforces `@typescript-eslint/no-unused-vars` as an **error** (catching unused variables, parameters, and imports).

3. **Prettier Formatting (`npm run format:check`)**:
   - Executes `prettier --check .` to guarantee consistent code formatting.

---

## Configuration Files

- **`package.json`**: Contains the `"prepare": "husky"` script and the `"quality"` task.
- **`.husky/pre-commit`**: The executable hook script that runs `npm run quality`.
- **`eslint.config.mjs`**: Contains ESLint configuration with strict `@typescript-eslint/no-unused-vars` rule.
