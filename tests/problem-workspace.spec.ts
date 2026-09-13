import { expect, test } from '@playwright/test';

const problem = {
  id: 'problem-id',
  title: 'Two Sum',
  slug: 'two-sum',
  description:
    'Given an array of integers and a target, return the indices of the two numbers that add up to the target.',
  difficulty: 'EASY',
  timeLimitMs: 1000,
  memoryLimitMb: 128,
  progressStatus: 'SOLVED',
  isBookmarked: false,
  tags: [
    { id: 'tag-array-id', name: 'Array', slug: 'array' },
    { id: 'tag-hash-id', name: 'Hash Map', slug: 'hash-map' },
  ],
  languages: [
    {
      language: 'JAVASCRIPT',
      starterCode: 'function twoSum(nums, target) {\n  // TODO\n}',
      functionSignature: 'twoSum(nums: number[], target: number): number[]',
    },
  ],
  testCases: [
    {
      id: 'sample-id',
      input: '{"nums":[2,7,11,15],"target":9}',
      expectedOutput: '[0,1]',
      order: 0,
    },
  ],
};

test('problem workspace renders backend details and starter code', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('codearena_access_token', 'workspace-access-token');
  });

  await page.route('http://localhost:4000/submissions', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBe('Bearer workspace-access-token');
    expect(await route.request().postDataJSON()).toEqual({
      problemSlug: 'two-sum',
      language: 'JAVASCRIPT',
      code: 'function twoSum(nums, target) {\n  return [0, 1];\n}',
    });
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        submission: {
          id: 'submission-id-123456789',
          status: 'COMPLETED',
          verdict: 'ACCEPTED',
          runtimeMs: 23,
          memoryKb: null,
          runtimeError: null,
          createdAt: '2026-09-11T06:00:00.000Z',
          completedAt: '2026-09-11T06:00:01.000Z',
        },
        problem: {
          id: 'problem-id',
          title: 'Two Sum',
          slug: 'two-sum',
          language: 'JAVASCRIPT',
        },
        verdict: 'ACCEPTED',
        passed: true,
        passedCount: 2,
        totalCount: 2,
        sampleResults: [
          {
            testCaseId: 'sample-id',
            order: 0,
            passed: true,
            verdict: 'ACCEPTED',
            input: '{"nums":[2,7,11,15],"target":9}',
            expectedOutput: '[0,1]',
            actualOutput: '[0,1]',
            runtimeMs: 11,
          },
        ],
        hiddenResults: { passedCount: 1, totalCount: 1 },
      }),
    });
  });

  await page.route('http://localhost:4000/run', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(await route.request().postDataJSON()).toEqual({
      problemSlug: 'two-sum',
      language: 'JAVASCRIPT',
      code: 'function twoSum(nums, target) {\n  return [0, 1];\n}',
    });
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        problem: {
          id: 'problem-id',
          title: 'Two Sum',
          slug: 'two-sum',
          language: 'JAVASCRIPT',
        },
        verdict: 'ACCEPTED',
        passed: true,
        passedCount: 1,
        totalCount: 1,
        runtimeMs: 11,
        results: [
          {
            testCaseId: 'sample-id',
            order: 0,
            passed: true,
            verdict: 'ACCEPTED',
            input: '{"nums":[2,7,11,15],"target":9}',
            expectedOutput: '[0,1]',
            actualOutput: '[0,1]',
            runtimeMs: 11,
          },
        ],
      }),
    });
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
    expect(route.request().headers().authorization).toBe('Bearer workspace-access-token');
    expect(await route.request().postDataJSON()).toEqual({
      content: 'Watch duplicate values.',
    });
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

  await page.route('http://localhost:4000/problems/two-sum/bookmark', async (route) => {
    expect(route.request().method()).toBe('PUT');
    expect(route.request().headers().authorization).toBe('Bearer workspace-access-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        problem: { id: 'problem-id', title: 'Two Sum', slug: 'two-sum' },
        isBookmarked: true,
        bookmark: { id: 'bookmark-id', createdAt: '2026-09-12T11:00:00.000Z' },
      }),
    });
  });

  await page.route('http://localhost:4000/problems/two-sum/note', async (route) => {
    if (route.request().method() === 'GET') {
      expect(route.request().headers().authorization).toBe('Bearer workspace-access-token');
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
    expect(route.request().headers().authorization).toBe('Bearer workspace-access-token');
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

  await page.route('http://localhost:4000/problems/two-sum', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(problem),
    });
  });

  await page.goto('/problems/two-sum');
  await expect(page.getByRole('heading', { name: 'Two Sum', level: 1 })).toBeVisible();
  await expect(page.getByText('Easy')).toBeVisible();
  await expect(page.getByText('1000ms')).toBeVisible();
  await expect(page.getByText('128MB')).toBeVisible();
  await expect(page.getByText('Given an array of integers')).toBeVisible();
  await expect(page.getByText('Hash Map', { exact: true })).toBeVisible();
  await expect(page.getByText('Solved')).toBeVisible();
  await expect(page.getByText('twoSum(nums: number[], target: number): number[]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile');
  await expect(page.getByRole('link', { name: 'Logout' })).toHaveAttribute('href', '/logout');
  await page.getByRole('button', { name: 'Add bookmark' }).click();
  await expect(page.getByRole('button', { name: 'Remove bookmark' })).toBeVisible();
  await expect(page.getByLabel('Code editor')).toHaveValue(
    'function twoSum(nums, target) {\n  // TODO\n}',
  );
  await expect(page.getByText('"nums": [')).toBeVisible();
  await expect(page.getByText('[ 0, 1 ]', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Private problem notes')).toHaveValue(
    'Remember lookup before insert.',
  );
  await expect(page.getByRole('heading', { name: 'Discussion' })).toHaveCount(0);
  await expect(page.getByText('Use a map for complements.')).toBeVisible();
  await page.getByLabel('Discussion comment').fill('Watch duplicate values.');
  await page.getByRole('button', { name: 'Post comment' }).click();
  await expect(page.getByText('Watch duplicate values.')).toBeVisible();
  await page.getByLabel('Private problem notes').fill('Check duplicate target pairs.');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByText('Saved')).toBeVisible();

  await page.getByLabel('Code editor').fill('function twoSum(nums, target) {\n  return [0, 1];\n}');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByText('Accepted').first()).toBeVisible();
  await expect(page.getByText('1/1 passed · 11ms')).toBeVisible();
  await expect(page.getByText('Sample 1')).toBeVisible();

  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('2/2 passed · 23ms')).toBeVisible();
  await expect(page.getByRole('link', { name: '#submissi · COMPLETED' })).toHaveAttribute(
    'href',
    '/submissions/submission-id-123456789',
  );
  await expect(page.getByRole('link', { name: 'View submissions' })).toHaveAttribute(
    'href',
    '/submissions',
  );
  await expect(page.getByText('1/1 passed').last()).toBeVisible();
  await expect(page.getByText('hidden-secret')).not.toBeVisible();

  await page.getByLabel('Code editor').fill('function twoSum() {\n  return [];\n}');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('Code editor')).toHaveValue(
    'function twoSum(nums, target) {\n  // TODO\n}',
  );
});

test('problem workspace shows an unavailable state for backend errors', async ({ page }) => {
  await page.route('http://localhost:4000/problems/missing-problem', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Problem not found' }),
    });
  });

  await page.goto('/problems/missing-problem');
  await expect(page.getByRole('heading', { name: 'Problem unavailable' })).toBeVisible();
  await expect(page.getByText('Problem not found')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to problems' })).toHaveAttribute(
    'href',
    '/#problems',
  );
});
