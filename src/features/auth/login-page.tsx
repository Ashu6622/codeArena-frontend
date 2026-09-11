'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { AuthLayout } from './auth-layout';
import { useLogin } from './auth-api';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to sign in right now.';
}

export function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.push('/#problems'),
      },
    );
  }

  return (
    <AuthLayout
      eyebrow="AUTH / LOGIN"
      title="Enter the arena."
      subtitle="Pick up where you left off and keep your problem-solving streak alive."
    >
      <form className="space-y-5" onSubmit={submit}>
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
              autoComplete="current-password"
              required
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent text-[14px] outline-none"
              placeholder="Your password"
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
        {login.isError && (
          <p className="border border-[#efb4a8] bg-[#fff4f0] px-3 py-2 text-[13px] font-semibold text-[#8d2f1d]">
            {getErrorMessage(login.error)}
          </p>
        )}
        <button
          type="submit"
          disabled={login.isPending}
          className="flex min-h-12 w-full items-center justify-center gap-3 bg-ink px-5 text-[13px] font-extrabold text-white hover:bg-[#3c4334]"
        >
          {login.isPending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <ArrowRight size={17} />
          )}
          Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted">
        New here?{' '}
        <Link className="font-bold text-ink underline underline-offset-4" href="/signup">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
