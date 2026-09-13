'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  StickyNote,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { useProblemNote, useUpsertProblemNote } from './problems-api';

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load private note right now.';
}

function ProblemNoteEditor({ initialContent, slug }: { initialContent: string; slug: string }) {
  const upsertNote = useUpsertProblemNote(slug);
  const [content, setContent] = useState(initialContent);

  function saveNote() {
    upsertNote.mutate({ content });
  }

  return (
    <section className="border border-line bg-white p-5">
      <textarea
        aria-label="Private problem notes"
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          upsertNote.reset();
        }}
        maxLength={10000}
        placeholder="Capture edge cases, patterns, or a better approach for your next attempt."
        className="min-h-[420px] w-full resize-y border border-line bg-paper p-4 text-[14px] leading-7 text-ink outline-none placeholder:text-muted focus:border-[#739830]"
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-muted">{content.length}/10000</span>
        <button
          type="button"
          onClick={saveNote}
          disabled={upsertNote.isPending}
          className="inline-flex min-h-10 items-center justify-center gap-2 bg-ink px-4 text-[12px] font-extrabold text-white hover:bg-[#34382f] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {upsertNote.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {upsertNote.isPending ? 'Saving' : 'Save note'}
        </button>
      </div>
      {upsertNote.isSuccess && (
        <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#55731f]">
          <CheckCircle2 size={13} /> Saved
        </span>
      )}
      {upsertNote.isError && (
        <div className="mt-3 flex items-start gap-2 text-[12px] leading-5 text-[#8f3a2e]">
          <XCircle size={14} />
          <span>{errorMessage(upsertNote.error)}</span>
        </div>
      )}
    </section>
  );
}

export function ProblemNotePage({ slug }: { slug: string }) {
  const noteQuery = useProblemNote(slug);
  const isUnauthorized = noteQuery.error instanceof ApiError && noteQuery.error.status === 401;
  const problemTitle = noteQuery.data?.problem.title ?? slug;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-17 w-[min(980px,calc(100%_-_32px))] flex-wrap items-center justify-between gap-4 py-4">
          <Link href={'/problems/' + slug} className="brand text-[20px]">
            <span className="brand-symbol">
              <Terminal size={18} strokeWidth={2.5} />
            </span>
            <span>CodeArena.</span>
          </Link>
          <Link
            href={'/problems/' + slug}
            className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
          >
            <ArrowLeft size={15} /> Workspace
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-[min(980px,calc(100%_-_32px))] gap-4 py-6">
        <section className="border border-line bg-white p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
            <StickyNote size={15} className="text-[#739830]" /> PRIVATE NOTE
          </div>
          <h1 className="text-[34px] font-extrabold leading-tight max-[560px]:text-[28px]">
            {problemTitle}
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-muted">Your private problem note</p>
        </section>

        {noteQuery.isLoading ? (
          <section className="flex min-h-40 items-center gap-3 border border-line bg-white p-5 font-mono text-[12px] text-muted">
            <Loader2 size={16} className="animate-spin text-[#739830]" /> Loading private note
          </section>
        ) : isUnauthorized ? (
          <section className="border border-line bg-white p-5 text-[13px] leading-6 text-muted">
            <Link href="/login" className="font-extrabold text-ink underline underline-offset-4">
              Login
            </Link>{' '}
            to view or save a private note for this problem.
          </section>
        ) : noteQuery.isError ? (
          <section className="flex items-start gap-3 border border-[#e1b4aa] bg-[#fff5f2] p-5 text-[13px] leading-6 text-[#8f3a2e]">
            <XCircle size={16} />
            <span>{errorMessage(noteQuery.error)}</span>
          </section>
        ) : (
          <ProblemNoteEditor initialContent={noteQuery.data?.note?.content ?? ''} slug={slug} />
        )}
      </div>
    </main>
  );
}
