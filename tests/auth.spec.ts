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
