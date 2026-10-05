"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Flame,
  GitCommit,
  GitMerge,
  Trophy,
} from "lucide-react";
import { useMemo, useRef, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { LucideIcon } from "lucide-react";

import type { Commit } from "../data/activity";
import { fetchPlatformCommits, formatActivityDate } from "@/lib/activity-api";
import { buttonVariants } from "@/components/ui/button";
import { NoctaLoader } from "@/components/ui/nocta-loader";
import { cn } from "cn";

const EMPTY_COMMITS: Commit[] = [];

function subscribe() {
  return () => {};
}

/** Client-only locale date; "" on the server so SSR/client markup match. */
function useTodayLabel() {
  return useSyncExternalStore(subscribe, formatActivityDate, () => "");
}

export default function ActivityPage() {
  const todayLabel = useTodayLabel();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["activity", "platform-commits"],
    queryFn: fetchPlatformCommits,
  });

  const commits = data?.commits ?? EMPTY_COMMITS;
  const totalCommits = data?.count ?? 0;
  const stats = data?.stats;
  const syncing = isFetching && !isLoading;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Could not load commits"
        : null;

  const grouped = useMemo(() => groupCommitsByDate(commits), [commits]);
  const rows = useMemo(() => FlattenActivityGroupData(grouped), [grouped]);
  const parentRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (rows[index]?.type === "day" ? 44 : 76),
    overscan: 8,
  });

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="nocta-panel flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-nocta-ink"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Dashboard
          </Link>
          <h1 className="mt-2 font-sans text-lg font-semibold tracking-tight text-nocta-ink sm:text-xl">
            Activity
          </h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Commits in the Nocta repo — merges and pushes from the team.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 shrink-0 rounded-md border-border/80 text-xs shadow-none disabled:opacity-50",
          )}
        >
          {syncing ? "Syncing…" : "Sync"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-2">
          <h2 className="px-0.5 text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Overview
          </h2>
          <aside className="nocta-panel overflow-hidden lg:sticky lg:top-2">
            <MetricRow
              icon={Flame}
              label="Current streak"
              value={
                isLoading || !stats ? "—" : `${stats.currentStreak} days`
              }
            />
            <MetricRow
              icon={Trophy}
              label="Longest streak"
              value={
                isLoading || !stats ? "—" : `${stats.longestStreak} days`
              }
              bordered
            />
            <MetricRow
              icon={GitCommit}
              label="Today"
              value={isLoading || !stats ? "—" : String(stats.todayCount)}
              hint={todayLabel || undefined}
              bordered
            />
          </aside>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-end justify-between gap-3 px-0.5">
            <h2 className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Feed
            </h2>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {isLoading ? "…" : `${totalCommits} total`}
            </span>
          </div>

          {isLoading ? (
            <div className="nocta-panel flex min-h-48 items-center justify-center px-4 py-10">
              <NoctaLoader size="sm" label="Loading activity…" />
            </div>
          ) : error ? (
            <div className="nocta-panel px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-2 cursor-pointer text-xs font-medium text-nocta-ink underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : commits.length === 0 ? (
            <p className="nocta-panel px-4 py-10 text-center text-sm text-muted-foreground">
              No platform activity yet.
            </p>
          ) : (
            <div
              ref={parentRef}
              className="nocta-panel h-[min(70vh,40rem)] overflow-auto"
            >
              <div
                className="relative w-full"
                style={{ height: virtualizer.getTotalSize() }}
              >
                {virtualizer.getVirtualItems().map((vItem) => {
                  const row = rows[vItem.index]!;
                  return (
                    <div
                      key={vItem.key}
                      data-index={vItem.index}
                      ref={virtualizer.measureElement}
                      className="absolute top-0 left-0 w-full px-3 sm:px-4"
                      style={{ transform: `translateY(${vItem.start}px)` }}
                    >
                      {row.type === "day" ? (
                        <header className="flex items-center justify-between gap-3 border-b border-border py-2.5">
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {row.date === todayLabel ? "Today" : row.date}
                          </p>
                          <p className="text-[11px] tabular-nums text-muted-foreground">
                            {row.count} {row.count === 1 ? "event" : "events"}
                          </p>
                        </header>
                      ) : (
                        <div className="py-1">
                          <CommitItem commit={row.commit} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

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

function FlattenActivityGroupData(
  groups: { date: string; items: Commit[] }[],
): ActivityFeedRow[] {
  return groups.flatMap((group) => [
    { type: "day" as const, date: group.date, count: group.items.length },
    ...group.items.map((commit) => ({
      type: "commit" as const,
      commit,
    })),
  ]);
}

function MetricRow({
  icon: Icon,
  label,
  value,
  hint,
  bordered,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-3",
        bordered && "border-t border-border",
      )}
    >
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold tracking-tight text-nocta-ink tabular-nums">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function CommitItem({ commit }: { commit: Commit }) {
  const isMerge = Boolean(commit.isMerge);

  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-start gap-2.5 rounded-md px-2.5 py-2.5 transition-colors duration-150",
        "hover:bg-muted/50",
      )}
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground">
        {isMerge ? (
          <GitMerge className="size-3.5" aria-hidden />
        ) : (
          <GitCommit className="size-3.5" aria-hidden />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-nocta-ink">
            {commit.message}
          </span>
          {isMerge ? (
            <span className="shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              merge
            </span>
          ) : null}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          <code className="font-mono text-[10px] tabular-nums">{commit.sha}</code>
          <span>{commit.time}</span>
          {commit.repository ? (
            <span className="truncate">{commit.repository}</span>
          ) : null}
        </span>
      </span>

      <span className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground group-hover:text-nocta-ink">
        <ArrowUpRight className="size-3.5" aria-hidden />
        <span className="sr-only">View on GitHub</span>
      </span>
    </a>
  );
}
