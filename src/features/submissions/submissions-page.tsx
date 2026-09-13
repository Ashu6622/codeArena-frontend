'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCode2,
  Loader2,
  Terminal,
  XCircle,
} from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { useSubmissions, type SubmissionListItem } from './submit-code-api';

function formatVerdict(verdict: string | null) {
  if (!verdict) return 'Pending';
  return verdict
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load submissions right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function verdictColor(submission: SubmissionListItem) {
  if (submission.verdict === 'ACCEPTED') return 'text-[#577f15]';
  if (!submission.verdict) return 'text-muted';
  return 'text-[#a6422e]';
}

export function SubmissionsPage() {
  const submissions = useSubmissions();
  const data = submissions.data;

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
            <Link href="/profile" className="text-[12px] font-extrabold text-muted hover:text-ink">
              Profile
            </Link>
            <Link href="/logout" className="text-[12px] font-extrabold text-muted hover:text-ink">
              Logout
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-[min(1100px,calc(100%_-_32px))] py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
              <FileCode2 size={15} className="text-[#739830]" /> SUBMISSION LOG
            </div>
            <h1 className="text-[38px] font-extrabold leading-tight max-[560px]:text-[30px]">
              Your attempts
            </h1>
          </div>
          {data && (
            <span className="font-mono text-[11px] text-muted">{data.pagination.total} saved</span>
          )}
        </div>

        {submissions.isLoading ? (
          <div className="flex items-center gap-3 border border-line bg-white p-5 font-mono text-[12px] text-muted">
            <Loader2 size={17} className="animate-spin text-[#739830]" /> Loading submissions
          </div>
        ) : submissions.isError && isAuthError(submissions.error) ? (
          <div className="border border-line bg-white p-6">
            <h2 className="text-[22px] font-extrabold">Login required</h2>
            <p className="mt-2 text-[14px] leading-7 text-muted">
              Sign in to view your saved attempts.
            </p>
            <Link
              className="mt-5 inline-flex items-center gap-2 text-[13px] font-extrabold"
              href="/login"
            >
              Go to login <ArrowLeft size={15} className="rotate-180" />
            </Link>
          </div>
        ) : submissions.isError ? (
          <div className="flex items-start gap-3 border border-[#efb4a8] bg-[#fff4f0] p-5 text-[13px] font-semibold text-[#8d2f1d]">
            <XCircle size={17} /> {errorMessage(submissions.error)}
          </div>
        ) : !data ? null : data.items.length === 0 ? (
          <div className="border border-line bg-white p-6">
            <h2 className="text-[22px] font-extrabold">No submissions yet</h2>
            <Link
              className="mt-5 inline-flex items-center gap-2 text-[13px] font-extrabold"
              href="/#problems"
            >
              Pick a problem <ArrowLeft size={15} className="rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden border border-line bg-white">
            {data.items.map((submission) => (
              <Link
                href={'/submissions/' + submission.id}
                className="grid gap-3 border-b border-line p-4 last:border-b-0 hover:bg-[#f5f7ef] min-[760px]:grid-cols-[1.3fr_0.8fr_0.7fr_0.8fr] min-[760px]:items-center"
                key={submission.id}
              >
                <div>
                  <div className="text-[15px] font-extrabold">{submission.problem.title}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted">
                    {submission.problem.slug}
                  </div>
                </div>
                <div
                  className={
                    'flex items-center gap-2 text-[13px] font-extrabold ' + verdictColor(submission)
                  }
                >
                  {submission.verdict === 'ACCEPTED' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {formatVerdict(submission.verdict)}
                </div>
                <div className="font-mono text-[11px] text-muted">{submission.language}</div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
                  <Clock3 size={14} /> {submission.runtimeMs ?? 0}ms ·{' '}
                  {formatDate(submission.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
