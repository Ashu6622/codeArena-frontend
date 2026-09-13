'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  CalendarDays,
  FileCode2,
  Loader2,
  ShieldCheck,
  Target,
  Terminal,
  Trophy,
  UserRound,
  XCircle,
} from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { usePublicUserProfile } from './public-user-api';

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load this user profile right now.';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

function formatDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
}

function displayName(name: string | null) {
  return name?.trim() || 'CodeArena User';
}

export function PublicUserProfilePage({ id }: { id: string }) {
  const profile = usePublicUserProfile(id);

  if (profile.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={18} className="animate-spin text-[#739830]" /> Loading public profile
        </div>
      </main>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="w-full max-w-md border border-line bg-white p-7 shadow-[8px_8px_0_#20231e]">
          <XCircle size={28} className="mb-5 text-[#8d2f1d]" />
          <h1 className="text-[30px] font-extrabold">Profile unavailable</h1>
          <p className="mt-3 text-[14px] leading-7 text-muted">{errorMessage(profile.error)}</p>
          <Link
            className="mt-7 inline-flex items-center gap-3 text-[13px] font-extrabold"
            href="/leaderboard"
          >
            <ArrowLeft size={16} /> Back to leaderboard
          </Link>
        </section>
      </main>
    );
  }

  const { user, stats, recentSolved } = profile.data;
  const statsItems = [
    { label: 'Solved', value: stats.solvedCount, icon: Target },
    { label: 'Attempted', value: stats.attemptedCount, icon: FileCode2 },
    { label: 'Accepted', value: stats.acceptedSubmissionCount, icon: Award },
  ];

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
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
            >
              <ArrowLeft size={15} /> Leaderboard
            </Link>
            <Link
              href="/#problems"
              className="text-[12px] font-extrabold text-muted hover:text-ink"
            >
              Problems
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-[min(1100px,calc(100%_-_32px))] gap-4 py-8 min-[900px]:grid-cols-[0.78fr_1.22fr]">
        <div className="border border-line bg-white p-6">
          <div className="mb-6 grid size-20 place-items-center bg-ink text-white">
            <UserRound size={30} />
          </div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
            <Trophy size={15} className="text-[#739830]" /> PUBLIC PROFILE
          </div>
          <h1 className="text-[36px] font-extrabold leading-tight max-[560px]:text-[30px]">
            {displayName(user.name)}
          </h1>
          <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-muted">
            <CalendarDays size={14} /> Joined {formatDate(user.joinedAt)}
          </p>
        </div>

        <div className="grid gap-4">
          <section className="border border-line bg-white p-5">
            <h2 className="mb-4 text-[22px] font-extrabold">Arena stats</h2>
            <div className="grid gap-3 min-[620px]:grid-cols-3">
              {statsItems.map(({ label, value, icon: Icon }) => (
                <div className="border border-line bg-paper p-3" key={label}>
                  <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
                    <Icon size={14} /> {label}
                  </div>
                  <div className="font-mono text-[24px] font-extrabold leading-none">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-line bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#739830]" />
              <h2 className="text-[22px] font-extrabold">Recent solved</h2>
            </div>
            {recentSolved.length === 0 ? (
              <div className="border border-line bg-paper p-4 text-[13px] leading-6 text-muted">
                No solved published problems yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {recentSolved.map((problem) => (
                  <Link
                    href={'/problems/' + problem.slug}
                    className="block border border-line bg-paper p-4 hover:bg-[#f5f7ef]"
                    key={problem.id}
                    aria-label={'Open solved problem ' + problem.title}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={
                              'difficulty ' + formatDifficulty(problem.difficulty).toLowerCase()
                            }
                          >
                            <i />
                            {formatDifficulty(problem.difficulty)}
                          </span>
                          <span className="rounded-[2px] border border-line bg-white px-2 py-1 font-mono text-[9px] text-muted">
                            Solved {formatDate(problem.solvedAt)}
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
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
