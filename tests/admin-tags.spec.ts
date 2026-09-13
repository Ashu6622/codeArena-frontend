import { expect, test, type Page } from '@playwright/test';

const adminUser = {
  id: 'admin-id',
  email: 'admin@codearena.local',
  name: 'Admin User',
  role: 'ADMIN',
  createdAt: '2026-09-11T00:00:00.000Z',
};

const normalUser = {
  ...adminUser,
  id: 'user-id',
  email: 'user@codearena.local',
  role: 'USER',
};

async function mockCurrentUser(page: Page, user: typeof adminUser) {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'admin-access-token');
  });
  await page.route('http://localhost:4000/auth/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer admin-access-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user),
    });
  });
}

test('admin can create and edit tags', async ({ page }) => {
  await mockCurrentUser(page, adminUser);
  await page.route('http://localhost:4000/admin/tags', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'tag-array-id',
              name: 'Array',
              slug: 'array',
              createdAt: '2026-09-12T00:00:00.000Z',
              updatedAt: '2026-09-12T00:00:00.000Z',
              problemCount: 3,
            },
          ],
        }),
      });
      return;
    }

    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBe('Bearer admin-access-token');
    expect(await route.request().postDataJSON()).toEqual({
      name: 'Dynamic Programming',
      slug: 'dynamic-programming',
    });
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'tag-dp-id',
        name: 'Dynamic Programming',
        slug: 'dynamic-programming',
        createdAt: '2026-09-12T00:10:00.000Z',
        updatedAt: '2026-09-12T00:10:00.000Z',
        problemCount: 0,
      }),
    });
  });

  await page.route('http://localhost:4000/admin/tags/array', async (route) => {
    expect(route.request().method()).toBe('PATCH');
    expect(await route.request().postDataJSON()).toEqual({ name: 'Arrays', slug: 'arrays' });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'tag-array-id',
        name: 'Arrays',
        slug: 'arrays',
        createdAt: '2026-09-12T00:00:00.000Z',
        updatedAt: '2026-09-12T00:20:00.000Z',
        problemCount: 3,
      }),
    });
  });

  await page.goto('/admin/tags');
  await expect(page.getByRole('heading', { name: 'Tags' })).toBeVisible();
  await expect(page.getByText('3 problems')).toBeVisible();
  await page.getByRole('textbox', { name: 'Name' }).first().fill('Dynamic Programming');
  await expect(page.getByRole('textbox', { name: 'Slug' }).first()).toHaveValue(
    'dynamic-programming',
  );
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Dynamic Programming created.')).toBeVisible();

  const arrayRow = page.locator('section[aria-label="Admin tags list"] form').first();
  await arrayRow.getByRole('textbox', { name: 'Name' }).fill('Arrays');
  await arrayRow.getByRole('textbox', { name: 'Slug' }).fill('arrays');
  await arrayRow.getByRole('button', { name: 'Save' }).click();
  await expect(arrayRow.getByText('Saved')).toBeVisible();
});

test('admin tags page blocks non-admin users', async ({ page }) => {
  await mockCurrentUser(page, normalUser);
  await page.goto('/admin/tags');
  await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to profile' })).toHaveAttribute(
    'href',
    '/profile',
  );
});

test('admin tags page asks expired sessions to log in', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'expired-admin-token');
  });
  await page.route('http://localhost:4000/auth/me', async (route) => {
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

  await page.goto('/admin/tags');
  await expect(page.getByRole('heading', { name: 'Login required' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to login' })).toHaveAttribute('href', '/login');
});
