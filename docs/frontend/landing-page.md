# CodeArena Landing Page

## Purpose

Introduce CodeArena through its actual subject: coding problems and the practice of solving them. The landing page uses a restrained workspace design, original typography and layout, and a working sample playground.

## Stack and Files

- Next.js App Router, React, and TypeScript.
- Local Manrope and IBM Plex Mono font assets; no runtime font service.
- Lucide icons.
- `src/app/page.tsx` and `layout.tsx`: route, metadata, fonts, and root layout.
- `src/app/globals.css`: responsive styles and reduced-motion support.
- `src/app/icon.tsx`: generated PNG browser icon.
- `src/features/landing/landing-page.tsx`: navigation, playground, problem library, process, FAQ, and footer.
- `src/features/landing/algorithm-scene.tsx`: responsive canvas array visualization.
- `src/features/problems/preview-problems.ts`: curated local problems and sample algorithms.
- `tests/landing.spec.ts`: desktop and mobile browser checks.

## Behavior

The main calls to action open the playground. Problem rows load their corresponding statement, sample solution, and default input. Topic filters and search narrow the local collection; an empty state can reset both.

The playground shows a read-only JavaScript solution and accepts custom inputs. Run sample computes an actual local result. Reset restores the default input; copy copies the solution. Invalid inputs produce an inline error. Description and Approach tabs support keyboard navigation.

The initial collection contains Two Sum, Valid Parentheses, Binary Search, and Longest Unique Substring. Array inputs are limited to 32 bounded safe integers; strings and raw input are limited to 256 characters. Binary Search requires an ascending array of unique integers. Longest Unique Substring follows JavaScript string indexing (UTF-16 code units).

Navigation adapts to mobile. FAQ buttons expose their expanded state. The page includes a skip link, visible focus states, input labels, live result announcements, and reduced-motion styling.

## Scope

This is a frontend preview, independent of the NestJS backend. It does not execute arbitrary code, call the judge, create accounts, or store submissions. Runs execute only the bundled sample algorithms with validated input. No account statistics, community counts, or testimonials are fabricated.

## Commands

```bash
npm install
npm run dev
npm run quality
npm run build
npm test
```

Open `http://localhost:3001`. Browser tests use installed Google Chrome and cover desktop and mobile Chrome emulation. Install Chrome (or adjust the Playwright channel) on a new machine before running them.

## Assets

The coding photograph is stored locally at `public/images/coding-workspace.jpg`, sourced from [Pexels photo 546819](https://www.pexels.com/photo/close-up-photo-of-programming-of-codes-546819/). It is used in the closing section. The hero is a canvas scene, not an external image. Fonts and the photograph are served from the application.

## Verification

Desktop and mobile Playwright tests cover rendering, canvas pixels, image availability, page overflow, custom inputs, errors, reset, filters, empty results, selecting all four problems, tabs, FAQs, and mobile navigation. Screenshots are generated in the ignored `test-results/` directory.

## Next Step

Build the real problem workspace route and connect `GET /problems/:slug`. The full coding editor and judged submission flow remain separate features.
