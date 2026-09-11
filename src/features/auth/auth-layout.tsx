import Link from 'next/link';
import { ArrowLeft, Braces, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid min-h-screen w-[min(1184px,calc(100%_-_40px))] grid-cols-[0.95fr_1.05fr] items-center gap-14 py-10 max-[880px]:grid-cols-1 max-[880px]:gap-8">
        <section className="max-w-xl">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-3 text-[12px] font-bold text-muted hover:text-ink"
          >
            <ArrowLeft size={16} /> Back to arena
          </Link>
          <div className="mb-5 inline-flex items-center gap-2 bg-white px-2 py-1 font-mono text-[10px] text-green ring-1 ring-line">
            <span className="inline-block size-1.5 bg-lime" /> {eyebrow}
          </div>
          <h1 className="text-[64px] font-extrabold leading-[1.03] max-[560px]:text-[44px]">
            {title}
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-8 text-muted">{subtitle}</p>
          <div className="mt-10 overflow-hidden rounded-[5px] border border-[#353b2f] bg-[#242922] text-[#d4dbca]">
            <div className="flex h-11 items-center justify-between border-b border-[#3d4638] px-4 font-mono text-[10px]">
              <span className="flex items-center gap-3">
                <Terminal size={14} className="text-lime" /> auth/session.ts
              </span>
              <span className="text-[#9faa92]">V1</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-7">
              <code>{`const session = await enterArena({
  focus: 'practice',
  language: 'javascript',
});`}</code>
            </pre>
          </div>
        </section>
        <section className="border border-line bg-white p-7 shadow-[10px_10px_0_#20231e] max-[560px]:p-5">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-5">
            <Link className="brand text-[20px]" href="/" aria-label="CodeArena home">
              <span className="brand-symbol">
                <Terminal size={18} strokeWidth={2.5} />
              </span>
              <span>CodeArena.</span>
            </Link>
            <Braces size={22} className="text-[#739830]" />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
