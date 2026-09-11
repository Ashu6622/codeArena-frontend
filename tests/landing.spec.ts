import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/problems*', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'API unavailable during fallback test' }),
    });
  });
});

test('landing renders without browser errors, overflow, or missing assets', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'CodeArena_', level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('button', { name: 'Run sample' })).toBeAttached();
  if ((page.viewportSize()?.width ?? 1440) <= 760) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(
      page
        .getByRole('navigation', { name: 'Mobile navigation' })
        .getByRole('link', { name: 'Login' }),
    ).toHaveAttribute('href', '/login');
    await expect(
      page
        .getByRole('navigation', { name: 'Mobile navigation' })
        .getByRole('link', { name: 'Logout' }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Close navigation' }).click();
  } else {
    await expect(
      page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Login' }),
    ).toHaveAttribute('href', '/login');
    await expect(
      page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Logout' }),
    ).toHaveCount(0);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  expect(
    await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('2d')!;
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      return pixels.some((value, index) => index % 4 === 3 && value > 0);
    }),
  ).toBeTruthy();
  const image = await page.request.get('/images/coding-workspace.jpg');
  expect(image.ok()).toBeTruthy();
  expect((await image.body()).length).toBeGreaterThan(10000);
  await page.screenshot({ path: testInfo.outputPath('landing-full.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('landing navigation switches after login token exists', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'landing-access-token');
  });

  await page.goto('/');

  if ((page.viewportSize()?.width ?? 1440) <= 760) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(mobileNav.getByRole('link', { name: 'Submissions' })).toHaveAttribute(
      'href',
      '/submissions',
    );
    await expect(mobileNav.getByRole('link', { name: 'Logout' })).toHaveAttribute(
      'href',
      '/logout',
    );
    await expect(mobileNav.getByRole('link', { name: 'Login' })).toHaveCount(0);
  } else {
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(mainNav.getByRole('link', { name: 'Submissions' })).toHaveAttribute(
      'href',
      '/submissions',
    );
    await expect(mainNav.getByRole('link', { name: 'Logout' })).toHaveAttribute('href', '/logout');
    await expect(mainNav.getByRole('link', { name: 'Login' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /View submissions/ })).toHaveAttribute(
      'href',
      '/submissions',
    );
  }
});

test('sample runner computes custom input and rejects malformed input', async ({ page }) => {
  await page.goto('/#playground');
  await page.getByRole('button', { name: 'Run sample' }).click();
  await expect(page.getByTestId('sample-output')).toHaveText('[0,1]');
  await page.getByRole('textbox', { name: 'Sample input', exact: true }).fill('[3, 3]');
  await page.getByRole('textbox', { name: 'Target', exact: true }).fill('6');
  await page.getByRole('button', { name: 'Run sample' }).click();
  await expect(page.getByTestId('sample-output')).toHaveText('[0,1]');
  await page.getByRole('textbox', { name: 'Sample input', exact: true }).fill('not an array');
  await page.getByRole('button', { name: 'Run sample' }).click();
  await expect(page.getByRole('status')).toContainText('Enter an array');
  await page.getByRole('button', { name: 'Reset sample' }).click();
  await expect(page.getByRole('textbox', { name: 'Sample input', exact: true })).toHaveValue(
    '[2, 7, 11, 15]',
  );
  await expect(page.getByTestId('sample-output')).toHaveCount(0);
});

test('library filters, empty state, and problem workspace links work', async ({ page }) => {
  await page.goto('/#problems');
  await page.getByRole('button', { name: 'Strings', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open Two Sum' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Open Valid Parentheses' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search problems' }).fill('not-a-problem');
  await expect(page.getByRole('heading', { name: 'No matching problems' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('link', { name: 'Open Valid Parentheses' })).toHaveAttribute(
    'href',
    '/problems/valid-parentheses',
  );
  await expect(page.getByRole('link', { name: 'Open Binary Search' })).toHaveAttribute(
    'href',
    '/problems/binary-search',
  );
});

test('FAQ and responsive navigation work', async ({ page }) => {
  await page.goto('/');
  if ((page.viewportSize()?.width ?? 1440) <= 760) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'FAQs' })
      .click();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
  }
  const faq = page.getByRole('button', { name: '02 Do I need to be an experienced developer?' });
  await faq.click();
  await expect(faq).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('No. Start with an Easy problem', { exact: false })).toBeVisible();
  await faq.click();
  await expect(faq).toHaveAttribute('aria-expanded', 'false');
});
