'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, MessageSquare, Terminal, XCircle } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { useCreateProblemComment, useProblemComments } from './problems-api';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load discussion right now.';
}

export function ProblemDiscussionsPage({ slug }: { slug: string }) {
  const comments = useProblemComments(slug);
  const createComment = useCreateProblemComment(slug);
  const [content, setContent] = useState('');
  const problemTitle = comments.data?.problem.title ?? slug;
  const isUnauthorized =
    createComment.error instanceof ApiError && createComment.error.status === 401;

  function submitComment() {
    if (!content.trim()) return;
    createComment.mutate(
      { content },
      {
        onSuccess: () => setContent(''),
      },
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-17 w-[min(1100px,calc(100%_-_32px))] flex-wrap items-center justify-between gap-4 py-4">
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

      <div className="mx-auto grid w-[min(1100px,calc(100%_-_32px))] gap-4 py-6">
        <section className="border border-line bg-white p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
            <MessageSquare size={15} className="text-[#739830]" /> DISCUSSION
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-extrabold leading-tight max-[560px]:text-[28px]">
                {problemTitle}
              </h1>
              <p className="mt-2 text-[13px] leading-6 text-muted">Problem discussion</p>
            </div>
            {comments.data && (
              <span className="font-mono text-[10px] text-muted">
                {comments.data.items.length} comments
              </span>
            )}
          </div>
        </section>

        <section className="border border-line bg-white p-5">
          <div className="mb-4 space-y-3">
            <textarea
              aria-label="Discussion comment"
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                createComment.reset();
              }}
              maxLength={2000}
              placeholder="Share an approach, edge case, or clarification."
              className="min-h-32 w-full resize-y border border-line bg-paper p-4 text-[13px] leading-7 text-ink outline-none placeholder:text-muted focus:border-[#739830]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[10px] text-muted">{content.length}/2000</span>
              <button
                type="button"
                onClick={submitComment}
                disabled={createComment.isPending || !content.trim()}
                className="inline-flex min-h-10 items-center justify-center gap-2 bg-ink px-4 text-[12px] font-extrabold text-white hover:bg-[#34382f] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {createComment.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <MessageSquare size={14} />
                )}
                {createComment.isPending ? 'Posting' : 'Post comment'}
              </button>
            </div>
            {isUnauthorized ? (
              <div className="border border-line bg-paper p-3 text-[13px] leading-6 text-muted">
                <Link
                  href="/login"
                  className="font-extrabold text-ink underline underline-offset-4"
                >
                  Login
                </Link>{' '}
                to join the discussion.
              </div>
            ) : createComment.isError ? (
              <div className="flex items-start gap-2 text-[12px] leading-5 text-[#8f3a2e]">
                <XCircle size={14} />
                <span>{errorMessage(createComment.error)}</span>
              </div>
            ) : null}
          </div>
        </section>

        {comments.isLoading ? (
          <section className="flex min-h-28 items-center gap-3 border border-line bg-white p-5 font-mono text-[12px] text-muted">
            <Loader2 size={16} className="animate-spin text-[#739830]" /> Loading discussion
          </section>
        ) : comments.isError ? (
          <section className="flex items-start gap-3 border border-[#e1b4aa] bg-[#fff5f2] p-5 text-[13px] leading-6 text-[#8f3a2e]">
            <XCircle size={16} />
            <span>{errorMessage(comments.error)}</span>
          </section>
        ) : comments.data?.items.length === 0 ? (
          <section className="border border-line bg-white p-5 text-[13px] leading-6 text-muted">
            No comments yet.
          </section>
        ) : (
          <section className="grid gap-3">
            {comments.data?.items.map((comment) => (
              <article className="border border-line bg-white p-5" key={comment.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold text-[#55731f]">
                    {comment.author.name || 'CodeArena User'}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-[14px] leading-7 text-muted">
                  {comment.content}
                </p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
