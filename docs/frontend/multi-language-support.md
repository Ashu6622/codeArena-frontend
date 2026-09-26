# Multi-Language Support (JavaScript, Python, C++)

## Purpose

Expand the frontend UI to support multi-language problem solving across JavaScript, Python, and C++ (`CPP`), including Monaco Editor syntax highlighting, workspace language switching, submission detail views, and admin problem forms.

## Scope & Changes

### 1. Type System Extensions

- Extended `ProblemLanguage` in `src/features/problems/problems-api.ts` to include `'CPP'`:
  ```ts
  export type ProblemLanguage = 'JAVASCRIPT' | 'PYTHON' | 'CPP';
  ```
- Updated submission types in `src/features/auth/auth-api.ts` to include `'CPP'`.

### 2. Monaco Editor Syntax Highlighting

- Updated `toMonacoLanguage()` in `src/features/problems/code-editor.tsx` to map:
  - `JAVASCRIPT` $\rightarrow$ `'javascript'`
  - `PYTHON` $\rightarrow$ `'python'`
  - `CPP` $\rightarrow$ `'cpp'`

### 3. Problem Workspace & Language Selector

- Updated `formatLanguage()` in `src/features/problems/problem-workspace.tsx` to render user-friendly labels:
  - `JAVASCRIPT` $\rightarrow$ `JavaScript`
  - `PYTHON` $\rightarrow$ `Python`
  - `CPP` $\rightarrow$ `C++`
- Enabled seamless switching between starter code and submission history for JavaScript, Python, and C++.

### 4. Admin Management Dashboards

- Added `CPP` to available problem languages array in `src/features/problems/admin-problem-form-page.tsx`.
- Added `<option value="CPP">CPP</option>` to the language selector dropdown in `src/features/problems/admin-problem-edit-page.tsx`.

## Files Modified

- `src/features/problems/problems-api.ts`: updated `ProblemLanguage` type union.
- `src/features/auth/auth-api.ts`: updated `latestSubmission` language type.
- `src/features/problems/code-editor.tsx`: added Monaco language mapping for `CPP`.
- `src/features/problems/problem-workspace.tsx`: updated `formatLanguage` label formatter.
- `src/features/problems/admin-problem-form-page.tsx`: updated language options array.
- `src/features/problems/admin-problem-edit-page.tsx`: updated admin language select options.
- `docs/frontend/multi-language-support.md`: feature documentation.

## Verification

Ran full frontend quality gate:

```bash
npm run quality
```

Result:

- **TypeScript Typecheck**: Passed clean (`tsc --noEmit`).
- **ESLint**: Passed clean (`eslint .`).
- **Prettier Format Check**: Passed clean (`prettier --check .`).
