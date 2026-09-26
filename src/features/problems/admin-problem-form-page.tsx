'use client';

import Link from 'next/link';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FilePlus2,
  Loader2,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useMe } from '@/features/auth/auth-api';
import { ApiError } from '@/lib/api-client';
import {
  useCreateProblem,
  type CreateProblemResponse,
  type CreateProblemTestCaseRequest,
} from './admin-problems-api';
import type { ProblemDifficulty, ProblemLanguage } from './problems-api';

type EditableTestCase = {
  input: string;
  expectedOutput: string;
};

const difficulties: ProblemDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
const languages: ProblemLanguage[] = ['JAVASCRIPT', 'PYTHON', 'CPP'];

const defaultStarterCode = `function solution(input) {
  // TODO: parse input and return the answer.
}`;
const defaultFunctionSignature = 'solution(input: unknown): unknown';
const defaultSampleCases: EditableTestCase[] = [
  { input: '{"nums":[2,7,11,15],"target":9}', expectedOutput: '[0,1]' },
];
const defaultHiddenCases: EditableTestCase[] = [
  { input: '{"nums":[3,2,4],"target":6}', expectedOutput: '[1,2]' },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to create this problem right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function compactOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseTagSlugs(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((item) => slugify(item))
        .filter(Boolean),
    ),
  ).slice(0, 10);
}

function createTestCases(sampleCases: EditableTestCase[], hiddenCases: EditableTestCase[]) {
  const samples: CreateProblemTestCaseRequest[] = sampleCases.map((testCase, index) => ({
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    isSample: true,
    order: index,
  }));
  const hidden: CreateProblemTestCaseRequest[] = hiddenCases.map((testCase, index) => ({
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    isSample: false,
    order: sampleCases.length + index,
  }));

  return [...samples, ...hidden];
}

function validateCases(sampleCases: EditableTestCase[], hiddenCases: EditableTestCase[]) {
  const allCases = [...sampleCases, ...hiddenCases];
  if (sampleCases.length === 0) return 'Add at least one sample test case.';
  if (hiddenCases.length === 0) return 'Add at least one hidden test case.';
  if (allCases.some((testCase) => !testCase.input.trim() || !testCase.expectedOutput.trim())) {
    return 'Every test case needs both input and expected output.';
  }
  return null;
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
            href="/#problems"
            className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
          >
            <ArrowLeft size={15} /> Problems
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

type TestCaseEditorProps = {
  title: string;
  helper: string;
  cases: EditableTestCase[];
  kind: 'sample' | 'hidden';
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof EditableTestCase, value: string) => void;
};

function TestCaseEditor({
  title,
  helper,
  cases,
  kind,
  onAdd,
  onRemove,
  onChange,
}: TestCaseEditorProps) {
  return (
    <section className="border border-line bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold">{title}</h2>
          <p className="mt-1 text-[13px] leading-6 text-muted">{helper}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-10 items-center gap-2 border border-line bg-paper px-3 text-[12px] font-extrabold hover:bg-[#f5f7ef]"
        >
          <Plus size={15} /> Add {kind}
        </button>
      </div>

      <div className="grid gap-4">
        {cases.map((testCase, index) => {
          const label = kind === 'sample' ? 'Sample' : 'Hidden';
          return (
            <div className="border border-line bg-paper p-4" key={kind + '-' + index}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-mono text-[10px] font-semibold text-muted">
                  {label.toUpperCase()} CASE {index + 1}
                </div>
                <button
                  type="button"
                  aria-label={'Remove ' + kind + ' ' + (index + 1)}
                  onClick={() => onRemove(index)}
                  disabled={cases.length === 1}
                  className="grid size-8 place-items-center bg-white text-muted hover:text-[#a6422e] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="grid gap-3 min-[760px]:grid-cols-2">
                <label className="grid gap-2 text-[12px] font-extrabold">
                  {label} input {index + 1}
                  <textarea
                    value={testCase.input}
                    onChange={(event) => onChange(index, 'input', event.target.value)}
                    required
                    rows={5}
                    className="min-h-31 resize-y border border-line bg-white p-3 font-mono text-[12px] font-normal leading-6 outline-none focus:border-[#577f15]"
                  />
                </label>
                <label className="grid gap-2 text-[12px] font-extrabold">
                  {label} expected output {index + 1}
                  <textarea
                    value={testCase.expectedOutput}
                    onChange={(event) => onChange(index, 'expectedOutput', event.target.value)}
                    required
                    rows={5}
                    className="min-h-31 resize-y border border-line bg-white p-3 font-mono text-[12px] font-normal leading-6 outline-none focus:border-[#577f15]"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
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
  icon: ReactNode;
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

export function AdminProblemFormPage() {
  const profile = useMe();
  const createProblem = useCreateProblem();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('EASY');
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(128);
  const [isPublished, setIsPublished] = useState(false);
  const [tagSlugsInput, setTagSlugsInput] = useState('');
  const [language, setLanguage] = useState<ProblemLanguage>('JAVASCRIPT');
  const [starterCode, setStarterCode] = useState(defaultStarterCode);
  const [functionSignature, setFunctionSignature] = useState(defaultFunctionSignature);
  const [executionTemplate, setExecutionTemplate] = useState('');
  const [sampleCases, setSampleCases] = useState<EditableTestCase[]>(defaultSampleCases);
  const [hiddenCases, setHiddenCases] = useState<EditableTestCase[]>(defaultHiddenCases);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdProblem, setCreatedProblem] = useState<CreateProblemResponse | null>(null);

  const testCaseCount = sampleCases.length + hiddenCases.length;
  const hasAdminAccess = profile.data?.role === 'ADMIN';
  const slugPreview = useMemo(() => slug || slugify(title), [slug, title]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
  }

  function addSampleCase() {
    setSampleCases((currentCases) => [...currentCases, { input: '', expectedOutput: '' }]);
  }

  function addHiddenCase() {
    setHiddenCases((currentCases) => [...currentCases, { input: '', expectedOutput: '' }]);
  }

  function updateSampleCase(index: number, field: keyof EditableTestCase, value: string) {
    setSampleCases((currentCases) =>
      currentCases.map((testCase, currentIndex) =>
        currentIndex === index ? { ...testCase, [field]: value } : testCase,
      ),
    );
  }

  function updateHiddenCase(index: number, field: keyof EditableTestCase, value: string) {
    setHiddenCases((currentCases) =>
      currentCases.map((testCase, currentIndex) =>
        currentIndex === index ? { ...testCase, [field]: value } : testCase,
      ),
    );
  }

  function removeSampleCase(index: number) {
    setSampleCases((currentCases) =>
      currentCases.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function removeHiddenCase(index: number) {
    setHiddenCases((currentCases) =>
      currentCases.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatedProblem(null);
    setFormError(null);

    const caseError = validateCases(sampleCases, hiddenCases);
    if (caseError) {
      setFormError(caseError);
      return;
    }

    createProblem.mutate(
      {
        title: title.trim(),
        slug: slugPreview,
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
        testCases: createTestCases(sampleCases, hiddenCases),
      },
      {
        onSuccess: (data) => {
          setCreatedProblem(data);
          setFormError(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: (error) => {
          setFormError(errorMessage(error));
        },
      },
    );
  }

  if (profile.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={18} className="animate-spin text-[#739830]" /> Checking admin access
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
            ? 'Sign in with an admin account to create CodeArena problems.'
            : errorMessage(profile.error)
        }
        href={needsLogin ? '/login' : '/'}
        linkText={needsLogin ? 'Go to login' : 'Back home'}
        icon={<Terminal size={28} />}
      />
    );
  }

  if (!hasAdminAccess) {
    return (
      <GuardState
        title="Admin access required"
        message="Only CodeArena admins can create or publish problems. Your account can still solve problems and view submissions."
        href="/profile"
        linkText="Back to profile"
        icon={<ShieldAlert size={28} />}
      />
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <AdminHeader />

      <section className="mx-auto w-[min(1120px,calc(100%_-_32px))] py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
              <ShieldCheck size={15} className="text-[#739830]" /> ADMIN PROBLEM SETUP
            </div>
            <h1 className="text-[38px] font-extrabold leading-tight max-[560px]:text-[30px]">
              Create problem
            </h1>
          </div>
          <span className="font-mono text-[11px] text-muted">{testCaseCount} test cases ready</span>
        </div>

        {createdProblem && (
          <div className="mb-5 border border-[#b8d980] bg-[#f5fbeb] p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 text-[#577f15]" />
              <div>
                <h2 className="text-[20px] font-extrabold">Problem created</h2>
                <p className="mt-2 text-[13px] leading-6 text-[#4e6137]">
                  {createdProblem.title} has {createdProblem.testCaseCount} test cases, including{' '}
                  {createdProblem.sampleTestCaseCount} sample and{' '}
                  {createdProblem.hiddenTestCaseCount} hidden.
                </p>
                {createdProblem.isPublished ? (
                  <Link
                    href={'/problems/' + createdProblem.slug}
                    className="mt-4 inline-flex items-center gap-2 text-[12px] font-extrabold"
                  >
                    Open problem <ArrowLeft size={15} className="rotate-180" />
                  </Link>
                ) : (
                  <p className="mt-3 font-mono text-[11px] text-[#607548]">Saved as draft</p>
                )}
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
            <div className="mb-5 flex items-center gap-2 font-mono text-[10px] text-muted">
              <FilePlus2 size={15} className="text-[#739830]" /> DETAILS
            </div>
            <div className="grid gap-4 min-[820px]:grid-cols-2">
              <label className="grid gap-2 text-[12px] font-extrabold">
                Title
                <input
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  required
                  minLength={3}
                  maxLength={120}
                  className="h-11 border border-line bg-paper px-3 text-[14px] font-semibold outline-none focus:border-[#577f15]"
                  placeholder="Two Sum"
                />
              </label>
              <label className="grid gap-2 text-[12px] font-extrabold">
                Slug
                <input
                  value={slugPreview}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  required
                  minLength={3}
                  maxLength={120}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  className="h-11 border border-line bg-paper px-3 font-mono text-[13px] font-medium outline-none focus:border-[#577f15]"
                  placeholder="two-sum"
                />
              </label>
              <label className="grid gap-2 text-[12px] font-extrabold min-[820px]:col-span-2">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  minLength={20}
                  maxLength={50000}
                  rows={9}
                  className="min-h-54 resize-y border border-line bg-paper p-3 text-[14px] font-medium leading-7 outline-none focus:border-[#577f15]"
                  placeholder="Describe the task, input format, output format, and constraints."
                />
              </label>
              <label className="grid gap-2 text-[12px] font-extrabold">
                Difficulty
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as ProblemDifficulty)}
                  className="h-11 border border-line bg-paper px-3 text-[13px] font-bold outline-none focus:border-[#577f15]"
                >
                  {difficulties.map((difficultyOption) => (
                    <option value={difficultyOption} key={difficultyOption}>
                      {difficultyOption}
                    </option>
                  ))}
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
                  required
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
                  required
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
            <div className="mb-5 flex items-center gap-2 font-mono text-[10px] text-muted">
              <Terminal size={15} className="text-[#739830]" /> LANGUAGE CONFIG
            </div>
            <div className="grid gap-4">
              <label className="grid gap-2 text-[12px] font-extrabold">
                Language
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as ProblemLanguage)}
                  className="h-11 border border-line bg-paper px-3 text-[13px] font-bold outline-none focus:border-[#577f15]"
                >
                  {languages.map((languageOption) => (
                    <option value={languageOption} key={languageOption}>
                      {languageOption}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-[12px] font-extrabold">
                Function signature
                <input
                  value={functionSignature}
                  onChange={(event) => setFunctionSignature(event.target.value)}
                  maxLength={500}
                  className="h-11 border border-line bg-paper px-3 font-mono text-[13px] outline-none focus:border-[#577f15]"
                />
              </label>
              <label className="grid gap-2 text-[12px] font-extrabold">
                Starter code
                <textarea
                  value={starterCode}
                  onChange={(event) => setStarterCode(event.target.value)}
                  required
                  minLength={1}
                  maxLength={20000}
                  rows={9}
                  className="min-h-54 resize-y border border-line bg-[#1f241d] p-3 font-mono text-[12px] font-normal leading-6 text-[#ecf3e3] outline-none focus:border-[#9fca44]"
                />
              </label>
              <label className="grid gap-2 text-[12px] font-extrabold">
                Execution template
                <textarea
                  value={executionTemplate}
                  onChange={(event) => setExecutionTemplate(event.target.value)}
                  maxLength={20000}
                  rows={5}
                  className="min-h-31 resize-y border border-line bg-paper p-3 font-mono text-[12px] font-normal leading-6 outline-none focus:border-[#577f15]"
                  placeholder="Optional wrapper used by the judge."
                />
              </label>
            </div>
          </section>

          <TestCaseEditor
            title="Sample tests"
            helper="Samples are visible on the problem page and used by the Run button."
            cases={sampleCases}
            kind="sample"
            onAdd={addSampleCase}
            onRemove={removeSampleCase}
            onChange={updateSampleCase}
          />

          <TestCaseEditor
            title="Hidden tests"
            helper="Hidden cases are used only during Submit and are not shown to solvers."
            cases={hiddenCases}
            kind="hidden"
            onAdd={addHiddenCase}
            onRemove={removeHiddenCase}
            onChange={updateHiddenCase}
          />

          <div className="sticky bottom-0 z-10 border border-line bg-[rgba(248,249,245,0.96)] p-4 backdrop-blur">
            <button
              type="submit"
              disabled={createProblem.isPending}
              className="inline-flex min-h-11 items-center justify-center gap-3 bg-ink px-5 text-[12px] font-extrabold text-white hover:bg-[#3c4334]"
            >
              {createProblem.isPending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {createProblem.isPending ? 'Creating problem' : 'Create problem'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
