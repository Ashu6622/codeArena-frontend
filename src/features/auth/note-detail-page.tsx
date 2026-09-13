'use client';

import Link from 'next/link';
import { ArrowLeft, Clock3, Code2, Loader2, MemoryStick, StickyNote, Terminal } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { useSavedNote } from './auth-api';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
}

function formatVerdict(verdict: string | null) {
  if (!verdict) return 'Pending';
  return verdict
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load this note right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function NoteDetailPage({ slug }: { slug: string }) {
  const note = useSavedNote(slug);

  if (note.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={18} className="animate-spin text-[#739830]" /> Loading note
        </div>
      </main>
    );
  }

  if (note.isError || !note.data) {
    const needsLogin = isAuthError(note.error);
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="w-full max-w-md border border-line bg-white p-7 shadow-[8px_8px_0_#20231e]">
          <Terminal size={28} className="mb-5 text-[#739830]" />
          <h1 className="text-[30px] font-extrabold">
            {needsLogin ? 'Login required' : 'Note unavailable'}
          </h1>
          <p className="mt-3 text-[14px] leading-7 text-muted">
            {needsLogin ? 'Sign in to view this private note.' : errorMessage(note.error)}
          </p>
          <Link
            className="mt-7 inline-flex items-center gap-3 text-[13px] font-extrabold"
            href={needsLogin ? '/login' : '/notes'}
          >
            <ArrowLeft size={16} /> {needsLogin ? 'Go to login' : 'Back to notes'}
          </Link>
        </section>
      </main>
    );
  }

  const { problem, latestSubmission } = note.data;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-17 w-[min(1180px,calc(100%_-_32px))] flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/" className="brand text-[20px]">
            <span className="brand-symbol">
              <Terminal size={18} strokeWidth={2.5} />
            </span>
            <span>CodeArena.</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
            >
              <ArrowLeft size={15} /> Notes
            </Link>
            <Link
              href={'/problems/' + problem.slug}
              className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
            >
              Workspace
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-[min(1180px,calc(100%_-_32px))] gap-4 py-6 min-[940px]:grid-cols-[0.85fr_1.15fr]">
        <section className="border border-line bg-white p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
            <StickyNote size={15} className="text-[#739830]" /> PRIVATE NOTE
          </div>
          <h1 className="text-[34px] font-extrabold leading-tight max-[560px]:text-[28px]">
            {problem.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={'difficulty ' + formatDifficulty(problem.difficulty).toLowerCase()}>
              <i />
              {formatDifficulty(problem.difficulty)}
            </span>
            <span className="inline-flex items-center gap-2 bg-paper px-2.5 py-1 font-mono text-[10px] text-muted ring-1 ring-line">
              <Clock3 size={13} /> {problem.timeLimitMs}ms
            </span>
            <span className="inline-flex items-center gap-2 bg-paper px-2.5 py-1 font-mono text-[10px] text-muted ring-1 ring-line">
              <MemoryStick size={13} /> {problem.memoryLimitMb}MB
            </span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-[14px] leading-7 text-muted">
            {problem.description}
          </p>
          {problem.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <span
                  className="rounded-[2px] border border-line bg-paper px-2 py-1 font-mono text-[9px] text-muted"
                  key={tag.id}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-4">
          <section className="border border-line bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[22px] font-extrabold">Saved note</h2>
              <span className="font-mono text-[10px] text-muted">
                Updated {formatDate(note.data.note.updatedAt)}
              </span>
            </div>
            <p className="whitespace-pre-wrap border border-line bg-paper p-4 text-[14px] leading-7 text-muted">
              {note.data.note.content}
            </p>
          </section>

          <section className="overflow-hidden border border-[#353b2f] bg-[#242922] text-[#d4dbca]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3d4638] px-4 py-3">
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#a4ae9b]">
                <Code2 size={15} /> LATEST SUBMITTED CODE
              </div>
              {latestSubmission && (
                <span className="font-mono text-[10px] text-[#a4ae9b]">
                  {formatVerdict(latestSubmission.verdict)} · {latestSubmission.runtimeMs ?? 0}ms
                </span>
              )}
            </div>
            {latestSubmission ? (
              <pre className="max-h-[460px] overflow-auto bg-[#181c17] p-5 font-mono text-[12px] leading-6 text-[#eef4e8]">
                {latestSubmission.sourceCode}
              </pre>
            ) : (
              <div className="bg-[#181c17] p-5 text-[13px] leading-6 text-[#a4ae9b]">
                No submission has been made for this problem yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
