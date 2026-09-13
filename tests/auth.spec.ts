import { expect, test } from '@playwright/test';

test('login submits credentials and stores the access token', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(await route.request().postDataJSON()).toEqual({
      email: 'user@codearena.local',
      password: 'correct-password',
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'test-access-token',
        tokenType: 'Bearer',
        expiresIn: '15m',
        user: {
          id: 'user-id',
          email: 'user@codearena.local',
          name: 'CodeArena User',
          role: 'USER',
          createdAt: '2026-09-11T00:00:00.000Z',
        },
      }),
    });
  });

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Enter the arena.' })).toBeVisible();
  await page.getByLabel('Email').fill('user@codearena.local');
  await page.getByLabel('Password', { exact: true }).fill('correct-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/#problems$/);
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('codearena_access_token')))
    .toBe('test-access-token');
});

test('login shows backend validation errors', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid email or password' }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('missing@codearena.local');
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Invalid email or password')).toBeVisible();
});

test('signup creates an account and links back to login', async ({ page }) => {
  await page.route('**/auth/signup', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(await route.request().postDataJSON()).toEqual({
      email: 'new@codearena.local',
      password: 'long-enough-password',
      name: 'New Coder',
    });
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'new-user-id',
        email: 'new@codearena.local',
        name: 'New Coder',
        role: 'USER',
        createdAt: '2026-09-11T00:00:00.000Z',
      }),
    });
  });

  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Start your run.' })).toBeVisible();
  await page.getByLabel('Name').fill('New Coder');
  await page.getByLabel('Email').fill('new@codearena.local');
  await page.getByLabel('Password', { exact: true }).fill('long-enough-password');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Account created.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to login' })).toHaveAttribute('href', '/login');
});

test('logout clears the local access token and redirects to login', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'logout-token');
  });

  await page.route('**/auth/logout', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBe('Bearer logout-token');
    await route.fulfill({ status: 204 });
  });

  await page.goto('/logout');
  await expect(page).toHaveURL(/\/login$/);
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('codearena_access_token')))
    .toBeNull();
});

test('profile loads the current user and shows account links', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'profile-token');
  });

  await page.route('**/auth/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer profile-token');
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
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer profile-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        solvedCount: 2,
        attemptedCount: 3,
        submissionCount: 5,
        acceptedSubmissionCount: 2,
        acceptanceRate: 40,
      }),
    });
  });
  await page.route('**/me/bookmarks', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer profile-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'problem-id',
            title: 'Two Sum',
            slug: 'two-sum',
            difficulty: 'EASY',
            timeLimitMs: 1000,
            memoryLimitMb: 128,
            bookmarkedAt: '2026-09-12T11:00:00.000Z',
            progressStatus: 'ATTEMPTED',
            tags: [{ id: 'tag-array-id', name: 'Array', slug: 'array' }],
          },
        ],
      }),
    });
  });

  await page.route('**/submissions/activity?days=365', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer profile-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        from: '2026-09-05',
        to: '2026-09-11',
        totalSubmissions: 3,
        maxCount: 2,
        days: [
          { date: '2026-09-05', count: 0 },
          { date: '2026-09-06', count: 0 },
          { date: '2026-09-07', count: 1 },
          { date: '2026-09-08', count: 0 },
          { date: '2026-09-09', count: 0 },
          { date: '2026-09-10', count: 2 },
          { date: '2026-09-11', count: 0 },
        ],
      }),
    });
  });

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'CodeArena User' })).toBeVisible();
  await expect(page.getByText('user@codearena.local')).toBeVisible();
  await expect(page.getByText('USER', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stats' })).toBeVisible();
  await expect(page.getByText('Solved')).toBeVisible();
  await expect(page.getByText('40%')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Daily activity' })).toBeVisible();
  await expect(page.getByText('3 submissions · 2026-09-05 to 2026-09-11')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Saved problems' })).toBeVisible();
  await expect(page.getByText('1 saved')).toBeVisible();
  const savedProblems = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Saved problems' }),
  });
  await expect(
    savedProblems.getByRole('link', { name: 'Open saved problem Two Sum' }),
  ).toHaveAttribute('href', '/problems/two-sum');
  await expect(
    savedProblems.getByRole('link', { name: 'Open private note for Two Sum' }),
  ).toHaveAttribute('href', '/problems/two-sum/notes');
  const savedProblemCard = savedProblems.getByRole('article');
  await expect(savedProblemCard.getByText('Attempted')).toBeVisible();
  await expect(savedProblemCard.getByText('Array')).toBeVisible();
  await page.getByLabel('2 submissions on Sep 10, 2026').focus();
  await expect(page.getByText('2 submissions on Sep 10, 2026')).toBeVisible();
  const quickLinks = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Quick links' }),
  });
  await expect(quickLinks.getByRole('link', { name: 'Submissions' })).toHaveAttribute(
    'href',
    '/submissions',
  );
  await expect(quickLinks.getByRole('link', { name: 'Problems' })).toHaveAttribute(
    'href',
    '/#problems',
  );
  await expect(quickLinks.getByRole('link', { name: 'Logout' })).toHaveAttribute('href', '/logout');
});

test('profile shows a login prompt when the session is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'expired-profile-token');
  });

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Authentication required' }),
    });
  });
  await page.route('**/me/bookmarks', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Authentication required' }),
    });
  });

  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid refresh session' }),
    });
  });

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Login required' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to login' })).toHaveAttribute('href', '/login');
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('codearena_access_token')))
    .toBeNull();
});
