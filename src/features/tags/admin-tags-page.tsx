'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Tags,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useMe } from '@/features/auth/auth-api';
import { ApiError } from '@/lib/api-client';
import { useAdminTags, useCreateTag, useUpdateTag, type AdminTag } from './admin-tags-api';

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to manage tags right now.';
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function GuardState({
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
            href="/admin/problems"
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

function CreateTagForm() {
  const createTag = useCreateTag();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const slugPreview = slug || slugify(name);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setCreatedName(null);
    createTag.mutate(
      { name: name.trim(), ...(slugPreview && { slug: slugPreview }) },
      {
        onSuccess: (tag) => {
          setCreatedName(tag.name);
          setName('');
          setSlug('');
          setSlugTouched(false);
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  }

  return (
    <section className="border border-line bg-white p-5">
      <div className="mb-5 flex items-center gap-2 font-mono text-[10px] text-muted">
        <Plus size={15} className="text-[#739830]" /> CREATE TAG
      </div>
      {createdName && (
        <div className="mb-4 flex items-start gap-3 border border-[#b8d980] bg-[#f5fbeb] p-4 text-[13px] font-semibold text-[#4e6137]">
          <CheckCircle2 size={17} /> {createdName} created.
        </div>
      )}
      {formError && (
        <div className="mb-4 flex items-start gap-3 border border-[#efb4a8] bg-[#fff4f0] p-4 text-[13px] font-semibold text-[#8d2f1d]">
          <XCircle size={17} /> {formError}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 min-[760px]:grid-cols-[1fr_1fr_auto] min-[760px]:items-end"
      >
        <label className="grid gap-2 text-[12px] font-extrabold">
          Name
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            required
            minLength={2}
            maxLength={80}
            className="h-11 border border-line bg-paper px-3 text-[14px] font-semibold outline-none focus:border-[#577f15]"
            placeholder="Dynamic Programming"
          />
        </label>
        <label className="grid gap-2 text-[12px] font-extrabold">
          Slug
          <input
            value={slugPreview}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            required
            minLength={2}
            maxLength={80}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="h-11 border border-line bg-paper px-3 font-mono text-[13px] outline-none focus:border-[#577f15]"
            placeholder="dynamic-programming"
          />
        </label>
        <button
          type="submit"
          disabled={createTag.isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-4 text-[12px] font-extrabold text-white hover:bg-[#3c4334] disabled:opacity-55"
        >
          {createTag.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Create
        </button>
      </form>
    </section>
  );
}

function TagRow({ tag }: { tag: AdminTag }) {
  const updateTag = useUpdateTag(tag.slug);
  const [name, setName] = useState(tag.name);
  const [slug, setSlug] = useState(tag.slug);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    updateTag.mutate(
      { name: name.trim(), slug: slugify(slug) },
      {
        onSuccess: (updatedTag) => {
          setName(updatedTag.name);
          setSlug(updatedTag.slug);
          setMessage('Saved');
        },
        onError: (caught) => setError(errorMessage(caught)),
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 border-b border-line p-4 last:border-b-0 min-[900px]:grid-cols-[1fr_1fr_130px_120px] min-[900px]:items-end"
    >
      <label className="grid gap-2 text-[12px] font-extrabold">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
          maxLength={80}
          className="h-10 border border-line bg-paper px-3 text-[13px] font-semibold outline-none focus:border-[#577f15]"
        />
      </label>
      <label className="grid gap-2 text-[12px] font-extrabold">
        Slug
        <input
          value={slug}
          onChange={(event) => setSlug(slugify(event.target.value))}
          required
          minLength={2}
          maxLength={80}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          className="h-10 border border-line bg-paper px-3 font-mono text-[12px] outline-none focus:border-[#577f15]"
        />
      </label>
      <div className="font-mono text-[11px] text-muted">{tag.problemCount} problems</div>
      <button
        type="submit"
        disabled={updateTag.isPending}
        className="inline-flex min-h-10 items-center justify-center gap-2 border border-line bg-paper px-3 text-[12px] font-extrabold hover:bg-[#f5f7ef] disabled:opacity-55"
      >
        {updateTag.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        Save
      </button>
      {(message || error) && (
        <div
          className={
            'text-[12px] font-bold min-[900px]:col-span-4 ' +
            (error ? 'text-[#8d2f1d]' : 'text-[#55731f]')
          }
        >
          {error ?? message}
        </div>
      )}
    </form>
  );
}

export function AdminTagsPage() {
  const profile = useMe();
  const tagsQuery = useAdminTags();

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
      <GuardState
        title={needsLogin ? 'Login required' : 'Admin unavailable'}
        message={
          needsLogin
            ? 'Sign in with an admin account to manage CodeArena tags.'
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
      <GuardState
        title="Admin access required"
        message="Only CodeArena admins can manage problem tags."
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
              <ShieldCheck size={15} className="text-[#739830]" /> ADMIN TAG MANAGEMENT
            </div>
            <h1 className="text-[38px] font-extrabold leading-tight max-[560px]:text-[30px]">
              Tags
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted">
            <Tags size={15} /> {tagsQuery.data?.items.length ?? 0} tags
          </span>
        </div>

        <div className="grid gap-4">
          <CreateTagForm />

          {tagsQuery.isLoading ? (
            <div className="flex items-center gap-3 border border-line bg-white p-5 font-mono text-[12px] text-muted">
              <Loader2 size={17} className="animate-spin text-[#739830]" /> Loading tags
            </div>
          ) : tagsQuery.isError ? (
            <div className="flex items-start gap-3 border border-[#efb4a8] bg-[#fff4f0] p-5 text-[13px] font-semibold text-[#8d2f1d]">
              <XCircle size={17} /> {errorMessage(tagsQuery.error)}
            </div>
          ) : !tagsQuery.data || tagsQuery.data.items.length === 0 ? (
            <div className="border border-line bg-white p-6">
              <h2 className="text-[22px] font-extrabold">No tags found</h2>
              <p className="mt-2 text-[14px] leading-7 text-muted">
                Create tags before attaching them to problems.
              </p>
            </div>
          ) : (
            <section
              className="overflow-hidden border border-line bg-white"
              aria-label="Admin tags list"
            >
              {tagsQuery.data.items.map((tag) => (
                <TagRow tag={tag} key={tag.id} />
              ))}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
