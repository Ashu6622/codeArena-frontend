import { expect, test } from '@playwright/test';

const leaderboard = {
  items: [
    {
      rank: 1,
      user: { id: 'user-1', name: 'Asha', email: 'asha@example.com' },
      solvedCount: 4,
      acceptedSubmissionCount: 7,
      latestAcceptedAt: '2026-09-12T04:00:00.000Z',
    },
    {
      rank: 2,
      user: { id: 'user-2', name: null, email: 'dev@example.com' },
      solvedCount: 2,
      acceptedSubmissionCount: 5,
      latestAcceptedAt: '2026-09-11T04:00:00.000Z',
    },
  ],
  totalRankedUsers: 2,
  generatedAt: '2026-09-12T05:00:00.000Z',
};

test('leaderboard renders ranked users from the backend', async ({ page }) => {
  await page.route('http://localhost:4000/leaderboard?limit=50', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(leaderboard),
    });
  });

  await page.goto('/leaderboard');
  await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible();
  await expect(page.getByText('2 ranked users')).toBeVisible();
  await expect(page.getByText('#1').first()).toBeVisible();
  await expect(page.getByText('Asha').first()).toBeVisible();
  await expect(page.getByText('asha@example.com').first()).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open public profile for Asha' }).first(),
  ).toHaveAttribute('href', '/users/user-1');
  await expect(page.getByText('4 solved').first()).toBeVisible();
  await expect(page.getByText('7 accepted').first()).toBeVisible();
  await expect(page.getByText('dev@example.com').first()).toBeVisible();
});

test('leaderboard shows an empty state', async ({ page }) => {
  await page.route('http://localhost:4000/leaderboard?limit=50', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [],
        totalRankedUsers: 0,
        generatedAt: '2026-09-12T05:00:00.000Z',
      }),
    });
  });

  await page.goto('/leaderboard');
  await expect(page.getByRole('heading', { name: 'No accepted submissions yet' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pick a problem' })).toHaveAttribute(
    'href',
    '/#problems',
  );
});

test('leaderboard shows backend errors', async ({ page }) => {
  await page.route('http://localhost:4000/leaderboard?limit=50', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Leaderboard unavailable' }),
    });
  });

  await page.goto('/leaderboard');
  await expect(page.getByText('Leaderboard unavailable')).toBeVisible();
});

test('public user profile renders from the leaderboard user route', async ({ page }) => {
  await page.route('http://localhost:4000/users/user-1/public-profile', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user-1',
          name: 'Asha',
          joinedAt: '2026-09-01T00:00:00.000Z',
        },
        stats: {
          solvedCount: 4,
          attemptedCount: 6,
          acceptedSubmissionCount: 7,
        },
        recentSolved: [
          {
            id: 'problem-id',
            title: 'Two Sum',
            slug: 'two-sum',
            difficulty: 'EASY',
            solvedAt: '2026-09-12T09:00:02.000Z',
            tags: [{ id: 'tag-array-id', name: 'Array', slug: 'array' }],
          },
        ],
      }),
    });
  });

  await page.goto('/users/user-1');
  await expect(page.getByRole('heading', { name: 'Asha', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Arena stats' })).toBeVisible();
  await expect(page.getByText('4').first()).toBeVisible();
  await expect(page.getByText('6').first()).toBeVisible();
  await expect(page.getByText('7').first()).toBeVisible();
  const solved = page.getByRole('link', { name: 'Open solved problem Two Sum' });
  await expect(solved).toHaveAttribute('href', '/problems/two-sum');
  await expect(solved.getByText('Array')).toBeVisible();
});
