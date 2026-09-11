'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { AuthLayout } from './auth-layout';
import { useSignup } from './auth-api';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to create the account right now.';
}

export function SignupPage() {
  const signup = useSignup();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signup.mutate({
      email,
      password,
      name: name.trim() || undefined,
    });
  }

  return (
    <AuthLayout
      eyebrow="AUTH / SIGNUP"
      title="Start your run."
      subtitle="Create your CodeArena account and begin with the JavaScript starter track."
    >
      {signup.isSuccess ? (
        <div className="space-y-5">
          <div className="grid size-12 place-items-center bg-lime text-ink">
            <Check size={24} />
          </div>
          <div>
            <h2 className="text-[26px] font-extrabold">Account created.</h2>
            <p className="mt-2 text-[14px] leading-7 text-muted">
              You can sign in now with {signup.data.email}.
            </p>
          </div>
          <Link
            href="/login"
            className="flex min-h-12 w-full items-center justify-center gap-3 bg-ink px-5 text-[13px] font-extrabold text-white hover:bg-[#3c4334]"
          >
            Go to login <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label className="mb-2 block text-[12px] font-bold" htmlFor="name">
              Name
            </label>
            <div className="flex items-center gap-3 border border-line bg-paper px-3 py-3 focus-within:border-[#577f15]">
              <User size={17} className="text-muted" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-transparent text-[14px] outline-none"
                placeholder="Your name"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-bold" htmlFor="email">
              Email
            </label>
            <div className="flex items-center gap-3 border border-line bg-paper px-3 py-3 focus-within:border-[#577f15]">
              <Mail size={17} className="text-muted" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-[14px] outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-bold" htmlFor="password">
              Password
            </label>
            <div className="flex items-center gap-3 border border-line bg-paper px-3 py-3 focus-within:border-[#577f15]">
              <Lock size={17} className="text-muted" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={15}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-[14px] outline-none"
                placeholder="15 characters minimum"
              />
              <button
                type="button"
                className="grid size-8 place-items-center text-muted hover:text-ink"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          {signup.isError && (
            <p className="border border-[#efb4a8] bg-[#fff4f0] px-3 py-2 text-[13px] font-semibold text-[#8d2f1d]">
              {getErrorMessage(signup.error)}
            </p>
          )}
          <button
            type="submit"
            disabled={signup.isPending}
            className="flex min-h-12 w-full items-center justify-center gap-3 bg-ink px-5 text-[13px] font-extrabold text-white hover:bg-[#3c4334]"
          >
            {signup.isPending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <ArrowRight size={17} />
            )}
            Create account
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-[13px] text-muted">
        Already have an account?{' '}
        <Link className="font-bold text-ink underline underline-offset-4" href="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
