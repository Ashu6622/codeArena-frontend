'use client';

import Link from 'next/link';
import { ArrowLeft, Award, Loader2, Medal, Terminal, Trophy, XCircle } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { useLeaderboard, type LeaderboardEntry } from './leaderboard-api';

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load leaderboard right now.';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function displayName(entry: LeaderboardEntry) {
  return entry.user.name?.trim() || entry.user.email.split('@')[0];
}

function rankClass(rank: number) {
  if (rank === 1) return 'bg-lime text-ink';
  if (rank === 2) return 'bg-[#dce5f7] text-[#253f68]';
  if (rank === 3) return 'bg-[#ffe5bf] text-[#784c14]';
  return 'bg-paper text-muted';
}

export function LeaderboardPage() {
  const leaderboard = useLeaderboard(50);
  const topThree = leaderboard.data?.items.slice(0, 3) ?? [];

  return (
    <main className="min-h-screen bg-paper text-ink">
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
          </div>
        </div>
      </header>

      <section className="mx-auto w-[min(1120px,calc(100%_-_32px))] py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
              <Trophy size={15} className="text-[#739830]" /> RANKINGS
            </div>
            <h1 className="text-[38px] font-extrabold leading-tight max-[560px]:text-[30px]">
              Leaderboard
            </h1>
          </div>
          {leaderboard.data && (
            <span className="font-mono text-[11px] text-muted">
              {leaderboard.data.totalRankedUsers} ranked users
            </span>
          )}
        </div>

        {leaderboard.isLoading ? (
          <div className="flex items-center gap-3 border border-line bg-white p-5 font-mono text-[12px] text-muted">
            <Loader2 size={17} className="animate-spin text-[#739830]" /> Loading leaderboard
          </div>
        ) : leaderboard.isError ? (
          <div className="flex items-start gap-3 border border-[#efb4a8] bg-[#fff4f0] p-5 text-[13px] font-semibold text-[#8d2f1d]">
            <XCircle size={17} /> {errorMessage(leaderboard.error)}
          </div>
        ) : !leaderboard.data || leaderboard.data.items.length === 0 ? (
          <section className="border border-line bg-white p-6">
            <Medal size={26} className="mb-4 text-[#739830]" />
            <h2 className="text-[22px] font-extrabold">No accepted submissions yet</h2>
            <p className="mt-2 text-[14px] leading-7 text-muted">
              Rankings will appear after users solve published problems.
            </p>
            <Link
              className="mt-5 inline-flex items-center gap-2 text-[13px] font-extrabold"
              href="/#problems"
            >
              Pick a problem <ArrowLeft size={15} className="rotate-180" />
            </Link>
          </section>
        ) : (
          <div className="grid gap-4">
            <section className="grid gap-3 min-[760px]:grid-cols-3">
              {topThree.map((entry) => (
                <Link
                  className="block border border-line bg-white p-5 hover:bg-[#f5f7ef]"
                  href={'/users/' + entry.user.id}
                  key={entry.user.id}
                  aria-label={'Open public profile for ' + displayName(entry)}
                >
                  <div
                    className={
                      'mb-5 grid size-12 place-items-center font-mono text-[16px] font-extrabold ' +
                      rankClass(entry.rank)
                    }
                  >
                    #{entry.rank}
                  </div>
                  <h2 className="break-words text-[20px] font-extrabold">{displayName(entry)}</h2>
                  <p className="mt-1 break-all font-mono text-[11px] text-muted">
                    {entry.user.email}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="border border-line bg-paper p-3">
                      <div className="font-mono text-[10px] text-muted">SOLVED</div>
                      <div className="mt-1 text-[24px] font-extrabold">{entry.solvedCount}</div>
                    </div>
                    <div className="border border-line bg-paper p-3">
                      <div className="font-mono text-[10px] text-muted">ACCEPTED</div>
                      <div className="mt-1 text-[24px] font-extrabold">
                        {entry.acceptedSubmissionCount}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </section>

            <section className="overflow-hidden border border-line bg-white">
              {leaderboard.data.items.map((entry) => (
                <Link
                  className="grid gap-3 border-b border-line p-4 hover:bg-[#f5f7ef] last:border-b-0 min-[760px]:grid-cols-[80px_1fr_150px_170px_190px] min-[760px]:items-center"
                  href={'/users/' + entry.user.id}
                  key={entry.user.id}
                  aria-label={'Open public profile for ' + displayName(entry)}
                >
                  <div
                    className={
                      'grid size-10 place-items-center font-mono text-[13px] font-extrabold ' +
                      rankClass(entry.rank)
                    }
                  >
                    #{entry.rank}
                  </div>
                  <div>
                    <div className="break-words text-[15px] font-extrabold">
                      {displayName(entry)}
                    </div>
                    <div className="mt-1 break-all font-mono text-[10px] text-muted">
                      {entry.user.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[12px] font-semibold text-[#577f15]">
                    <Award size={15} /> {entry.solvedCount} solved
                  </div>
                  <div className="font-mono text-[11px] text-muted">
                    {entry.acceptedSubmissionCount} accepted
                  </div>
                  <div className="font-mono text-[11px] text-muted">
                    Latest {formatDate(entry.latestAcceptedAt)}
                  </div>
                </Link>
              ))}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
