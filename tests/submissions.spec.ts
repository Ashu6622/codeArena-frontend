import { expect, test } from '@playwright/test';

const submissionId = '22222222-2222-4222-8222-222222222222';

const submissionList = {
  items: [
    {
      id: submissionId,
      language: 'JAVASCRIPT',
      status: 'COMPLETED',
      verdict: 'ACCEPTED',
      runtimeMs: 18,
      memoryKb: null,
      createdAt: '2026-09-11T07:00:00.000Z',
      completedAt: '2026-09-11T07:00:01.000Z',
      problem: { id: 'problem-id', title: 'Two Sum', slug: 'two-sum', difficulty: 'EASY' },
    },
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

const submissionDetail = {
  ...submissionList.items[0],
  sourceCode: 'function twoSum(nums, target) {\n  return [0, 1];\n}',
  compileOutput: null,
  runtimeError: null,
  problem: {
    id: 'problem-id',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'EASY',
    timeLimitMs: 1000,
    memoryLimitMb: 128,
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'submission-access-token');
  });
});

test('submission history lists attempts from the backend', async ({ page }) => {
  await page.route('http://localhost:4000/submissions?limit=20', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer submission-access-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(submissionList),
    });
  });

  await page.goto('/submissions');
  await expect(page.getByRole('heading', { name: 'Your attempts' })).toBeVisible();
  await expect(page.getByText('1 saved')).toBeVisible();
  await expect(page.getByRole('link', { name: /Two Sum/ })).toHaveAttribute(
    'href',
    '/submissions/' + submissionId,
  );
  await expect(page.getByText('Accepted')).toBeVisible();
  await expect(page.getByText('JAVASCRIPT')).toBeVisible();
});

test('submission detail shows submitted code without hidden test data', async ({ page }) => {
  await page.route('http://localhost:4000/submissions/' + submissionId, async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer submission-access-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(submissionDetail),
    });
  });

  await page.goto('/submissions/' + submissionId);
  await expect(page.getByRole('heading', { name: 'Two Sum' })).toBeVisible();
  await expect(page.getByText('Accepted').first()).toBeVisible();
  await expect(page.getByText('18ms')).toBeVisible();
  await expect(page.getByText('function twoSum(nums, target)')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open problem' })).toHaveAttribute(
    'href',
    '/problems/two-sum',
  );
  await expect(page.getByText('hidden-secret')).not.toBeVisible();
});

test('submission history refreshes an expired access token and retries once', async ({ page }) => {
  let attempts = 0;
  await page.route('http://localhost:4000/submissions?limit=20', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      expect(route.request().headers().authorization).toBe('Bearer submission-access-token');
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Authentication required' }),
      });
      return;
    }

    expect(route.request().headers().authorization).toBe('Bearer refreshed-access-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(submissionList),
    });
  });
  await page.route('http://localhost:4000/auth/refresh', async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'refreshed-access-token' }),
    });
  });

  await page.goto('/submissions');
  await expect(page.getByRole('heading', { name: 'Your attempts' })).toBeVisible();
  await expect(page.getByText('1 saved')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('codearena_access_token')))
    .toBe('refreshed-access-token');
});

test('submission history shows a login prompt when refresh fails', async ({ page }) => {
  await page.route('http://localhost:4000/submissions?limit=20', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Authentication required' }),
    });
  });
  await page.route('http://localhost:4000/auth/refresh', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid refresh session' }),
    });
  });

  await page.goto('/submissions');
  await expect(page.getByRole('heading', { name: 'Login required' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to login' })).toHaveAttribute('href', '/login');
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('codearena_access_token')))
    .toBeNull();
});
