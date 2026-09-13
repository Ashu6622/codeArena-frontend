'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  CheckCheck,
  ChevronDown,
  Code2,
  Copy,
  CornerDownLeft,
  FileCode2,
  Layers,
  Menu,
  Play,
  RotateCcw,
  Search,
  Terminal,
  X,
} from 'lucide-react';
import { getServerAuthSnapshot, hasAccessToken, subscribeToAuthSession } from '@/lib/auth-session';
import { useProblems, type ProblemListItem } from '@/features/problems/problems-api';
import {
  previewProblems,
  runPreview,
  type PreviewProblem,
} from '@/features/problems/preview-problems';
import { AlgorithmScene } from './algorithm-scene';

function toPreviewProblem(problem: ProblemListItem, index: number): PreviewProblem {
  const preview = previewProblems.find((item) => item.id === problem.slug);
  return {
    id: problem.slug,
    number: preview?.number ?? String(index + 1).padStart(3, '0'),
    title: problem.title,
    difficulty:
      problem.difficulty === 'EASY' ? 'Easy' : problem.difficulty === 'MEDIUM' ? 'Medium' : 'Hard',
    topics:
      problem.tags.length > 0
        ? problem.tags.map((tag) => tag.name)
        : (preview?.topics ?? problem.languages.map((language) => language.toLowerCase())),
    progressStatus: problem.progressStatus,
    isBookmarked: problem.isBookmarked,
    description: preview?.description ?? 'Open the full workspace to read this problem statement.',
    inputLabel: preview?.inputLabel ?? 'input',
    input: preview?.input ?? '{}',
    target: preview?.target,
    expected: preview?.expected ?? '',
    explanation: preview?.explanation ?? 'Sample details will appear in the problem workspace.',
    complexity: preview?.complexity ?? 'O(?)',
    code: preview?.code ?? `function solution(input) {\n  // TODO\n}`,
  };
}

function formatProgressStatus(status: NonNullable<ProblemListItem['progressStatus']>) {
  if (status === 'SOLVED') return 'Solved';
  if (status === 'ATTEMPTED') return 'Attempted';
  return 'Not started';
}

function HighlightedCode({ code }: { code: string }) {
  return (
    <pre className="source-code" tabIndex={0} aria-label="JavaScript sample solution">
      <code>
        {code.split('\n').map((line, index) => (
          <span className="code-line" key={index}>
            <span className="line-number" aria-hidden="true">
              {index + 1}
            </span>
            <span>
              {line
                .split(
                  /(\b(?:function|const|let|for|if|else|return|new|while|of|true|false|null)\b|'[^']*'|\b\d+\b)/g,
                )
                .map((token, i) => {
                  const kind = /^(function|const|let|for|if|else|return|new|while|of)$/.test(token)
                    ? 'keyword'
                    : /^'/.test(token)
                      ? 'string'
                      : /^(\d+|true|false|null)$/.test(token)
                        ? 'number'
                        : '';
                  return (
                    <span className={kind} key={i}>
                      {token}
                    </span>
                  );
                })}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}

function Playground({ problem }: { problem: PreviewProblem }) {
  const [input, setInput] = useState(problem.input);
  const [target, setTarget] = useState(problem.target ?? '');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('description');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  function run() {
    setRunning(true);
    setError('');
    setResult(null);
    timer.current = setTimeout(() => {
      try {
        setResult(runPreview(problem.id, input, target));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Check the sample input.');
      } finally {
        setRunning(false);
      }
    }, 250);
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setInput(problem.input);
    setTarget(problem.target ?? '');
    setError('');
    setResult(null);
    setRunning(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(problem.code);
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Clipboard unavailable. Select the solution to copy it.');
    }
  }

  return (
    <div className="playground" id="playground">
      <div className="workspace-titlebar">
        <div className="workspace-identity">
          <Terminal size={16} />
          <span>THE PLAYGROUND</span>
          <span className="slash">/</span>
          <span className="workspace-file">{problem.id}</span>
        </div>
        <span className="live-label">
          <i /> Live sample
        </span>
      </div>
      <div className="workspace-columns">
        <section className="problem-pane" aria-label="Sample problem">
          <div
            className="pane-tabs"
            role="tablist"
            aria-label="Problem details"
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const nextTab =
                event.key === 'Home'
                  ? 'description'
                  : event.key === 'End'
                    ? 'approach'
                    : tab === 'description'
                      ? 'approach'
                      : 'description';
              setTab(nextTab);
              document.getElementById(nextTab + '-tab')?.focus();
            }}
          >
            <button
              role="tab"
              aria-selected={tab === 'description'}
              tabIndex={tab === 'description' ? 0 : -1}
              aria-controls="problem-description"
              id="description-tab"
              onClick={() => setTab('description')}
              className={tab === 'description' ? 'active' : ''}
            >
              <BookOpen size={14} /> Description
            </button>
            <button
              role="tab"
              aria-selected={tab === 'approach'}
              tabIndex={tab === 'approach' ? 0 : -1}
              aria-controls="problem-description"
              id="approach-tab"
              onClick={() => setTab('approach')}
              className={tab === 'approach' ? 'active' : ''}
            >
              <Layers size={14} /> Approach
            </button>
          </div>
          <div
            className="problem-description"
            id="problem-description"
            role="tabpanel"
            aria-labelledby={tab === 'description' ? 'description-tab' : 'approach-tab'}
          >
            <div className="problem-meta">
              <span className={'difficulty ' + problem.difficulty.toLowerCase()}>
                {problem.difficulty}
              </span>
              <span>{problem.topics.join(' / ')}</span>
            </div>
            <h3>
              <span>{Number(problem.number)}.</span> {problem.title}
            </h3>
            {tab === 'description' ? (
              <>
                <p>{problem.description}</p>
                <div className="example-label">EXAMPLE 01</div>
                <dl className="example-data">
                  <div>
                    <dt>Input</dt>
                    <dd>
                      {problem.inputLabel} = {problem.input}
                      {problem.target !== undefined && (
                        <>
                          <br />
                          target = {problem.target}
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Output</dt>
                    <dd className="example-answer">{problem.expected}</dd>
                  </div>
                </dl>
                <p className="explanation">{problem.explanation}</p>
              </>
            ) : (
              <>
                <p>{problem.explanation}</p>
                <div className="approach-note">
                  <Braces size={20} />
                  <div>
                    <strong>{problem.complexity} time complexity</strong>
                    <p>
                      {problem.id === 'two-sum'
                        ? 'Keep a map of the values already visited. For each number, look for its complement before adding it to the map.'
                        : problem.id === 'valid-parentheses'
                          ? 'Push opening brackets onto a stack. Each closing bracket must match the most recent opening bracket.'
                          : problem.id === 'binary-search'
                            ? 'Compare the middle value with the target, then continue in the left or right half.'
                            : 'Move a sliding window through the string, shifting its left edge past repeated characters.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="problem-pane-footer">
            <span>
              <CheckCheck size={14} /> Small steps. Stronger instincts.
            </span>
            <span>JS</span>
          </div>
        </section>
        <section className="code-pane" aria-label="Sample solution and runner">
          <div className="code-toolbar">
            <span>
              <FileCode2 size={14} />
              <span>solution.js</span>
              <span className="readonly">READ ONLY</span>
            </span>
            <div>
              <span className="language">JavaScript</span>
              <button
                className="icon-button"
                onClick={copy}
                aria-label={copied ? 'Copied solution' : 'Copy solution'}
                title={copied ? 'Copied' : 'Copy solution'}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>
          <HighlightedCode code={problem.code} />
          <div className="runner">
            <div className="runner-heading">
              <span>
                <Terminal size={13} /> Test case
              </span>
              <span>Custom input</span>
            </div>
            <div className="runner-inputs">
              <label>
                <span>{problem.inputLabel}</span>
                <input
                  aria-label="Sample input"
                  value={input}
                  maxLength={256}
                  onChange={(event) => {
                    setInput(event.target.value);
                    setResult(null);
                    setError('');
                  }}
                  disabled={running}
                  spellCheck={false}
                />
              </label>
              {problem.target !== undefined && (
                <label className="target-input">
                  <span>target</span>
                  <input
                    aria-label="Target"
                    value={target}
                    onChange={(event) => {
                      setTarget(event.target.value);
                      setResult(null);
                      setError('');
                    }}
                    maxLength={12}
                    disabled={running}
                    inputMode="numeric"
                  />
                </label>
              )}
            </div>
            <div
              className={'run-result ' + (error ? 'has-error' : '')}
              role="status"
              aria-live="polite"
            >
              {error ? (
                <>
                  <X size={14} />
                  <span>{error}</span>
                </>
              ) : result !== null ? (
                <>
                  <Check size={14} />
                  <span>
                    Output <strong data-testid="sample-output">{result}</strong>
                  </span>
                  <span className="result-label">Sample complete</span>
                </>
              ) : (
                <>
                  <CornerDownLeft size={14} />
                  <span>Output appears here</span>
                </>
              )}
            </div>
            <div className="runner-actions">
              <span>Sample solution · Runs locally</span>
              <div>
                <button
                  className="icon-button reset-button"
                  onClick={reset}
                  title="Reset sample"
                  aria-label="Reset sample"
                >
                  <RotateCcw size={15} />
                </button>
                <button className="run-button" onClick={run} disabled={running}>
                  <Play size={13} fill="currentColor" />
                  {running ? 'Running...' : 'Run sample'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const bookmarkFilters = [
  { label: 'All saved' },
  { label: 'Bookmarked', bookmarked: true },
  { label: 'Not bookmarked', bookmarked: false },
] as const;

const progressFilters = [
  { label: 'All progress' },
  { label: 'Solved', status: 'SOLVED' },
  { label: 'Attempted', status: 'ATTEMPTED' },
  { label: 'Not started', status: 'NOT_STARTED' },
] as const;

const problemFilters = [
  { label: 'All problems' },
  { label: 'Arrays', slug: 'array', matches: ['array', 'arrays'] },
  { label: 'Strings', slug: 'string', matches: ['string', 'strings'] },
] as const;

const questions = [
  [
    'What is CodeArena?',
    'CodeArena is a focused place to practice coding problems, test your thinking, and understand why a solution works. This first preview starts with JavaScript.',
  ],
  [
    'Do I need to be an experienced developer?',
    'No. Start with an Easy problem, work through the example, and compare your thinking with the sample solution. Move to harder problems at your own pace.',
  ],
  [
    'Can I run my own code here?',
    'This playground runs the displayed sample solutions with your own inputs. An editable coding workspace and judged submissions are being built next.',
  ],
  [
    'Are my results saved?',
    'Not in this preview. Sample runs stay in your browser and are not saved as submissions. Account-based submission history is part of the planned workspace.',
  ],
];

export function LandingPage() {
  const selected = previewProblems[0];
  const [filter, setFilter] = useState('All problems');
  const [progressFilter, setProgressFilter] = useState('All progress');
  const [bookmarkFilter, setBookmarkFilter] = useState('All saved');
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthSession,
    hasAccessToken,
    getServerAuthSnapshot,
  );
  const selectedFilter = problemFilters.find((item) => item.label === filter) ?? problemFilters[0];
  const selectedProgressFilter =
    progressFilters.find((item) => item.label === progressFilter) ?? progressFilters[0];
  const selectedBookmarkFilter =
    bookmarkFilters.find((item) => item.label === bookmarkFilter) ?? bookmarkFilters[0];
  const { data, isError, isLoading } = useProblems({
    limit: 20,
    language: 'JAVASCRIPT',
    tag: 'slug' in selectedFilter ? selectedFilter.slug : undefined,
    progressStatus:
      isAuthenticated && 'status' in selectedProgressFilter
        ? selectedProgressFilter.status
        : undefined,
    bookmarked:
      isAuthenticated && 'bookmarked' in selectedBookmarkFilter
        ? selectedBookmarkFilter.bookmarked
        : undefined,
    search: query.trim() || undefined,
  });
  const apiProblems = data?.items.map(toPreviewProblem) ?? [];
  const sourceProblems = apiProblems.length > 0 ? apiProblems : previewProblems;
  const visibleProblems = sourceProblems.filter((problem) => {
    const topics = problem.topics.map((topic) => topic.toLowerCase());
    const matchesFilter =
      !('matches' in selectedFilter) ||
      topics.some((topic) => (selectedFilter.matches as readonly string[]).includes(topic));
    const matchesProgress =
      !isAuthenticated ||
      !('status' in selectedProgressFilter) ||
      problem.progressStatus === selectedProgressFilter.status;
    const matchesBookmark =
      !isAuthenticated ||
      !('bookmarked' in selectedBookmarkFilter) ||
      problem.isBookmarked === selectedBookmarkFilter.bookmarked;
    const matchesSearch = (problem.title + ' ' + problem.topics.join(' '))
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesFilter && matchesProgress && matchesBookmark && matchesSearch;
  });
  const totalProblems = data?.pagination.total ?? sourceProblems.length;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="CodeArena home">
            <span className="brand-symbol">
              <Terminal size={20} strokeWidth={2.5} />
            </span>
            <span>
              CodeArena<span className="brand-dot">.</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#problems">Problems</a>
            <Link href="/leaderboard">Leaderboard</Link>
            <a href="#process">The process</a>
            <a href="#faq">FAQs</a>
            {isAuthenticated ? (
              <>
                <Link href="/profile">Profile</Link>
                <Link href="/submissions">Submissions</Link>
                <Link href="/logout">Logout</Link>
              </>
            ) : (
              <a href="/login">Login</a>
            )}
          </nav>
          <Link className="header-cta" href={isAuthenticated ? '/submissions' : '/signup'}>
            {isAuthenticated ? 'View submissions' : 'Create account'} <ArrowUpRight size={16} />
          </Link>
          <button
            className="mobile-menu-button icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
            <a href="#problems" onClick={() => setMenuOpen(false)}>
              Problems <ArrowUpRight size={16} />
            </a>
            <Link href="/leaderboard" onClick={() => setMenuOpen(false)}>
              Leaderboard <ArrowUpRight size={16} />
            </Link>
            <a href="#process" onClick={() => setMenuOpen(false)}>
              The process <ArrowUpRight size={16} />
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>
              FAQs <ArrowUpRight size={16} />
            </a>
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)}>
                  Profile <ArrowUpRight size={16} />
                </Link>
                <Link href="/submissions" onClick={() => setMenuOpen(false)}>
                  Submissions <ArrowUpRight size={16} />
                </Link>
                <Link href="/logout" onClick={() => setMenuOpen(false)}>
                  Logout <ArrowUpRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <a href="/login" onClick={() => setMenuOpen(false)}>
                  Login <ArrowUpRight size={16} />
                </a>
                <a href="/signup" onClick={() => setMenuOpen(false)}>
                  Signup <ArrowUpRight size={16} />
                </a>
              </>
            )}
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <AlgorithmScene />
          <div className="hero-content">
            <div className="eyebrow hero-eyebrow">
              <span className="status-square" /> A PLACE FOR PROBLEM SOLVERS
            </div>
            <h1 id="hero-title">
              Code<span>Arena</span>
              <span className="title-cursor">_</span>
            </h1>
            <p className="hero-line">
              Good instincts are built.
              <br className="mobile-break" /> One problem at a time.
            </p>
            <p className="hero-description">
              Think it through. Write it out. Make it work.
              <br />
              Your next breakthrough starts with a little practice.
            </p>
            <div className="hero-actions">
              <a className="button button-lime" href="#playground">
                Find your first challenge <ArrowUpRight size={18} />
              </a>
              <a className="text-link" href="#process">
                See the process <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-footnote">
              <Code2 size={14} />
              <span>JavaScript first</span>
              <span className="tiny-divider" />
              <span>No shortcuts. Just progress.</span>
            </div>
          </div>
          <div className="hero-bottom-label">
            <span>01 / THE PRACTICE GROUND</span>
            <span>THINK → CODE → REPEAT</span>
          </div>
        </section>

        <section className="playground-section" aria-label="Interactive coding playground">
          <div className="section-container">
            <Playground key={selected.id} problem={selected} />
            <div className="below-workspace">
              <span>
                <span className="small-cross">+</span> A problem. A blank page. A place to begin.
              </span>
              <a href="#problems">
                Find another challenge <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        <section className="process-section section-container" id="process">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / THE PROCESS</span>
              <h2>
                Get stuck.
                <br />
                Then get better.
              </h2>
            </div>
            <p>
              That moment when it finally clicks?
              <br />
              You earn it one attempt at a time.
            </p>
          </div>
          <div className="process-grid">
            <article>
              <div className="step-top">
                <span>01</span>
                <Search size={24} />
              </div>
              <h3>Find your challenge.</h3>
              <p>
                Start with familiar ground or stretch into something new. Pick a problem that makes
                you think.
              </p>
              <span className="step-tag">CURIOSITY FIRST</span>
            </article>
            <article>
              <div className="step-top">
                <span>02</span>
                <Code2 size={24} />
              </div>
              <h3>Work the problem.</h3>
              <p>
                Trace an example. Try an approach. Look beyond getting the answer to understanding
                the why.
              </p>
              <span className="step-tag">THINK IN CODE</span>
            </article>
            <article>
              <div className="step-top">
                <span>03</span>
                <RotateCcw size={24} />
              </div>
              <h3>Make another attempt.</h3>
              <p>
                Change an input. Find the edge case. Every wrong turn is another thing you now know.
              </p>
              <span className="step-tag">PROGRESS, NOT PERFECTION</span>
            </article>
          </div>
        </section>

        <section className="problems-section" id="problems">
          <div className="section-container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">03 / PICK A STARTING POINT</span>
                <h2>
                  Small problems.
                  <br />
                  Real thinking.
                </h2>
              </div>
              <span className="collection-note">
                <Braces size={18} /> THE STARTER COLLECTION{' '}
                <span>{String(totalProblems).padStart(3, '0')}</span>
              </span>
            </div>
            <div className="problem-filters">
              <div className="filter-tabs" role="group" aria-label="Filter problems">
                {problemFilters.map(({ label: item }) => (
                  <button
                    key={item}
                    className={filter === item ? 'selected' : ''}
                    aria-pressed={filter === item}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                    {item === 'All problems' && <span>{totalProblems}</span>}
                  </button>
                ))}
              </div>
              {isAuthenticated && (
                <>
                  <div className="progress-filter-tabs" role="group" aria-label="Filter progress">
                    {progressFilters.map(({ label: item }) => (
                      <button
                        key={item}
                        className={progressFilter === item ? 'selected' : ''}
                        aria-pressed={progressFilter === item}
                        onClick={() => setProgressFilter(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="progress-filter-tabs" role="group" aria-label="Filter bookmarks">
                    {bookmarkFilters.map(({ label: item }) => (
                      <button
                        key={item}
                        className={bookmarkFilter === item ? 'selected' : ''}
                        aria-pressed={bookmarkFilter === item}
                        onClick={() => setBookmarkFilter(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <label className="problem-search">
                <Search size={16} />
                <input
                  placeholder="Find a problem..."
                  aria-label="Search problems"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <span>/</span>
              </label>
            </div>
            <div className="problem-table">
              <div className="table-heading">
                <span>PROBLEM</span>
                <span>TOPIC</span>
                <span>DIFFICULTY</span>
                <span />
              </div>
              {isLoading && visibleProblems.length === 0 && (
                <div className="empty-state">
                  <Search size={24} />
                  <h3>Loading problems</h3>
                  <p>Fetching the starter collection.</p>
                </div>
              )}
              {visibleProblems.map((problem) => (
                <Link
                  className="problem-row"
                  key={problem.id}
                  href={'/problems/' + problem.id}
                  aria-label={'Open ' + problem.title}
                >
                  <span className="problem-name">
                    <span className="problem-number">{problem.number}</span>
                    <span>
                      <strong>{problem.title}</strong>
                      {problem.progressStatus && (
                        <span className={'progress-chip ' + problem.progressStatus.toLowerCase()}>
                          {formatProgressStatus(problem.progressStatus)}
                        </span>
                      )}
                      {problem.isBookmarked && (
                        <span className="progress-chip solved">Bookmarked</span>
                      )}
                    </span>
                  </span>
                  <span className="topic-tags">
                    {problem.topics.map((topic) => (
                      <span key={topic}>{topic}</span>
                    ))}
                  </span>
                  <span>
                    <span className={'difficulty ' + problem.difficulty.toLowerCase()}>
                      <i />
                      {problem.difficulty}
                    </span>
                  </span>
                  <ArrowUpRight size={19} />
                </Link>
              ))}
              {!isLoading && visibleProblems.length === 0 && (
                <div className="empty-state">
                  <Search size={24} />
                  <h3>No matching problems</h3>
                  <p>Try another title or topic.</p>
                  <button
                    className="text-link"
                    onClick={() => {
                      setQuery('');
                      setFilter('All problems');
                      setProgressFilter('All progress');
                      setBookmarkFilter('All saved');
                    }}
                  >
                    Clear filters <RotateCcw size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="collection-footer">
              <span>
                {isError
                  ? 'Showing local starter problems while the API is unavailable.'
                  : 'Seeded backend problems are powering this collection.'}
              </span>
              <span>
                MORE TO COME <span className="status-square" />
              </span>
            </div>
          </div>
        </section>

        <section className="manifesto">
          <div className="manifesto-image" aria-hidden="true" />
          <div className="section-container manifesto-content">
            <span className="eyebrow">BUILT FOR THE WORK, NOT THE NOISE.</span>
            <h2>
              You don&apos;t need
              <br />
              another tutorial.
              <br />
              <span>You need an attempt.</span>
            </h2>
            <a className="button button-lime" href="#playground">
              Make your first move <ArrowUpRight size={18} />
            </a>
            <span className="manifesto-footnote">{'// let progress = practice;'}</span>
          </div>
        </section>

        <section className="faq-section section-container" id="faq">
          <div>
            <span className="eyebrow">04 / A FEW THINGS TO KNOW</span>
            <h2>
              Before you
              <br />
              dive in.
            </h2>
            <p>
              Less guesswork.
              <br />
              More room to get going.
            </p>
          </div>
          <div className="faq-list">
            {questions.map(([question, answer], index) => (
              <div className={'faq-item ' + (openFaq === index ? 'is-open' : '')} key={question}>
                <h3>
                  <button
                    aria-expanded={openFaq === index}
                    aria-controls={'faq-answer-' + index}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="faq-number">0{index + 1}</span>
                    <span>{question}</span>
                    <ChevronDown size={18} />
                  </button>
                </h3>
                <div id={'faq-answer-' + index} hidden={openFaq !== index}>
                  <p>{answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="section-container">
          <div className="footer-top">
            <a className="brand" href="#">
              <span className="brand-symbol">
                <Terminal size={20} strokeWidth={2.5} />
              </span>
              <span>CodeArena.</span>
            </a>
            <span>A little better, one problem at a time.</span>
            <a className="text-link" href={isAuthenticated ? '/logout' : '#main'}>
              {isAuthenticated ? 'Logout' : 'Back to the top'} <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} CodeArena</span>
            <span>MADE FOR THE ONES WHO KEEP TRYING.</span>
            <span className="footer-status">
              <i /> Always a work in progress
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
