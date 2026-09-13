'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Edit3,
  Eye,
  EyeOff,
  FilePlus2,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Tags,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMe } from '@/features/auth/auth-api';
import { ApiError } from '@/lib/api-client';
import {
  useAdminProblems,
  useArchiveProblem,
  type AdminProblemListItem,
  type AdminProblemsQuery,
} from './admin-problems-api';
import type { ProblemDifficulty } from './problems-api';

const difficulties: Array<'ALL' | ProblemDifficulty> = ['ALL', 'EASY', 'MEDIUM', 'HARD'];
const publishStates = ['ALL', 'PUBLISHED', 'DRAFT'] as const;

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load admin problems right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function normalizeTagSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function AdminGuardState({
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

function AdminProblemRow({ problem }: { problem: AdminProblemListItem }) {
  const archiveProblem = useArchiveProblem(problem.slug);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleUnpublish() {
    setActionError(null);
    archiveProblem.mutate(undefined, {
      onError: (error) => setActionError(errorMessage(error)),
    });
  }

  return (
    <article className="grid gap-3 border-b border-line p-4 last:border-b-0 min-[900px]:grid-cols-[1fr_160px_150px_230px] min-[900px]:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[16px] font-extrabold">{problem.title}</h2>
          <span
            className={
              'px-2 py-1 font-mono text-[10px] font-semibold ' +
              (problem.isPublished ? 'bg-[#e8f5d2] text-[#4f711e]' : 'bg-[#fff2d8] text-[#82621d]')
            }
          >
            {problem.isPublished ? 'PUBLISHED' : 'DRAFT'}
          </span>
        </div>
        <div className="mt-1 font-mono text-[10px] text-muted">{problem.slug}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {problem.languages.map((language) => (
            <span className="bg-paper px-2 py-1 font-mono text-[10px]" key={language}>
              {language}
            </span>
          ))}
          {problem.tags.map((tag) => (
            <span
              className="bg-[#eef5de] px-2 py-1 font-mono text-[10px] text-[#55731f]"
              key={tag.id}
            >
              {tag.name}
            </span>
          ))}
        </div>
        {actionError && (
          <div className="mt-3 text-[12px] font-bold text-[#8d2f1d]">{actionError}</div>
        )}
      </div>
      <div className="font-mono text-[11px] text-muted">
        {problem.difficulty} · {problem.timeLimitMs}ms · {problem.memoryLimitMb}MB
      </div>
      <div className="font-mono text-[11px] text-muted">
        {problem.testCaseCount} tests · {problem.submissionCount} submissions
        <br />
        Updated {formatDate(problem.updatedAt)}
      </div>
      <div className="flex flex-wrap gap-2 min-[900px]:justify-end">
        <Link
          href={'/admin/problems/' + problem.slug + '/edit'}
          className="inline-flex min-h-9 items-center gap-2 border border-line bg-paper px-3 text-[12px] font-extrabold hover:bg-[#f5f7ef]"
        >
          <Edit3 size={15} /> Edit
        </Link>
        {problem.isPublished && (
          <>
            <Link
              href={'/problems/' + problem.slug}
              className="inline-flex min-h-9 items-center gap-2 border border-line bg-paper px-3 text-[12px] font-extrabold hover:bg-[#f5f7ef]"
            >
              <Eye size={15} /> Open
            </Link>
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={archiveProblem.isPending}
              className="inline-flex min-h-9 items-center gap-2 border border-[#efb4a8] bg-[#fff4f0] px-3 text-[12px] font-extrabold text-[#8d2f1d] hover:bg-[#ffe8df]"
            >
              {archiveProblem.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <EyeOff size={15} />
              )}
              {archiveProblem.isPending ? 'Unpublishing' : 'Unpublish'}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export function AdminProblemsPage() {
  const profile = useMe();
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [difficulty, setDifficulty] = useState<'ALL' | ProblemDifficulty>('ALL');
  const [publishState, setPublishState] = useState<(typeof publishStates)[number]>('ALL');

  const query = useMemo<AdminProblemsQuery>(
    () => ({
      limit: 50,
      search,
      ...(normalizeTagSlug(tag) && { tag: normalizeTagSlug(tag) }),
      ...(difficulty !== 'ALL' && { difficulty }),
      ...(publishState !== 'ALL' && { isPublished: publishState === 'PUBLISHED' }),
    }),
    [difficulty, publishState, search, tag],
  );
  const problems = useAdminProblems(query);

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
      <AdminGuardState
        title={needsLogin ? 'Login required' : 'Admin unavailable'}
        message={
          needsLogin
            ? 'Sign in with an admin account to manage CodeArena problems.'
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
      <AdminGuardState
        title="Admin access required"
        message="Only CodeArena admins can manage problem drafts and edit test cases."
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
              <ShieldCheck size={15} className="text-[#739830]" /> ADMIN PROBLEM MANAGEMENT
            </div>
            <h1 className="text-[38px] font-extrabold leading-tight max-[560px]:text-[30px]">
              Problems
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/tags"
              className="inline-flex min-h-11 items-center gap-3 border border-line bg-white px-4 text-[12px] font-extrabold hover:bg-[#f5f7ef]"
            >
              <Tags size={17} /> Manage tags
            </Link>
            <Link
              href="/admin/problems/new"
              className="inline-flex min-h-11 items-center gap-3 bg-ink px-4 text-[12px] font-extrabold text-white hover:bg-[#3c4334]"
            >
              <FilePlus2 size={17} /> New problem
            </Link>
          </div>
        </div>

        <section className="mb-4 grid gap-3 border border-line bg-white p-4 min-[820px]:grid-cols-[1fr_170px_170px_170px]">
          <label className="grid gap-2 text-[12px] font-extrabold">
            Search
            <span className="flex h-11 items-center gap-2 border border-line bg-paper px-3">
              <Search size={15} className="text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold outline-none"
                placeholder="title or slug"
              />
            </span>
          </label>
          <label className="grid gap-2 text-[12px] font-extrabold">
            Tag
            <input
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="h-11 border border-line bg-paper px-3 font-mono text-[13px] outline-none focus:border-[#577f15]"
              placeholder="array"
            />
          </label>
          <label className="grid gap-2 text-[12px] font-extrabold">
            Difficulty
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as 'ALL' | ProblemDifficulty)}
              className="h-11 border border-line bg-paper px-3 text-[13px] font-bold outline-none focus:border-[#577f15]"
            >
              {difficulties.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-[12px] font-extrabold">
            Status
            <select
              value={publishState}
              onChange={(event) =>
                setPublishState(event.target.value as (typeof publishStates)[number])
              }
              className="h-11 border border-line bg-paper px-3 text-[13px] font-bold outline-none focus:border-[#577f15]"
            >
              {publishStates.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        {problems.isLoading ? (
          <div className="flex items-center gap-3 border border-line bg-white p-5 font-mono text-[12px] text-muted">
            <Loader2 size={17} className="animate-spin text-[#739830]" /> Loading problems
          </div>
        ) : problems.isError ? (
          <div className="flex items-start gap-3 border border-[#efb4a8] bg-[#fff4f0] p-5 text-[13px] font-semibold text-[#8d2f1d]">
            <XCircle size={17} /> {errorMessage(problems.error)}
          </div>
        ) : !problems.data || problems.data.items.length === 0 ? (
          <div className="border border-line bg-white p-6">
            <h2 className="text-[22px] font-extrabold">No problems found</h2>
            <p className="mt-2 text-[14px] leading-7 text-muted">
              Create the first problem or clear filters to see existing drafts.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-line bg-white">
            {problems.data.items.map((problem) => (
              <AdminProblemRow problem={problem} key={problem.id} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
