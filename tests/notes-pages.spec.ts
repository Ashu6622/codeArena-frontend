import { expect, test } from '@playwright/test';

test('notes page lists saved notes and links to note detail', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'notes-token');
  });

  await page.route('http://localhost:4000/me/notes', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer notes-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'note-id',
            contentPreview: 'Remember lookup before insert.',
            createdAt: '2026-09-12T10:00:00.000Z',
            updatedAt: '2026-09-12T10:05:00.000Z',
            problem: {
              id: 'problem-id',
              title: 'Two Sum',
              slug: 'two-sum',
              difficulty: 'EASY',
              progressStatus: 'SOLVED',
              tags: [{ id: 'tag-array-id', name: 'Array', slug: 'array' }],
            },
          },
        ],
      }),
    });
  });

  await page.goto('/notes');
  await expect(page.getByRole('heading', { name: 'Your problem notes' })).toBeVisible();
  await expect(page.getByText('1 notes')).toBeVisible();
  await expect(page.getByText('Remember lookup before insert.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open saved note for Two Sum' })).toHaveAttribute(
    'href',
    '/notes/two-sum',
  );
  await expect(page.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile');
});

test('note detail page shows saved note and latest submitted code', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'note-detail-token');
  });

  await page.route('http://localhost:4000/me/notes/two-sum', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer note-detail-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        note: {
          id: 'note-id',
          content: 'Use hashmap for complements.',
          createdAt: '2026-09-12T10:00:00.000Z',
          updatedAt: '2026-09-12T10:05:00.000Z',
        },
        problem: {
          id: 'problem-id',
          title: 'Two Sum',
          slug: 'two-sum',
          description: 'Find two values that sum to target.',
          difficulty: 'EASY',
          timeLimitMs: 1000,
          memoryLimitMb: 128,
          tags: [{ id: 'tag-array-id', name: 'Array', slug: 'array' }],
        },
        latestSubmission: {
          id: 'submission-id',
          language: 'JAVASCRIPT',
          sourceCode: 'function twoSum() { return [0, 1]; }',
          status: 'COMPLETED',
          verdict: 'ACCEPTED',
          runtimeMs: 12,
          createdAt: '2026-09-12T11:00:00.000Z',
          completedAt: '2026-09-12T11:00:01.000Z',
        },
      }),
    });
  });

  await page.goto('/notes/two-sum');
  await expect(page.getByRole('heading', { name: 'Two Sum' })).toBeVisible();
  await expect(page.getByText('Find two values that sum to target.')).toBeVisible();
  await expect(page.getByText('Use hashmap for complements.')).toBeVisible();
  await expect(page.getByText('Latest submitted code', { exact: false })).toBeVisible();
  await expect(page.getByText('function twoSum() { return [0, 1]; }')).toBeVisible();
  await expect(page.getByText('Accepted · 12ms')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Notes' })).toHaveAttribute('href', '/notes');
  await expect(page.getByRole('link', { name: 'Workspace' })).toHaveAttribute(
    'href',
    '/problems/two-sum',
  );
});

test('profile exposes the saved notes route', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'profile-notes-token');
  });

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-id',
        email: 'user@codearena.local',
        name: 'CodeArena User',
        role: 'USER',
        createdAt: '2026-09-11T00:00:00.000Z',
      }),
    });
  });
  await page.route('**/submissions/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        solvedCount: 0,
        attemptedCount: 0,
        submissionCount: 0,
        acceptedSubmissionCount: 0,
        acceptanceRate: 0,
      }),
    });
  });
  await page.route('**/me/bookmarks', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
  });
  await page.route('**/submissions/activity?days=365', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        from: '2026-09-11',
        to: '2026-09-11',
        totalSubmissions: 0,
        maxCount: 0,
        days: [{ date: '2026-09-11', count: 0 }],
      }),
    });
  });

  await page.goto('/profile');
  await expect(page.getByRole('link', { name: 'View notes' })).toHaveAttribute('href', '/notes');
});
