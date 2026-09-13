import { expect, test } from '@playwright/test';

test('problem discussion page lists comments and posts a new comment', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'discussion-token');
  });

  await page.route('http://localhost:4000/problems/two-sum/comments', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          problem: { id: 'problem-id', title: 'Two Sum', slug: 'two-sum' },
          items: [
            {
              id: 'comment-id',
              content: 'Use a map for complements.',
              createdAt: '2026-09-12T12:00:00.000Z',
              updatedAt: '2026-09-12T12:00:00.000Z',
              author: { id: 'user-id', name: 'Asha' },
            },
          ],
        }),
      });
      return;
    }

    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBe('Bearer discussion-token');
    expect(await route.request().postDataJSON()).toEqual({ content: 'Watch duplicate values.' });
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        problem: { id: 'problem-id', title: 'Two Sum', slug: 'two-sum' },
        comment: {
          id: 'new-comment-id',
          content: 'Watch duplicate values.',
          createdAt: '2026-09-12T12:05:00.000Z',
          updatedAt: '2026-09-12T12:05:00.000Z',
          author: { id: 'current-user-id', name: 'CodeArena User' },
        },
      }),
    });
  });

  await page.goto('/problems/two-sum/discussions');
  await expect(page.getByRole('heading', { name: 'Two Sum' })).toBeVisible();
  await expect(page.getByText('Use a map for complements.')).toBeVisible();
  await expect(page.getByText('1 comments')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Workspace' })).toHaveAttribute(
    'href',
    '/problems/two-sum',
  );

  await page.getByLabel('Discussion comment').fill('Watch duplicate values.');
  await page.getByRole('button', { name: 'Post comment' }).click();
  await expect(page.getByText('Watch duplicate values.')).toBeVisible();
});

test('problem private note page loads and saves the note', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'note-token');
  });

  await page.route('http://localhost:4000/problems/two-sum/note', async (route) => {
    if (route.request().method() === 'GET') {
      expect(route.request().headers().authorization).toBe('Bearer note-token');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          problem: { id: 'problem-id', title: 'Two Sum', slug: 'two-sum' },
          note: {
            id: 'note-id',
            content: 'Remember lookup before insert.',
            createdAt: '2026-09-12T10:00:00.000Z',
            updatedAt: '2026-09-12T10:00:00.000Z',
          },
        }),
      });
      return;
    }

    expect(route.request().method()).toBe('PUT');
    expect(route.request().headers().authorization).toBe('Bearer note-token');
    expect(await route.request().postDataJSON()).toEqual({
      content: 'Check duplicate target pairs.',
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        problem: { id: 'problem-id', title: 'Two Sum', slug: 'two-sum' },
        note: {
          id: 'note-id',
          content: 'Check duplicate target pairs.',
          createdAt: '2026-09-12T10:00:00.000Z',
          updatedAt: '2026-09-12T10:05:00.000Z',
        },
      }),
    });
  });

  await page.goto('/problems/two-sum/notes');
  await expect(page.getByRole('heading', { name: 'Two Sum' })).toBeVisible();
  await expect(page.getByLabel('Private problem notes')).toHaveValue(
    'Remember lookup before insert.',
  );
  await expect(page.getByRole('link', { name: 'Workspace' })).toHaveAttribute(
    'href',
    '/problems/two-sum',
  );

  await page.getByLabel('Private problem notes').fill('Check duplicate target pairs.');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByText('Saved')).toBeVisible();
});

test('problem private note page asks unauthenticated users to login', async ({ page }) => {
  await page.route('http://localhost:4000/auth/refresh', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Authentication required' }),
    });
  });
  await page.route('http://localhost:4000/problems/two-sum/note', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Authentication required' }),
    });
  });

  await page.goto('/problems/two-sum/notes');
  await expect(page.getByText('Login')).toBeVisible();
  await expect(page.getByText('to view or save a private note for this problem.')).toBeVisible();
});
