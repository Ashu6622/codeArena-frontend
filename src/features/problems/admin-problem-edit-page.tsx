'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useMe } from '@/features/auth/auth-api';
import { ApiError } from '@/lib/api-client';
import { useAdminProblem, useUpdateProblem, type AdminProblemDetail } from './admin-problems-api';
import type { ProblemDifficulty, ProblemLanguage } from './problems-api';

type EditableTestCase = {
  input: string;
  expectedOutput: string;
};

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to save this problem right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function compactOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeTagSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseTagSlugs(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((item) => normalizeTagSlug(item))
        .filter(Boolean),
    ),
  ).slice(0, 10);
}

function GuardState({
  title,
  message,
  href,
  linkText,
  icon,
}: {
  title: string;
  message: string;
  href: string;
  linkText: string;
  icon: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
      <section className="w-full max-w-md border border-line bg-white p-7 shadow-[8px_8px_0_#20231e]">
        <div className="mb-5 text-[#739830]">{icon}</div>
        <h1 className="text-[30px] font-extrabold">{title}</h1>
        <p className="mt-3 text-[14px] leading-7 text-muted">{message}</p>
        <Link
          className="mt-7 inline-flex items-center gap-3 text-[13px] font-extrabold"
          href={href}
        >
          <ArrowLeft size={16} /> {linkText}
        </Link>
      </section>
    </main>
  );
}

function AdminHeader() {
  return (
    <header className="border-b border-line bg-[rgba(248,249,245,0.97)]">
      <div className="mx-auto flex h-17 w-[min(1120px,calc(100%_-_32px))] items-center justify-between gap-4">
        <Link href="/" className="brand text-[20px]" aria-label="CodeArena home">
          <span className="brand-symbol">
            <Terminal size={18} strokeWidth={2.5} />
          </span>
          <span>CodeArena.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/problems"
            className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
          >
            <ArrowLeft size={15} /> Admin list
          </Link>
          <Link href="/profile" className="text-[12px] font-extrabold text-muted hover:text-ink">
            Profile
          </Link>
          <Link href="/logout" className="text-[12px] font-extrabold text-muted hover:text-ink">
            Logout
          </Link>
        </div>
      </div>
    </header>
  );
}

function AdminProblemEditForm({ problem }: { problem: AdminProblemDetail }) {
  const updateProblem = useUpdateProblem(problem.slug);
  const languageConfig = problem.languages[0];
  const [title, setTitle] = useState(problem.title);
  const [currentSlug, setCurrentSlug] = useState(problem.slug);
  const [description, setDescription] = useState(problem.description);
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>(problem.difficulty);
  const [timeLimitMs, setTimeLimitMs] = useState(problem.timeLimitMs);
  const [memoryLimitMb, setMemoryLimitMb] = useState(problem.memoryLimitMb);
  const [isPublished, setIsPublished] = useState(problem.isPublished);
  const [tagSlugsInput, setTagSlugsInput] = useState(
    problem.tags.map((tag) => tag.slug).join(', '),
  );
  const [language, setLanguage] = useState<ProblemLanguage>(
    languageConfig?.language ?? 'JAVASCRIPT',
  );
  const [starterCode, setStarterCode] = useState(languageConfig?.starterCode ?? '');
  const [functionSignature, setFunctionSignature] = useState(
    languageConfig?.functionSignature ?? '',
  );
  const [executionTemplate, setExecutionTemplate] = useState(
    languageConfig?.executionTemplate ?? '',
  );
  const [sampleCases, setSampleCases] = useState<EditableTestCase[]>(
    problem.testCases
      .filter((testCase) => testCase.isSample)
      .map((testCase) => ({ input: testCase.input, expectedOutput: testCase.expectedOutput })),
  );
  const [hiddenCases, setHiddenCases] = useState<EditableTestCase[]>(
    problem.testCases
      .filter((testCase) => !testCase.isSample)
      .map((testCase) => ({ input: testCase.input, expectedOutput: testCase.expectedOutput })),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  function updateCase(
    kind: 'sample' | 'hidden',
    index: number,
    field: keyof EditableTestCase,
    value: string,
  ) {
    const setter = kind === 'sample' ? setSampleCases : setHiddenCases;
    setter((cases) =>
      cases.map((testCase, currentIndex) =>
        currentIndex === index ? { ...testCase, [field]: value } : testCase,
      ),
    );
  }

  function addCase(kind: 'sample' | 'hidden') {
    const setter = kind === 'sample' ? setSampleCases : setHiddenCases;
    setter((cases) => [...cases, { input: '', expectedOutput: '' }]);
  }

  function removeCase(kind: 'sample' | 'hidden', index: number) {
    const setter = kind === 'sample' ? setSampleCases : setHiddenCases;
    setter((cases) => cases.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedSlug(null);
    setFormError(null);

    if (sampleCases.length === 0 || hiddenCases.length === 0) {
      setFormError('Keep at least one sample test and one hidden test.');
      return;
    }

    updateProblem.mutate(
      {
        title: title.trim(),
        slug: currentSlug.trim(),
        description: description.trim(),
        difficulty,
        timeLimitMs,
        memoryLimitMb,
        isPublished,
        tagSlugs: parseTagSlugs(tagSlugsInput),
        languages: [
          {
            language,
            starterCode,
            functionSignature: compactOptional(functionSignature),
            executionTemplate: compactOptional(executionTemplate),
          },
        ],
        testCases: [
          ...sampleCases.map((testCase, index) => ({ ...testCase, isSample: true, order: index })),
          ...hiddenCases.map((testCase, index) => ({
            ...testCase,
            isSample: false,
            order: sampleCases.length + index,
          })),
        ],
      },
      {
        onSuccess: (data) => {
          setSavedSlug(data.slug);
          setFormError(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  }

  return (
    <section className="mx-auto w-[min(1120px,calc(100%_-_32px))] py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
            <ShieldCheck size={15} className="text-[#739830]" /> ADMIN PROBLEM EDITOR
          </div>
          <h1 className="text-[38px] font-extrabold leading-tight max-[560px]:text-[30px]">
            Edit problem
          </h1>
        </div>
        <span className="font-mono text-[11px] text-muted">
          {sampleCases.length + hiddenCases.length} test cases loaded
        </span>
      </div>

      {savedSlug && (
        <div className="mb-5 border border-[#b8d980] bg-[#f5fbeb] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 text-[#577f15]" />
            <div>
              <h2 className="text-[20px] font-extrabold">Problem updated</h2>
              <Link
                href={'/admin/problems/' + savedSlug + '/edit'}
                className="mt-3 inline-flex items-center gap-2 text-[12px] font-extrabold"
              >
                Continue editing <ArrowLeft size={15} className="rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {formError && (
        <div className="mb-5 flex items-start gap-3 border border-[#efb4a8] bg-[#fff4f0] p-5 text-[13px] font-semibold text-[#8d2f1d]">
          <XCircle size={17} /> {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <section className="border border-line bg-white p-5">
          <h2 className="mb-5 text-[20px] font-extrabold">Details</h2>
          <div className="grid gap-4 min-[820px]:grid-cols-2">
            <label className="grid gap-2 text-[12px] font-extrabold">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={3}
                maxLength={120}
                className="h-11 border border-line bg-paper px-3 text-[14px] font-semibold outline-none focus:border-[#577f15]"
              />
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold">
              Slug
              <input
                value={currentSlug}
                onChange={(event) => setCurrentSlug(event.target.value)}
                required
                minLength={3}
                maxLength={120}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                className="h-11 border border-line bg-paper px-3 font-mono text-[13px] font-medium outline-none focus:border-[#577f15]"
              />
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold min-[820px]:col-span-2">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                minLength={20}
                rows={8}
                className="min-h-48 resize-y border border-line bg-paper p-3 text-[14px] font-medium leading-7 outline-none focus:border-[#577f15]"
              />
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold">
              Difficulty
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as ProblemDifficulty)}
                className="h-11 border border-line bg-paper px-3 text-[13px] font-bold outline-none focus:border-[#577f15]"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </label>
            <label className="flex items-center gap-3 border border-line bg-paper px-3 py-2 text-[12px] font-extrabold">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
                className="size-4 accent-[#577f15]"
              />
              Publish problem
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold">
              Time limit
              <input
                type="number"
                value={timeLimitMs}
                onChange={(event) => setTimeLimitMs(Number(event.target.value))}
                min={100}
                max={30000}
                className="h-11 border border-line bg-paper px-3 font-mono text-[13px] outline-none focus:border-[#577f15]"
              />
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold">
              Memory limit
              <input
                type="number"
                value={memoryLimitMb}
                onChange={(event) => setMemoryLimitMb(Number(event.target.value))}
                min={16}
                max={1024}
                className="h-11 border border-line bg-paper px-3 font-mono text-[13px] outline-none focus:border-[#577f15]"
              />
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold min-[820px]:col-span-2">
              Tag slugs
              <input
                value={tagSlugsInput}
                onChange={(event) => setTagSlugsInput(event.target.value)}
                maxLength={300}
                className="h-11 border border-line bg-paper px-3 font-mono text-[13px] outline-none focus:border-[#577f15]"
                placeholder="array, hash-map, binary-search"
              />
            </label>
          </div>
        </section>

        <section className="border border-line bg-white p-5">
          <h2 className="mb-5 text-[20px] font-extrabold">Language config</h2>
          <div className="grid gap-4">
            <label className="grid gap-2 text-[12px] font-extrabold">
              Language
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as ProblemLanguage)}
                className="h-11 border border-line bg-paper px-3 text-[13px] font-bold outline-none focus:border-[#577f15]"
              >
                <option value="JAVASCRIPT">JAVASCRIPT</option>
                <option value="PYTHON">PYTHON</option>
              </select>
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold">
              Function signature
              <input
                value={functionSignature}
                onChange={(event) => setFunctionSignature(event.target.value)}
                className="h-11 border border-line bg-paper px-3 font-mono text-[13px] outline-none focus:border-[#577f15]"
              />
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold">
              Starter code
              <textarea
                value={starterCode}
                onChange={(event) => setStarterCode(event.target.value)}
                required
                rows={8}
                className="min-h-48 resize-y border border-line bg-[#1f241d] p-3 font-mono text-[12px] font-normal leading-6 text-[#ecf3e3] outline-none focus:border-[#9fca44]"
              />
            </label>
            <label className="grid gap-2 text-[12px] font-extrabold">
              Execution template
              <textarea
                value={executionTemplate}
                onChange={(event) => setExecutionTemplate(event.target.value)}
                rows={4}
                className="min-h-28 resize-y border border-line bg-paper p-3 font-mono text-[12px] font-normal leading-6 outline-none focus:border-[#577f15]"
              />
            </label>
          </div>
        </section>

        {(['sample', 'hidden'] as const).map((kind) => {
          const cases = kind === 'sample' ? sampleCases : hiddenCases;
          return (
            <section className="border border-line bg-white p-5" key={kind}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[20px] font-extrabold">
                  {kind === 'sample' ? 'Sample tests' : 'Hidden tests'}
                </h2>
                <button
                  type="button"
                  onClick={() => addCase(kind)}
                  className="border border-line bg-paper px-3 py-2 text-[12px] font-extrabold hover:bg-[#f5f7ef]"
                >
                  Add {kind}
                </button>
              </div>
              <div className="grid gap-4">
                {cases.map((testCase, index) => (
                  <div className="border border-line bg-paper p-4" key={kind + '-' + index}>
                    <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[10px] text-muted">
                      CASE {index + 1}
                      <button
                        type="button"
                        onClick={() => removeCase(kind, index)}
                        disabled={cases.length === 1}
                        className="bg-white px-2 py-1 text-[10px] font-bold disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 min-[760px]:grid-cols-2">
                      <label className="grid gap-2 text-[12px] font-extrabold">
                        {kind === 'sample' ? 'Sample' : 'Hidden'} input {index + 1}
                        <textarea
                          value={testCase.input}
                          onChange={(event) => updateCase(kind, index, 'input', event.target.value)}
                          required
                          rows={4}
                          className="min-h-28 resize-y border border-line bg-white p-3 font-mono text-[12px] font-normal leading-6 outline-none focus:border-[#577f15]"
                        />
                      </label>
                      <label className="grid gap-2 text-[12px] font-extrabold">
                        {kind === 'sample' ? 'Sample' : 'Hidden'} expected output {index + 1}
                        <textarea
                          value={testCase.expectedOutput}
                          onChange={(event) =>
                            updateCase(kind, index, 'expectedOutput', event.target.value)
                          }
                          required
                          rows={4}
                          className="min-h-28 resize-y border border-line bg-white p-3 font-mono text-[12px] font-normal leading-6 outline-none focus:border-[#577f15]"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="sticky bottom-0 z-10 border border-line bg-[rgba(248,249,245,0.96)] p-4 backdrop-blur">
          <button
            type="submit"
            disabled={updateProblem.isPending}
            className="inline-flex min-h-11 items-center justify-center gap-3 bg-ink px-5 text-[12px] font-extrabold text-white hover:bg-[#3c4334]"
          >
            {updateProblem.isPending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {updateProblem.isPending ? 'Saving changes' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

export function AdminProblemEditPage({ slug }: { slug: string }) {
  const profile = useMe();
  const problem = useAdminProblem(slug);

  if (profile.isLoading || problem.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={18} className="animate-spin text-[#739830]" /> Loading problem
        </div>
      </main>
    );
  }

  if (profile.isError || !profile.data) {
    const needsLogin = isAuthError(profile.error);
    return (
      <GuardState
        title={needsLogin ? 'Login required' : 'Admin unavailable'}
        message={
          needsLogin
            ? 'Sign in with an admin account to edit problems.'
            : errorMessage(profile.error)
        }
        href={needsLogin ? '/login' : '/'}
        linkText={needsLogin ? 'Go to login' : 'Back home'}
        icon={<Terminal size={28} />}
      />
    );
  }

  if (profile.data.role !== 'ADMIN') {
    return (
      <GuardState
        title="Admin access required"
        message="Only CodeArena admins can edit problem drafts and test cases."
        href="/profile"
        linkText="Back to profile"
        icon={<ShieldAlert size={28} />}
      />
    );
  }

  if (problem.isError || !problem.data) {
    return (
      <GuardState
        title="Problem unavailable"
        message={errorMessage(problem.error)}
        href="/admin/problems"
        linkText="Back to admin list"
        icon={<XCircle size={28} />}
      />
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <AdminHeader />
      <AdminProblemEditForm key={problem.data.id} problem={problem.data} />
    </main>
  );
}
