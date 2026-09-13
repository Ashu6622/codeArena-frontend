'use client';

import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { useSubmissionActivity, type SubmissionActivityDay } from './submit-code-api';

type HeatmapDay = SubmissionActivityDay & {
  week: number;
  weekday: number;
  column: number;
};

type MonthLabel = {
  label: string;
  column: number;
};

const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function parseUtcDate(date: string) {
  return new Date(date + 'T00:00:00.000Z');
}

function formatTooltip(day: SubmissionActivityDay) {
  const countLabel = day.count === 1 ? '1 submission' : day.count + ' submissions';
  return countLabel + ' on ' + dateFormatter.format(parseUtcDate(day.date));
}

function activityClass(count: number, maxCount: number) {
  if (count === 0) return 'bg-[#343835]';
  const level = maxCount <= 1 ? 1 : Math.max(1, Math.ceil((count / maxCount) * 4));
  return ['bg-[#81d98d]', 'bg-[#52c86f]', 'bg-[#25a64c]', 'bg-[#0f7f33]'][level - 1];
}

function buildHeatmap(days: SubmissionActivityDay[]) {
  if (days.length === 0)
    return {
      cells: [] as HeatmapDay[],
      monthLabels: [] as MonthLabel[],
      gridColumns: '',
    };
  const firstWeekday = parseUtcDate(days[0].date).getUTCDay();
  const baseCells = days.map((day, index) => ({
    ...day,
    week: Math.floor((index + firstWeekday) / 7),
    weekday: (index + firstWeekday) % 7,
  }));
  const weeks = Math.max(...baseCells.map((cell) => cell.week)) + 1;
  const monthStartWeeks = new Set<number>();

  for (const cell of baseCells) {
    const date = parseUtcDate(cell.date);
    if (date.getUTCDate() === 1 && cell.week > 0) monthStartWeeks.add(cell.week);
  }

  const weekColumns = new Map<number, number>();
  const templateColumns: string[] = [];
  for (let week = 0; week < weeks; week += 1) {
    if (monthStartWeeks.has(week)) templateColumns.push('10px');
    templateColumns.push('14px');
    weekColumns.set(week, templateColumns.length);
  }

  const cells: HeatmapDay[] = baseCells.map((cell) => ({
    ...cell,
    column: weekColumns.get(cell.week) ?? cell.week + 1,
  }));
  const monthLabels: MonthLabel[] = [];

  for (const cell of cells) {
    const date = parseUtcDate(cell.date);
    if (date.getUTCDate() !== 1) continue;
    const label = monthFormatter.format(date);
    if (monthLabels.at(-1)?.label !== label) {
      monthLabels.push({ label, column: cell.column });
    }
  }

  return { cells, monthLabels, gridColumns: templateColumns.join(' ') };
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return 'Unable to load activity right now.';
}

export function SubmissionActivityHeatmap() {
  const activity = useSubmissionActivity();

  return (
    <section className="overflow-hidden border border-[#353b2f] bg-[#242922] p-5 text-[#d4dbca]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 font-mono text-[10px] text-[#a4ae9b]">SUBMISSION ACTIVITY</div>
          <h2 className="text-[22px] font-extrabold text-white">Daily activity</h2>
        </div>
        {activity.data && (
          <span className="font-mono text-[11px] text-[#a4ae9b]">
            {activity.data.totalSubmissions} submissions · {activity.data.from} to{' '}
            {activity.data.to}
          </span>
        )}
      </div>

      {activity.isLoading ? (
        <div className="flex items-center gap-3 font-mono text-[11px] text-[#a4ae9b]">
          <Loader2 size={15} className="animate-spin text-lime" /> Loading activity
        </div>
      ) : activity.isError ? (
        <div className="border border-[#6b352e] bg-[#321f1c] p-3 text-[13px] text-[#ffd6ce]">
          {errorMessage(activity.error)}
        </div>
      ) : activity.data ? (
        <HeatmapGrid days={activity.data.days} maxCount={activity.data.maxCount} />
      ) : null}
    </section>
  );
}

function HeatmapGrid({ days, maxCount }: { days: SubmissionActivityDay[]; maxCount: number }) {
  const { cells, monthLabels, gridColumns } = buildHeatmap(days);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-max">
        <div
          className="mb-2 grid h-5 items-end font-mono text-[10px] text-[#a4ae9b]"
          style={{ gridTemplateColumns: gridColumns }}
        >
          {monthLabels.map((month) => (
            <span style={{ gridColumnStart: month.column }} key={month.label + month.column}>
              {month.label}
            </span>
          ))}
        </div>
        <div
          className="grid grid-flow-col grid-rows-7 gap-[4px]"
          style={{ gridTemplateColumns: gridColumns }}
        >
          {cells.map((day) => (
            <div
              className={
                'group relative size-[14px] rounded-[3px] outline-none ring-1 ring-[#252a24] ' +
                activityClass(day.count, maxCount)
              }
              style={{ gridColumnStart: day.column, gridRowStart: day.weekday + 1 }}
              title={formatTooltip(day)}
              aria-label={formatTooltip(day)}
              tabIndex={0}
              key={day.date}
            >
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap border border-[#4b5644] bg-[#11140f] px-2 py-1 font-mono text-[10px] text-white shadow-[4px_4px_0_#000] group-hover:block group-focus:block">
                {formatTooltip(day)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 font-mono text-[10px] text-[#a4ae9b]">
          Less
          <span className="size-[12px] rounded-[3px] bg-[#343835] ring-1 ring-[#252a24]" />
          <span className="size-[12px] rounded-[3px] bg-[#81d98d] ring-1 ring-[#252a24]" />
          <span className="size-[12px] rounded-[3px] bg-[#52c86f] ring-1 ring-[#252a24]" />
          <span className="size-[12px] rounded-[3px] bg-[#25a64c] ring-1 ring-[#252a24]" />
          <span className="size-[12px] rounded-[3px] bg-[#0f7f33] ring-1 ring-[#252a24]" />
          More
        </div>
      </div>
    </div>
  );
}
