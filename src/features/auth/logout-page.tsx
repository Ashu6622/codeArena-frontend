'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { AuthLayout } from './auth-layout';
import { useLogout } from './auth-api';

export function LogoutPage() {
  const router = useRouter();
  const logout = useLogout();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    logout.mutate(undefined, {
      onSettled: () => router.replace('/login'),
    });
  }, [logout, router]);

  return (
    <AuthLayout
      eyebrow="AUTH / LOGOUT"
      title="Leaving the arena."
      subtitle="Your local access token is being cleared and this browser session is closing."
    >
      <div className="flex items-center gap-3 border border-line bg-paper px-4 py-4 text-[13px] font-bold text-muted">
        {logout.isPending ? (
          <Loader2 size={18} className="animate-spin text-[#739830]" />
        ) : (
          <LogOut size={18} className="text-[#739830]" />
        )}
        Signing out
      </div>
      <Link
        href="/login"
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center bg-ink px-5 text-[13px] font-extrabold text-white hover:bg-[#3c4334]"
      >
        Back to login
      </Link>
    </AuthLayout>
  );
}
