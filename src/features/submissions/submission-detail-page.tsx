'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  MemoryStick,
  Terminal,
  XCircle,
} from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { useSubmission, type SubmissionDetail } from './submit-code-api';

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
  return 'Unable to load this submission right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function verdictClass(submission: SubmissionDetail) {
  return submission.verdict === 'ACCEPTED' ? 'text-[#bfe86f]' : 'text-[#ffb4a8]';
}

export function SubmissionDetailPage({ id }: { id: string }) {
  const submission = useSubmission(id);

  if (submission.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={18} className="animate-spin text-[#739830]" /> Loading submission
        </div>
      </main>
    );
  }

  if (submission.isError || !submission.data) {
    const needsLogin = isAuthError(submission.error);
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="w-full max-w-md border border-line bg-white p-7 shadow-[8px_8px_0_#20231e]">
          <Terminal size={28} className="mb-5 text-[#739830]" />
          <h1 className="text-[30px] font-extrabold">
            {needsLogin ? 'Login required' : 'Submission unavailable'}
          </h1>
          <p className="mt-3 text-[14px] leading-7 text-muted">
            {needsLogin ? 'Sign in to view this saved attempt.' : errorMessage(submission.error)}
          </p>
          <Link
            className="mt-7 inline-flex items-center gap-3 text-[13px] font-extrabold"
            href={needsLogin ? '/login' : '/submissions'}
          >
            <ArrowLeft size={16} /> {needsLogin ? 'Go to login' : 'Back to submissions'}
          </Link>
        </section>
      </main>
    );
  }

  const data = submission.data;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-[rgba(248,249,245,0.97)]">
        <div className="mx-auto flex h-17 w-[min(1180px,calc(100%_-_32px))] items-center justify-between gap-4">
          <Link href="/" className="brand text-[20px]" aria-label="CodeArena home">
            <span className="brand-symbol">
              <Terminal size={18} strokeWidth={2.5} />
            </span>
            <span>CodeArena.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/submissions"
              className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
            >
              <ArrowLeft size={15} /> Submissions
            </Link>
            <Link href="/logout" className="text-[12px] font-extrabold text-muted hover:text-ink">
              Logout
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-[min(1180px,calc(100%_-_32px))] gap-4 py-6 min-[960px]:grid-cols-[0.85fr_1.15fr]">
        <div className="border border-line bg-white p-5">
          <div className="mb-3 font-mono text-[10px] text-muted">
            SUBMISSION / {data.id.slice(0, 8)}
          </div>
          <h1 className="text-[34px] font-extrabold leading-tight">{data.problem.title}</h1>
          <Link
            className="mt-3 inline-flex text-[13px] font-bold underline underline-offset-4"
            href={'/problems/' + data.problem.slug}
          >
            Open problem
          </Link>
          <div className="mt-6 grid gap-3">
            <div className="border border-line bg-paper p-3">
              <div className="mb-1 font-mono text-[10px] text-muted">Verdict</div>
              <div className="flex items-center gap-2 text-[15px] font-extrabold">
                {data.verdict === 'ACCEPTED' ? (
                  <CheckCircle2 size={17} className="text-[#577f15]" />
                ) : (
                  <XCircle size={17} className="text-[#a6422e]" />
                )}
                {formatVerdict(data.verdict)}
              </div>
            </div>
            <div className="grid gap-3 min-[560px]:grid-cols-2">
              <div className="border border-line bg-paper p-3">
                <div className="mb-1 font-mono text-[10px] text-muted">Runtime</div>
                <div className="flex items-center gap-2 font-mono text-[12px]">
                  <Clock3 size={14} /> {data.runtimeMs ?? 0}ms
                </div>
              </div>
              <div className="border border-line bg-paper p-3">
                <div className="mb-1 font-mono text-[10px] text-muted">Memory</div>
                <div className="flex items-center gap-2 font-mono text-[12px]">
                  <MemoryStick size={14} /> {data.memoryKb ?? 0}KB
                </div>
              </div>
            </div>
            <div className="border border-line bg-paper p-3">
              <div className="mb-1 font-mono text-[10px] text-muted">Submitted</div>
              <div className="font-mono text-[12px]">{formatDate(data.createdAt)}</div>
            </div>
            {(data.compileOutput || data.runtimeError) && (
              <div className="border border-[#efb4a8] bg-[#fff4f0] p-3 text-[13px] font-semibold text-[#8d2f1d]">
                {data.compileOutput ?? data.runtimeError}
              </div>
            )}
          </div>
        </div>

        <section className="overflow-hidden rounded-[5px] border border-[#353b2f] bg-[#242922] text-[#d4dbca]">
          <div className="workspace-titlebar">
            <div className="workspace-identity">
              <Terminal size={16} />
              <span>{data.language}</span>
              <span className="slash">/</span>
              <span className="workspace-file">submitted-code</span>
            </div>
            <span className={'font-mono text-[10px] font-bold ' + verdictClass(data)}>
              {formatVerdict(data.verdict)}
            </span>
          </div>
          <pre className="min-h-[560px] overflow-auto bg-[#181c17] p-5 font-mono text-[13px] leading-7 text-[#eef4e8]">
            <code>{data.sourceCode}</code>
          </pre>
        </section>
      </section>
    </main>
  );
}
