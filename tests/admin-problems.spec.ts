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

test('admin can create a problem from the frontend form', async ({ page }) => {
  await mockCurrentUser(page, adminUser);

  await page.route('http://localhost:4000/admin/problems', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBe('Bearer admin-access-token');
    expect(await route.request().postDataJSON()).toEqual({
      title: 'Array Pair Sum',
      slug: 'array-pair-sum',
      description:
        'Given an array of integers and a target, return the indices of the two numbers that add up to the target.',
      difficulty: 'EASY',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      isPublished: true,
      tagSlugs: ['array', 'hash-map'],
      languages: [
        {
          language: 'JAVASCRIPT',
          starterCode: `function pairSum(nums, target) {\n  return [];\n}`,
          functionSignature: 'pairSum(nums: number[], target: number): number[]',
        },
      ],
      testCases: [
        {
          input: '{"nums":[2,7,11,15],"target":9}',
          expectedOutput: '[0,1]',
          isSample: true,
          order: 0,
        },
        {
          input: '{"nums":[3,2,4],"target":6}',
          expectedOutput: '[1,2]',
          isSample: false,
          order: 1,
        },
      ],
    });
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'problem-id',
        title: 'Array Pair Sum',
        slug: 'array-pair-sum',
        difficulty: 'EASY',
        isPublished: true,
        createdAt: '2026-09-11T00:00:00.000Z',
        languages: ['JAVASCRIPT'],
        tags: [
          { id: 'tag-array-id', name: 'Array', slug: 'array' },
          { id: 'tag-hash-id', name: 'Hash Map', slug: 'hash-map' },
        ],
        testCaseCount: 2,
        sampleTestCaseCount: 1,
        hiddenTestCaseCount: 1,
      }),
    });
  });

  await page.goto('/admin/problems/new');
  await expect(page.getByRole('heading', { name: 'Create problem' })).toBeVisible();
  await page.getByLabel('Title').fill('Array Pair Sum');
  await expect(page.getByRole('textbox', { name: 'Slug', exact: true })).toHaveValue(
    'array-pair-sum',
  );
  await page
    .getByLabel('Description')
    .fill(
      'Given an array of integers and a target, return the indices of the two numbers that add up to the target.',
    );
  await page.getByLabel('Publish problem').check();
  await page.getByLabel('Tag slugs').fill('array, hash-map');
  await page
    .getByLabel('Function signature')
    .fill('pairSum(nums: number[], target: number): number[]');
  await page.getByLabel('Starter code').fill(`function pairSum(nums, target) {\n  return [];\n}`);
  await page.getByRole('button', { name: 'Create problem' }).click();

  await expect(page.getByRole('heading', { name: 'Problem created' })).toBeVisible();
  await expect(page.getByText('Array Pair Sum has 2 test cases')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open problem' })).toHaveAttribute(
    'href',
    '/problems/array-pair-sum',
  );
});

test('admin problem page blocks non-admin users', async ({ page }) => {
  await mockCurrentUser(page, normalUser);

  await page.goto('/admin/problems/new');
  await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to profile' })).toHaveAttribute(
    'href',
    '/profile',
  );
});

test('admin problem page asks expired sessions to log in', async ({ page }) => {
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

  await page.goto('/admin/problems/new');
  await expect(page.getByRole('heading', { name: 'Login required' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to login' })).toHaveAttribute('href', '/login');
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('codearena_access_token')))
    .toBeNull();
});

test('admin problem list shows drafts and edit links', async ({ page }) => {
  await mockCurrentUser(page, adminUser);
  await page.route('http://localhost:4000/admin/problems?limit=50', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer admin-access-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'problem-id',
            title: 'Array Pair Sum',
            slug: 'array-pair-sum',
            difficulty: 'EASY',
            timeLimitMs: 1000,
            memoryLimitMb: 128,
            isPublished: false,
            createdAt: '2026-09-11T00:00:00.000Z',
            updatedAt: '2026-09-12T00:00:00.000Z',
            languages: ['JAVASCRIPT'],
            tags: [{ id: 'tag-array-id', name: 'Array', slug: 'array' }],
            testCaseCount: 2,
            submissionCount: 0,
          },
        ],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
      }),
    });
  });

  await page.goto('/admin/problems');
  await expect(page.getByRole('heading', { name: 'Problems' })).toBeVisible();
  const problemRow = page.getByRole('article').filter({ hasText: 'Array Pair Sum' });
  await expect(problemRow).toBeVisible();
  await expect(problemRow.getByText('DRAFT')).toBeVisible();
  await expect(problemRow.getByText('Array', { exact: true })).toBeVisible();
  await expect(problemRow.getByRole('link', { name: 'Edit' })).toHaveAttribute(
    'href',
    '/admin/problems/array-pair-sum/edit',
  );
});

test('admin can unpublish a published problem from the list', async ({ page }) => {
  await mockCurrentUser(page, adminUser);
  let listRequests = 0;
  await page.route('http://localhost:4000/admin/problems?limit=50', async (route) => {
    listRequests += 1;
    const isPublished = listRequests === 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'problem-id',
            title: 'Array Pair Sum',
            slug: 'array-pair-sum',
            difficulty: 'EASY',
            timeLimitMs: 1000,
            memoryLimitMb: 128,
            isPublished,
            createdAt: '2026-09-11T00:00:00.000Z',
            updatedAt: '2026-09-12T00:00:00.000Z',
            languages: ['JAVASCRIPT'],
            tags: [{ id: 'tag-array-id', name: 'Array', slug: 'array' }],
            testCaseCount: 2,
            submissionCount: 4,
          },
        ],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
      }),
    });
  });
  await page.route('http://localhost:4000/admin/problems/array-pair-sum/archive', async (route) => {
    expect(route.request().method()).toBe('PATCH');
    expect(route.request().headers().authorization).toBe('Bearer admin-access-token');
    expect(await route.request().postDataJSON()).toEqual({});
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'problem-id',
        title: 'Array Pair Sum',
        slug: 'array-pair-sum',
        difficulty: 'EASY',
        isPublished: false,
        updatedAt: '2026-09-12T00:10:00.000Z',
        languages: ['JAVASCRIPT'],
        testCaseCount: 2,
        sampleTestCaseCount: 1,
        hiddenTestCaseCount: 1,
      }),
    });
  });

  await page.goto('/admin/problems');
  const problemRow = page.getByRole('article').filter({ hasText: 'Array Pair Sum' });
  await expect(problemRow.getByText('PUBLISHED')).toBeVisible();
  await problemRow.getByRole('button', { name: 'Unpublish' }).click();
  await expect(problemRow.getByText('DRAFT')).toBeVisible();
  await expect(problemRow.getByRole('button', { name: 'Unpublish' })).toBeHidden();
});

test('admin can edit a problem from the frontend form', async ({ page }) => {
  await mockCurrentUser(page, adminUser);
  await page.route('http://localhost:4000/admin/problems/array-pair-sum', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'problem-id',
          title: 'Array Pair Sum',
          slug: 'array-pair-sum',
          description:
            'Given an array of integers and a target, return the indices of the two numbers that add up to the target.',
          difficulty: 'EASY',
          timeLimitMs: 1000,
          memoryLimitMb: 128,
          isPublished: false,
          createdAt: '2026-09-11T00:00:00.000Z',
          updatedAt: '2026-09-12T00:00:00.000Z',
          tags: [
            { id: 'tag-array-id', name: 'Array', slug: 'array' },
            { id: 'tag-hash-id', name: 'Hash Map', slug: 'hash-map' },
          ],
          languages: [
            {
              language: 'JAVASCRIPT',
              starterCode: 'function pairSum(nums, target) {\n  return [];\n}',
              functionSignature: 'pairSum(nums: number[], target: number): number[]',
              executionTemplate: null,
            },
          ],
          testCases: [
            {
              id: 'sample-id',
              input: '{"nums":[2,7,11,15],"target":9}',
              expectedOutput: '[0,1]',
              isSample: true,
              order: 0,
            },
            {
              id: 'hidden-id',
              input: '{"nums":[3,2,4],"target":6}',
              expectedOutput: '[1,2]',
              isSample: false,
              order: 1,
            },
          ],
        }),
      });
      return;
    }

    expect(route.request().method()).toBe('PATCH');
    expect(route.request().headers().authorization).toBe('Bearer admin-access-token');
    expect(await route.request().postDataJSON()).toEqual({
      title: 'Array Pair Sum Updated',
      slug: 'array-pair-sum',
      description:
        'Given an array of integers and a target, return the indices of the two numbers that add up to the target.',
      difficulty: 'EASY',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      isPublished: true,
      tagSlugs: ['array', 'hash-map'],
      languages: [
        {
          language: 'JAVASCRIPT',
          starterCode: 'function pairSum(nums, target) {\n  return [];\n}',
          functionSignature: 'pairSum(nums: number[], target: number): number[]',
        },
      ],
      testCases: [
        {
          input: '{"nums":[2,7,11,15],"target":9}',
          expectedOutput: '[0,1]',
          isSample: true,
          order: 0,
        },
        {
          input: '{"nums":[3,2,4],"target":6}',
          expectedOutput: '[1,2]',
          isSample: false,
          order: 1,
        },
      ],
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'problem-id',
        title: 'Array Pair Sum Updated',
        slug: 'array-pair-sum',
        difficulty: 'EASY',
        isPublished: true,
        updatedAt: '2026-09-12T00:30:00.000Z',
        languages: ['JAVASCRIPT'],
        testCaseCount: 2,
        sampleTestCaseCount: 1,
        hiddenTestCaseCount: 1,
      }),
    });
  });

  await page.goto('/admin/problems/array-pair-sum/edit');
  await expect(page.getByRole('heading', { name: 'Edit problem' })).toBeVisible();
  await page.getByLabel('Title').fill('Array Pair Sum Updated');
  await page.getByLabel('Publish problem').check();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Problem updated' })).toBeVisible();
});
