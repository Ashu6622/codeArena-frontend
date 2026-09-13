'use client';

import Link from 'next/link';
import { ArrowLeft, FileCode2, Loader2, StickyNote, Terminal } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { useSavedNotes } from './auth-api';

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
  return 'Unable to load saved notes right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function NotesPage() {
  const notes = useSavedNotes();

  if (notes.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={18} className="animate-spin text-[#739830]" /> Loading notes
        </div>
      </main>
    );
  }

  if (notes.isError || !notes.data) {
    const needsLogin = isAuthError(notes.error);
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="w-full max-w-md border border-line bg-white p-7 shadow-[8px_8px_0_#20231e]">
          <Terminal size={28} className="mb-5 text-[#739830]" />
          <h1 className="text-[30px] font-extrabold">
            {needsLogin ? 'Login required' : 'Notes unavailable'}
          </h1>
          <p className="mt-3 text-[14px] leading-7 text-muted">
            {needsLogin ? 'Sign in to view your saved notes.' : errorMessage(notes.error)}
          </p>
          <Link
            className="mt-7 inline-flex items-center gap-3 text-[13px] font-extrabold"
            href={needsLogin ? '/login' : '/profile'}
          >
            <ArrowLeft size={16} /> {needsLogin ? 'Go to login' : 'Back to profile'}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-17 w-[min(1100px,calc(100%_-_32px))] flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/" className="brand text-[20px]">
            <span className="brand-symbol">
              <Terminal size={18} strokeWidth={2.5} />
            </span>
            <span>CodeArena.</span>
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
          >
            <ArrowLeft size={15} /> Profile
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-[min(1100px,calc(100%_-_32px))] gap-4 py-6">
        <section className="border border-line bg-white p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
            <StickyNote size={15} className="text-[#739830]" /> SAVED NOTES
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-extrabold leading-tight max-[560px]:text-[28px]">
                Your problem notes
              </h1>
              <p className="mt-2 text-[13px] leading-6 text-muted">
                Problems where you saved private notes.
              </p>
            </div>
            <span className="font-mono text-[10px] text-muted">
              {notes.data.items.length} notes
            </span>
          </div>
        </section>

        {notes.data.items.length === 0 ? (
          <section className="border border-line bg-white p-5 text-[13px] leading-6 text-muted">
            No private notes saved yet.
          </section>
        ) : (
          <section className="grid gap-3">
            {notes.data.items.map((note) => (
              <Link
                href={'/notes/' + note.problem.slug}
                className="block border border-line bg-white p-5 hover:bg-[#f5f7ef]"
                key={note.id}
                aria-label={'Open saved note for ' + note.problem.title}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={
                      'difficulty ' + formatDifficulty(note.problem.difficulty).toLowerCase()
                    }
                  >
                    <i />
                    {formatDifficulty(note.problem.difficulty)}
                  </span>
                  <span className="rounded-[2px] border border-line bg-paper px-2 py-1 font-mono text-[9px] text-muted">
                    {formatProgressStatus(note.problem.progressStatus)}
                  </span>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[20px] font-extrabold">{note.problem.title}</h2>
                    <p className="mt-2 text-[13px] leading-6 text-muted">{note.contentPreview}</p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
                    <FileCode2 size={13} className="text-[#739830]" />
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
                {note.problem.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {note.problem.tags.map((tag) => (
                      <span
                        className="rounded-[2px] border border-line bg-paper px-2 py-1 font-mono text-[9px] text-muted"
                        key={tag.id}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
