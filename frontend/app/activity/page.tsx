"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Flame,
  GitCommit,
  GitMerge,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { useMemo, useRef, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { LucideIcon } from "lucide-react";

import type { Commit } from "../data/activity";
import { fetchPlatformCommits, formatActivityDate } from "@/lib/activity-api";
import { DeskLoader } from "@/components/ui/desk-loader";
import { cn } from "cn";

const EMPTY_COMMITS: Commit[] = [];
const HEATMAP_WEEKS = 12;
const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function subscribe() { return () => {}; }
function useTodayLabel() {
  return useSyncExternalStore(subscribe, formatActivityDate, () => "");
}

/** Same locale format as commit.date from the backend */
function toCommitDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type HeatCell = { label: string; count: number; month: string };

function buildHeatmapGrid(commits: Commit[]) {
  const countByDate = new Map<string, number>();
  for (const c of commits) {
    countByDate.set(c.date, (countByDate.get(c.date) ?? 0) + 1);
  }
  const today = new Date();
  // Start from the Sunday of HEATMAP_WEEKS ago
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - (HEATMAP_WEEKS - 1) * 7);

  // Build columns (weeks), each with 7 rows (Sun–Sat)
  const cols: HeatCell[][] = [];
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const label = toCommitDate(date);
      col.push({
        label,
        count: countByDate.get(label) ?? 0,
        month: date.toLocaleString("en-US", { month: "short" }),
      });
    }
    cols.push(col);
  }
  return cols;
}

function heatCell(count: number) {
  if (count === 0) return "bg-neutral-100 dark:bg-neutral-800";
  if (count === 1) return "bg-primary/30";
  if (count <= 3) return "bg-primary/55";
  if (count <= 6) return "bg-primary/80";
  return "bg-primary";
}

/* ── Main ── */
export default function ActivityPage() {
  const todayLabel = useTodayLabel();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["activity", "platform-commits"],
    queryFn: fetchPlatformCommits,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const sync = () => {
    void queryClient.invalidateQueries({ queryKey: ["activity", "platform-commits"] });
  };

  const commits = data?.commits ?? EMPTY_COMMITS;
  const totalCommits = data?.count ?? 0;
  const stats = data?.stats;
  const syncing = isFetching && !isLoading;
  const errorMessage =
    error instanceof Error ? error.message : error ? "Could not load commits" : null;

  const heatmapGrid = useMemo(() => buildHeatmapGrid(commits), [commits]);
  const grouped = useMemo(() => groupCommitsByDate(commits), [commits]);
  const rows = useMemo(() => flattenActivityGroups(grouped), [grouped]);
  const parentRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (rows[index]?.type === "day" ? 40 : 72),
    overscan: 8,
  });

  return (
    <section className="flex w-full flex-col gap-4">

      {/* ── Header ── */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors"
            >
              <ArrowLeft className="size-3" aria-hidden />
              Dashboard
            </Link>
            <div className="mt-2 flex items-baseline gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                Platform activity
              </h1>
              <span className="font-mono text-[11px] tabular-nums text-neutral-400">
                {isLoading ? "…" : `${totalCommits} commits`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={sync}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2 font-mono text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            <RotateCcw className={cn("size-3", syncing && "animate-spin")} aria-hidden />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4 items-start">

        {/* ── Left: stats + heatmap (sticky) ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-4">

          {/* Stats */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 divide-y divide-neutral-100 dark:divide-neutral-800">
            <StatRow icon={Flame}     label="Current streak" value={isLoading || !stats ? "—" : `${stats.currentStreak}`} unit="days"    iconClass="text-orange-600 dark:text-orange-400/80 bg-orange-50 dark:bg-orange-950/40" />
            <StatRow icon={Trophy}    label="Longest streak"  value={isLoading || !stats ? "—" : `${stats.longestStreak}`} unit="days"    iconClass="text-amber-600  dark:text-amber-400/80  bg-amber-50  dark:bg-amber-950/40"  />
            <StatRow icon={GitCommit} label="Today"           value={isLoading || !stats ? "—" : String(stats.todayCount)} unit="commits" iconClass="text-primary    bg-primary/8"                        hint={todayLabel || undefined} />
          </div>

          {/* Heatmap */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Activity</p>
              <p className="font-mono text-[10px] tabular-nums text-neutral-400">
                {commits.length} commits · {HEATMAP_WEEKS}w
              </p>
            </div>

            {/* Month labels across top (above the grid columns) */}
            <div className="flex gap-1 mb-1 pl-[18px]">
              {heatmapGrid.map((col, wi) => {
                const isFirst = wi === 0 || heatmapGrid[wi - 1]?.[0]?.month !== col[0]?.month;
                return (
                  <div key={wi} className="w-[14px] shrink-0 font-mono text-[8px] text-neutral-400 overflow-visible whitespace-nowrap">
                    {isFirst ? col[0]?.month : ""}
                  </div>
                );
              })}
            </div>

            {/* Grid: 7 rows (Sun–Sat) × 12 cols (weeks), day labels on left */}
            <div className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, dow) => (
                <div key={dow} className="flex items-center gap-1">
                  {/* Day label — only M, W, F to avoid crowding */}
                  <span className="w-[14px] shrink-0 font-mono text-[8px] text-neutral-400 text-right">
                    {dow === 1 ? "M" : dow === 3 ? "W" : dow === 5 ? "F" : ""}
                  </span>
                  {heatmapGrid.map((col, wi) => {
                    const cell = col[dow];
                    return (
                      <div key={wi} className="relative group shrink-0">
                        <div className={cn("size-[14px] rounded-[3px]", cell ? heatCell(cell.count) : "bg-neutral-100 dark:bg-neutral-800")} />
                        {cell && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 hidden group-hover:flex flex-col items-center">
                            <div className="rounded-md bg-neutral-950 dark:bg-neutral-800 px-2 py-1 text-center shadow-lg whitespace-nowrap">
                              <p className="font-mono text-[10px] font-semibold text-neutral-50">{cell.count} commit{cell.count !== 1 ? "s" : ""}</p>
                              <p className="font-mono text-[9px] text-neutral-400">{cell.label}</p>
                            </div>
                            <div className="size-1.5 rotate-45 bg-neutral-950 dark:bg-neutral-800 -mt-[3px]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-1.5 pl-[18px]">
              <span className="font-mono text-[9px] text-neutral-400">Less</span>
              {["bg-neutral-100 dark:bg-neutral-800", "bg-primary/30", "bg-primary/55", "bg-primary/80", "bg-primary"].map((cls, i) => (
                <div key={i} className={cn("size-[10px] rounded-[2px]", cls)} />
              ))}
              <span className="font-mono text-[9px] text-neutral-400">More</span>
            </div>
          </div>
        </div>

        {/* ── Right: virtualized feed ── */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex min-h-64 items-center justify-center">
              <DeskLoader size="sm" label="Loading activity…" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6 py-12 text-center">
              <p className="text-sm text-neutral-500">{errorMessage}</p>
              <button type="button" onClick={() => void refetch()} className="mt-3 text-sm text-primary hover:underline cursor-pointer">
                Try again →
              </button>
            </div>
          ) : commits.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6 py-12 text-center">
              <GitCommit className="mx-auto size-6 text-neutral-300 dark:text-neutral-600 mb-3" />
              <p className="text-sm text-neutral-500">No platform activity yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col h-[calc(100vh-14rem)]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400">Commit history</p>
                <span className="font-mono text-[11px] tabular-nums text-neutral-400">{totalCommits} total</span>
              </div>
            <div
              ref={parentRef}
              className="flex-1 overflow-auto"
            >
              <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map((vItem) => {
                  const row = rows[vItem.index]!;
                  return (
                    <div
                      key={vItem.key}
                      data-index={vItem.index}
                      ref={virtualizer.measureElement}
                      className="absolute top-0 left-0 w-full"
                      style={{ transform: `translateY(${vItem.start}px)` }}
                    >
                      {row.type === "day" ? (
                        <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            {row.date === todayLabel ? "Today" : row.date}
                          </p>
                          <span className="font-mono text-[10px] tabular-nums text-neutral-400">
                            {row.count} {row.count === 1 ? "event" : "events"}
                          </span>
                        </div>
                      ) : (
                        <div className="px-2 py-0.5">
                          <CommitItem commit={row.commit} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Helpers ── */

function groupCommitsByDate(commits: Commit[]) {
  const map = new Map<string, Commit[]>();
  for (const commit of commits) {
    const list = map.get(commit.date) ?? [];
    list.push(commit);
    map.set(commit.date, list);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

type ActivityFeedRow =
  | { type: "day"; date: string; count: number }
  | { type: "commit"; commit: Commit };

function flattenActivityGroups(groups: { date: string; items: Commit[] }[]): ActivityFeedRow[] {
  return groups.flatMap((g) => [
    { type: "day" as const, date: g.date, count: g.items.length },
    ...g.items.map((commit) => ({ type: "commit" as const, commit })),
  ]);
}

/* ── StatRow ── */

function StatRow({ icon: Icon, label, value, unit, hint, iconClass }: {
  icon: LucideIcon; label: string; value: string; unit: string; hint?: string; iconClass: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", iconClass)}>
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400">{label}</p>
        {hint && <p className="font-mono text-[10px] text-neutral-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-baseline gap-1 shrink-0">
        <span className="text-xl font-bold tabular-nums tracking-tight text-neutral-950 dark:text-neutral-50">{value}</span>
        <span className="font-mono text-[10px] text-neutral-400">{unit}</span>
      </div>
    </div>
  );
}

/* ── CommitItem ── */

function CommitItem({ commit }: { commit: Commit }) {
  const isMerge = Boolean(commit.isMerge);
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
    >
      <span className={cn(
        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
        isMerge ? "bg-primary/8 text-primary" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
      )}>
        {isMerge ? <GitMerge className="size-3.5" aria-hidden /> : <GitCommit className="size-3.5" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">{commit.message}</span>
          {isMerge && (
            <span className="shrink-0 rounded-full bg-primary/8 border border-primary/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
              merge
            </span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <code className="font-mono text-[10px] text-neutral-400 tabular-nums">{commit.sha}</code>
          <span className="font-mono text-[11px] text-neutral-400">{commit.time}</span>
          {commit.repository && <span className="font-mono text-[11px] text-neutral-400 truncate">{commit.repository}</span>}
        </span>
      </span>
      <span className="flex size-7 shrink-0 items-center justify-center text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-950 dark:group-hover:text-neutral-50 transition-colors">
        <ArrowUpRight className="size-3.5" aria-hidden />
        <span className="sr-only">View on GitHub</span>
      </span>
    </a>
  );
}
