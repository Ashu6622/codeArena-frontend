'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  FileCode2,
  FilePlus2,
  Loader2,
  Star,
  StickyNote,
  Tags,
  LogOut,
  Percent,
  Target,
  Mail,
  ShieldCheck,
  Terminal,
  Trophy,
  UserRound,
} from 'lucide-react';
import { SubmissionActivityHeatmap } from '@/features/submissions/submission-activity-heatmap';
import { useSubmissionStats } from '@/features/submissions/submit-code-api';
import { ApiError } from '@/lib/api-client';
import { useMe, useSavedProblems } from './auth-api';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
}

function formatProgressStatus(status: 'SOLVED' | 'ATTEMPTED' | 'NOT_STARTED') {
  if (status === 'SOLVED') return 'Solved';
  if (status === 'ATTEMPTED') return 'Attempted';
  return 'Not started';
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load your profile right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function SavedProblems() {
  const savedProblems = useSavedProblems();

  if (savedProblems.isLoading) {
    return (
      <section className="border border-line bg-white p-5">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={16} className="animate-spin text-[#739830]" /> Loading saved problems
        </div>
      </section>
    );
  }

  if (savedProblems.isError || !savedProblems.data) {
    return (
      <section className="border border-line bg-white p-5">
        <h2 className="mb-2 text-[22px] font-extrabold">Saved problems</h2>
        <p className="text-[13px] font-semibold text-[#8d2f1d]">
          {errorMessage(savedProblems.error)}
        </p>
      </section>
    );
  }

  return (
    <section className="border border-line bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[22px] font-extrabold">Saved problems</h2>
        <span className="font-mono text-[10px] text-muted">
          {savedProblems.data.items.length} saved
        </span>
      </div>

      {savedProblems.data.items.length === 0 ? (
        <div className="border border-line bg-paper p-4 text-[13px] leading-6 text-muted">
          No saved problems yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {savedProblems.data.items.map((problem) => (
            <article className="border border-line bg-paper p-4" key={problem.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={'difficulty ' + formatDifficulty(problem.difficulty).toLowerCase()}
                    >
                      <i />
                      {formatDifficulty(problem.difficulty)}
                    </span>
                    <span className="rounded-[2px] border border-line bg-white px-2 py-1 font-mono text-[9px] text-muted">
                      {formatProgressStatus(problem.progressStatus)}
                    </span>
                  </div>
                  <strong className="text-[15px]">{problem.title}</strong>
                  {problem.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {problem.tags.map((tag) => (
                        <span
                          className="rounded-[2px] border border-line bg-white px-2 py-1 font-mono text-[9px] text-muted"
                          key={tag.id}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
                  <Star size={13} fill="currentColor" className="text-[#739830]" />
                  {formatDate(problem.bookmarkedAt)}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={'/problems/' + problem.slug}
                  className="inline-flex min-h-9 items-center justify-center gap-2 border border-line bg-white px-3 text-[11px] font-extrabold text-ink hover:bg-[#f5f7ef]"
                  aria-label={'Open saved problem ' + problem.title}
                >
                  <FileCode2 size={14} /> Workspace
                </Link>
                <Link
                  href={'/problems/' + problem.slug + '/notes'}
                  className="inline-flex min-h-9 items-center justify-center gap-2 border border-line bg-white px-3 text-[11px] font-extrabold text-ink hover:bg-[#f5f7ef]"
                  aria-label={'Open private note for ' + problem.title}
                >
                  <StickyNote size={14} /> Open note
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatsSummary() {
  const stats = useSubmissionStats();

  if (stats.isLoading) {
    return (
      <section className="border border-line bg-white p-5">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={16} className="animate-spin text-[#739830]" /> Loading stats
        </div>
      </section>
    );
  }

  if (stats.isError || !stats.data) {
    return (
      <section className="border border-line bg-white p-5">
        <h2 className="mb-2 text-[22px] font-extrabold">Stats</h2>
        <p className="text-[13px] font-semibold text-[#8d2f1d]">{errorMessage(stats.error)}</p>
      </section>
    );
  }

  const items = [
    { label: 'Solved', value: stats.data.solvedCount, icon: Target },
    { label: 'Attempted', value: stats.data.attemptedCount, icon: FileCode2 },
    { label: 'Submissions', value: stats.data.submissionCount, icon: Terminal },
    { label: 'Accepted', value: stats.data.acceptedSubmissionCount, icon: ShieldCheck },
    { label: 'Acceptance', value: stats.data.acceptanceRate + '%', icon: Percent },
  ];

  return (
    <section className="border border-line bg-white p-5">
      <h2 className="mb-4 text-[22px] font-extrabold">Stats</h2>
      <div className="grid gap-3 min-[620px]:grid-cols-5">
        {items.map(({ label, value, icon: Icon }) => (
          <div className="border border-line bg-paper p-3" key={label}>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
              <Icon size={14} /> {label}
            </div>
            <div className="font-mono text-[22px] font-extrabold leading-none">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfilePage() {
  const profile = useMe();

  if (profile.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={18} className="animate-spin text-[#739830]" /> Loading profile
        </div>
      </main>
    );
  }

  if (profile.isError || !profile.data) {
    const needsLogin = isAuthError(profile.error);
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="w-full max-w-md border border-line bg-white p-7 shadow-[8px_8px_0_#20231e]">
          <Terminal size={28} className="mb-5 text-[#739830]" />
          <h1 className="text-[30px] font-extrabold">
            {needsLogin ? 'Login required' : 'Profile unavailable'}
          </h1>
          <p className="mt-3 text-[14px] leading-7 text-muted">
            {needsLogin ? 'Sign in to view your CodeArena profile.' : errorMessage(profile.error)}
          </p>
          <Link
            className="mt-7 inline-flex items-center gap-3 text-[13px] font-extrabold"
            href={needsLogin ? '/login' : '/'}
          >
            <ArrowLeft size={16} /> {needsLogin ? 'Go to login' : 'Back home'}
          </Link>
        </section>
      </main>
    );
  }

  const user = profile.data;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-[rgba(248,249,245,0.97)]">
        <div className="mx-auto flex h-17 w-[min(1100px,calc(100%_-_32px))] items-center justify-between gap-4">
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
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
            >
              <StickyNote size={15} /> View notes
            </Link>
            <Link href="/logout" className="text-[12px] font-extrabold text-muted hover:text-ink">
              Logout
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-[min(1100px,calc(100%_-_32px))] gap-4 py-8 min-[900px]:grid-cols-[0.82fr_1.18fr]">
        <div className="border border-line bg-white p-6">
          <div className="mb-6 grid size-20 place-items-center bg-ink font-mono text-[24px] font-extrabold text-white">
            {initials(user.name, user.email)}
          </div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
            <UserRound size={15} className="text-[#739830]" /> PROFILE
          </div>
          <h1 className="text-[36px] font-extrabold leading-tight max-[560px]:text-[30px]">
            {user.name || 'CodeArena User'}
          </h1>
          <p className="mt-3 text-[14px] leading-7 text-muted">
            Your account identity for saved submissions, judging history, and future arena stats.
          </p>
        </div>

        <div className="grid gap-4">
          <section className="border border-line bg-white p-5">
            <h2 className="mb-4 text-[22px] font-extrabold">Account</h2>
            <div className="grid gap-3 min-[620px]:grid-cols-2">
              <div className="border border-line bg-paper p-3">
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] text-muted">
                  <Mail size={14} /> Email
                </div>
                <div className="break-all text-[14px] font-bold">{user.email}</div>
              </div>
              <div className="border border-line bg-paper p-3">
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] text-muted">
                  <ShieldCheck size={14} /> Role
                </div>
                <div className="text-[14px] font-bold">{user.role}</div>
              </div>
              <div className="border border-line bg-paper p-3 min-[620px]:col-span-2">
                <div className="mb-2 font-mono text-[10px] text-muted">Joined</div>
                <div className="font-mono text-[12px]">{formatDate(user.createdAt)}</div>
              </div>
            </div>
          </section>

          <StatsSummary />

          <SubmissionActivityHeatmap />

          <SavedProblems />

          <section className="border border-line bg-white p-5">
            <h2 className="mb-4 text-[22px] font-extrabold">Quick links</h2>
            <div
              className={
                'grid gap-3 ' +
                (user.role === 'ADMIN' ? 'min-[620px]:grid-cols-6' : 'min-[620px]:grid-cols-4')
              }
            >
              <Link
                href="/submissions"
                className="flex min-h-24 flex-col justify-between border border-line bg-paper p-3 text-[13px] font-extrabold hover:bg-[#f5f7ef]"
              >
                <FileCode2 size={18} className="text-[#739830]" />
                Submissions
              </Link>
              <Link
                href="/#problems"
                className="flex min-h-24 flex-col justify-between border border-line bg-paper p-3 text-[13px] font-extrabold hover:bg-[#f5f7ef]"
              >
                <Terminal size={18} className="text-[#739830]" />
                Problems
              </Link>
              <Link
                href="/leaderboard"
                className="flex min-h-24 flex-col justify-between border border-line bg-paper p-3 text-[13px] font-extrabold hover:bg-[#f5f7ef]"
              >
                <Trophy size={18} className="text-[#739830]" />
                Leaderboard
              </Link>
              {user.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin/tags"
                    className="flex min-h-24 flex-col justify-between border border-line bg-paper p-3 text-[13px] font-extrabold hover:bg-[#f5f7ef]"
                  >
                    <Tags size={18} className="text-[#739830]" />
                    Manage tags
                  </Link>
                  <Link
                    href="/admin/problems"
                    className="flex min-h-24 flex-col justify-between border border-line bg-paper p-3 text-[13px] font-extrabold hover:bg-[#f5f7ef]"
                  >
                    <FilePlus2 size={18} className="text-[#739830]" />
                    Manage problems
                  </Link>
                </>
              )}
              <Link
                href="/logout"
                className="flex min-h-24 flex-col justify-between border border-line bg-paper p-3 text-[13px] font-extrabold hover:bg-[#f5f7ef]"
              >
                <LogOut size={18} className="text-[#739830]" />
                Logout
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
