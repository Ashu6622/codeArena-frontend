'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Braces,
  CheckCircle2,
  Clock3,
  FileCode2,
  Loader2,
  MemoryStick,
  Play,
  RotateCcw,
  Send,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useRunCode } from '@/features/execution/run-code-api';
import { useSubmitCode } from '@/features/submissions/submit-code-api';
import { ApiError } from '@/lib/api-client';
import { useProblem, type ProblemDetail, type ProblemLanguageConfig } from './problems-api';

function formatDifficulty(difficulty: ProblemDetail['difficulty']) {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
}

function formatLanguage(language: ProblemLanguageConfig['language']) {
  return language === 'JAVASCRIPT' ? 'JavaScript' : 'Python';
}

function formatVerdict(verdict: string) {
  return verdict
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function formatJson(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load this problem right now.';
}

export function ProblemWorkspace({ slug }: { slug: string }) {
  const { data: problem, isError, isLoading, error } = useProblem(slug);
  const runCode = useRunCode();
  const submitCode = useSubmitCode();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const language = useMemo(
    () =>
      problem?.languages.find((item) => item.language === selectedLanguage) ??
      problem?.languages[0],
    [problem?.languages, selectedLanguage],
  );
  const [codeDraft, setCodeDraft] = useState<string | null>(null);
  const code = codeDraft ?? language?.starterCode ?? '';

  function resetCode() {
    setCodeDraft(null);
    runCode.reset();
    submitCode.reset();
  }

  function runSampleTests() {
    if (!problem || !language || !code.trim()) return;
    submitCode.reset();
    runCode.mutate({
      problemSlug: problem.slug,
      language: language.language,
      code,
    });
  }

  function submitSolution() {
    if (!problem || !language || !code.trim()) return;
    runCode.reset();
    submitCode.mutate({
      problemSlug: problem.slug,
      language: language.language,
      code,
    });
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
          <Loader2 size={18} className="animate-spin text-[#739830]" /> Loading workspace
        </div>
      </main>
    );
  }

  if (isError || !problem || !language) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="w-full max-w-md border border-line bg-white p-7 shadow-[8px_8px_0_#20231e]">
          <Terminal size={28} className="mb-5 text-[#739830]" />
          <h1 className="text-[30px] font-extrabold">Problem unavailable</h1>
          <p className="mt-3 text-[14px] leading-7 text-muted">{errorMessage(error)}</p>
          <Link
            className="mt-7 inline-flex items-center gap-3 text-[13px] font-extrabold"
            href="/#problems"
          >
            <ArrowLeft size={16} /> Back to problems
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-[rgba(248,249,245,0.97)]">
        <div className="mx-auto flex h-17 w-[min(1280px,calc(100%_-_32px))] items-center justify-between gap-4">
          <Link href="/" className="brand text-[20px]" aria-label="CodeArena home">
            <span className="brand-symbol">
              <Terminal size={18} strokeWidth={2.5} />
            </span>
            <span>CodeArena.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/#problems"
              className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
            >
              <ArrowLeft size={15} /> Problem list
            </Link>
            <Link
              href="/logout"
              className="inline-flex items-center gap-2 text-[12px] font-extrabold text-muted hover:text-ink"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-[min(1280px,calc(100%_-_32px))] grid-cols-[0.92fr_1.08fr] gap-4 py-4 max-[980px]:grid-cols-1">
        <section className="min-w-0 border border-line bg-white">
          <div className="border-b border-line p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
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
            <h1 className="text-[38px] font-extrabold leading-tight max-[560px]:text-[30px]">
              {problem.title}
            </h1>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-muted">
              {problem.description}
            </p>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] text-muted">
              <Braces size={15} className="text-[#739830]" /> SAMPLE TEST CASES
            </div>
            <div className="space-y-4">
              {problem.testCases.map((testCase, index) => (
                <article className="border border-line bg-paper" key={testCase.id}>
                  <div className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-[10px] text-muted">
                    <span>Example {index + 1}</span>
                    <span>sample</span>
                  </div>
                  <div className="grid gap-0 min-[640px]:grid-cols-2">
                    <div className="border-b border-line p-4 min-[640px]:border-r min-[640px]:border-b-0">
                      <div className="mb-2 font-mono text-[10px] font-semibold text-muted">
                        Input
                      </div>
                      <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-6">
                        {formatJson(testCase.input)}
                      </pre>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 font-mono text-[10px] font-semibold text-muted">
                        Expected
                      </div>
                      <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-6">
                        {formatJson(testCase.expectedOutput)}
                      </pre>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-[5px] border border-[#353b2f] bg-[#242922] text-[#d4dbca]">
          <div className="workspace-titlebar">
            <div className="workspace-identity">
              <FileCode2 size={16} />
              <span>WORKSPACE</span>
              <span className="slash">/</span>
              <span className="workspace-file">{problem.slug}</span>
            </div>
            <span className="live-label">
              <i /> Starter
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3d4638] px-4 py-3">
            <label className="flex items-center gap-3 font-mono text-[10px] text-[#a4ae9b]">
              Language
              <select
                value={selectedLanguage}
                onChange={(event) => {
                  const nextLanguage = problem.languages.find(
                    (item) => item.language === event.target.value,
                  );
                  setSelectedLanguage(event.target.value);
                  setCodeDraft(nextLanguage?.starterCode ?? '');
                  runCode.reset();
                  submitCode.reset();
                }}
                className="border border-[#4b5644] bg-[#1d211b] px-3 py-2 text-[12px] text-[#f5f7ef] outline-none focus:border-lime"
              >
                {problem.languages.map((item) => (
                  <option value={item.language} key={item.language}>
                    {formatLanguage(item.language)}
                  </option>
                ))}
              </select>
            </label>
            <span className="font-mono text-[10px] text-[#a4ae9b]">
              {language.functionSignature}
            </span>
          </div>

          <textarea
            aria-label="Code editor"
            value={code}
            onChange={(event) => {
              setCodeDraft(event.target.value);
              runCode.reset();
              submitCode.reset();
            }}
            spellCheck={false}
            className="min-h-[520px] w-full resize-y border-0 bg-[#181c17] p-5 font-mono text-[13px] leading-7 text-[#eef4e8] outline-none selection:bg-lime selection:text-ink max-[560px]:min-h-[420px]"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#3d4638] px-4 py-3">
            <span className="font-mono text-[10px] text-[#a4ae9b]">
              Run checks samples. Submit judges hidden tests and saves the attempt.{' '}
              <Link
                href="/submissions"
                className="font-bold text-[#d4dbca] underline underline-offset-4"
              >
                View submissions
              </Link>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetCode}
                className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#4b5644] bg-transparent px-3 text-[12px] font-bold text-[#d4dbca] hover:bg-[#30382c]"
              >
                <RotateCcw size={15} /> Reset
              </button>
              <button
                type="button"
                onClick={runSampleTests}
                disabled={runCode.isPending || submitCode.isPending || !code.trim()}
                className="inline-flex min-h-10 items-center justify-center gap-2 bg-lime px-3 text-[12px] font-extrabold text-ink hover:bg-[#dfff81] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {runCode.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Play size={14} fill="currentColor" />
                )}
                {runCode.isPending ? 'Running' : 'Run'}
              </button>
              <button
                type="button"
                onClick={submitSolution}
                disabled={runCode.isPending || submitCode.isPending || !code.trim()}
                className="inline-flex min-h-10 items-center justify-center gap-2 bg-white px-3 text-[12px] font-extrabold text-ink hover:bg-[#f1f4e8] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitCode.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {submitCode.isPending ? 'Submitting' : 'Submit'}
              </button>
            </div>
          </div>

          <div className="border-t border-[#3d4638] bg-[#1d211b] p-4" aria-live="polite">
            {runCode.isIdle && submitCode.isIdle ? (
              <div className="font-mono text-[11px] leading-6 text-[#a4ae9b]">
                Run samples or submit for full judging.
              </div>
            ) : runCode.isPending ? (
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#d4dbca]">
                <Loader2 size={15} className="animate-spin text-lime" /> Running sample tests
              </div>
            ) : submitCode.isPending ? (
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#d4dbca]">
                <Loader2 size={15} className="animate-spin text-lime" /> Judging submission
              </div>
            ) : runCode.isError ? (
              <div className="flex items-start gap-3 border border-[#6b352e] bg-[#321f1c] p-3 text-[13px] text-[#ffd6ce]">
                <XCircle size={16} />
                <span>{errorMessage(runCode.error)}</span>
              </div>
            ) : submitCode.isError ? (
              <div className="flex items-start gap-3 border border-[#6b352e] bg-[#321f1c] p-3 text-[13px] text-[#ffd6ce]">
                <XCircle size={16} />
                <span>{errorMessage(submitCode.error)}</span>
              </div>
            ) : submitCode.data ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border border-[#3d4638] bg-[#242922] p-3">
                  <div className="flex items-center gap-2 text-[13px] font-extrabold">
                    {submitCode.data.passed ? (
                      <CheckCircle2 size={17} className="text-lime" />
                    ) : (
                      <XCircle size={17} className="text-[#ffb4a8]" />
                    )}
                    {formatVerdict(submitCode.data.verdict)}
                  </div>
                  <span className="font-mono text-[10px] text-[#a4ae9b]">
                    {submitCode.data.passedCount}/{submitCode.data.totalCount} passed ·{' '}
                    {submitCode.data.submission.runtimeMs ?? 0}ms
                  </span>
                </div>
                <div className="grid gap-3 min-[720px]:grid-cols-2">
                  <div className="border border-[#3d4638] bg-[#181c17] p-3">
                    <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">Submission</div>
                    <Link
                      href={'/submissions/' + submitCode.data.submission.id}
                      className="inline-flex font-mono text-[12px] text-[#eef4e8] underline underline-offset-4 hover:text-lime"
                    >
                      #{submitCode.data.submission.id.slice(0, 8)} ·{' '}
                      {submitCode.data.submission.status}
                    </Link>
                  </div>
                  <div className="border border-[#3d4638] bg-[#181c17] p-3">
                    <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">Hidden tests</div>
                    <div className="font-mono text-[12px] text-[#eef4e8]">
                      {submitCode.data.hiddenResults.passedCount}/
                      {submitCode.data.hiddenResults.totalCount} passed
                    </div>
                  </div>
                </div>
                {submitCode.data.sampleResults.map((result, index) => (
                  <article className="border border-[#3d4638] bg-[#181c17]" key={result.testCaseId}>
                    <div className="flex items-center justify-between gap-3 border-b border-[#3d4638] px-3 py-2">
                      <span className="font-mono text-[10px] text-[#a4ae9b]">
                        Sample {index + 1}
                      </span>
                      <span
                        className={
                          'inline-flex items-center gap-1.5 font-mono text-[10px] ' +
                          (result.passed ? 'text-lime' : 'text-[#ffb4a8]')
                        }
                      >
                        {result.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {formatVerdict(result.verdict)}
                      </span>
                    </div>
                    <div className="grid gap-0 min-[720px]:grid-cols-3">
                      <div className="border-b border-[#3d4638] p-3 min-[720px]:border-r min-[720px]:border-b-0">
                        <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">Expected</div>
                        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-6 text-[#eef4e8]">
                          {formatJson(result.expectedOutput)}
                        </pre>
                      </div>
                      <div className="border-b border-[#3d4638] p-3 min-[720px]:border-r min-[720px]:border-b-0">
                        <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">Output</div>
                        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-6 text-[#eef4e8]">
                          {result.actualOutput === undefined
                            ? 'No output'
                            : formatJson(result.actualOutput)}
                        </pre>
                      </div>
                      <div className="p-3">
                        <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">Runtime</div>
                        <div className="font-mono text-[12px] text-[#eef4e8]">
                          {result.runtimeMs}ms
                        </div>
                        {result.error && (
                          <p className="mt-3 text-[12px] leading-5 text-[#ffb4a8]">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : runCode.data ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border border-[#3d4638] bg-[#242922] p-3">
                  <div className="flex items-center gap-2 text-[13px] font-extrabold">
                    {runCode.data.passed ? (
                      <CheckCircle2 size={17} className="text-lime" />
                    ) : (
                      <XCircle size={17} className="text-[#ffb4a8]" />
                    )}
                    {formatVerdict(runCode.data.verdict)}
                  </div>
                  <span className="font-mono text-[10px] text-[#a4ae9b]">
                    {runCode.data.passedCount}/{runCode.data.totalCount} passed ·{' '}
                    {runCode.data.runtimeMs}ms
                  </span>
                </div>
                {runCode.data.results.map((result, index) => (
                  <article className="border border-[#3d4638] bg-[#181c17]" key={result.testCaseId}>
                    <div className="flex items-center justify-between gap-3 border-b border-[#3d4638] px-3 py-2">
                      <span className="font-mono text-[10px] text-[#a4ae9b]">
                        Sample {index + 1}
                      </span>
                      <span
                        className={
                          'inline-flex items-center gap-1.5 font-mono text-[10px] ' +
                          (result.passed ? 'text-lime' : 'text-[#ffb4a8]')
                        }
                      >
                        {result.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {formatVerdict(result.verdict)}
                      </span>
                    </div>
                    <div className="grid gap-0 min-[720px]:grid-cols-3">
                      <div className="border-b border-[#3d4638] p-3 min-[720px]:border-r min-[720px]:border-b-0">
                        <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">Expected</div>
                        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-6 text-[#eef4e8]">
                          {formatJson(result.expectedOutput)}
                        </pre>
                      </div>
                      <div className="border-b border-[#3d4638] p-3 min-[720px]:border-r min-[720px]:border-b-0">
                        <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">Output</div>
                        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-6 text-[#eef4e8]">
                          {result.actualOutput === undefined
                            ? 'No output'
                            : formatJson(result.actualOutput)}
                        </pre>
                      </div>
                      <div className="p-3">
                        <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">Runtime</div>
                        <div className="font-mono text-[12px] text-[#eef4e8]">
                          {result.runtimeMs}ms
                        </div>
                        {result.error && (
                          <p className="mt-3 text-[12px] leading-5 text-[#ffb4a8]">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
