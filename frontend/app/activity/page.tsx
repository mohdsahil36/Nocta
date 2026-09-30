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
import { useMemo, useSyncExternalStore } from "react";

import type { Commit } from "../data/activity";
import { activityStats } from "../data/activity";
import { fetchPlatformCommits, formatActivityDate } from "@/lib/activity-api";
import { NoctaLoader } from "@/components/ui/nocta-loader";
import { cn } from "cn";
import { useQuery } from "@tanstack/react-query";

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
  const syncing = isFetching && !isLoading;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Could not load commits"
        : null;

  const todayCommits = todayLabel
    ? commits.filter((c) => c.date === todayLabel).length
    : 0;

  const grouped = useMemo(() => groupCommitsByDate(commits), [commits]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-1 py-2 sm:gap-8 sm:px-2 sm:py-4">
      <header className="nocta-panel relative flex flex-wrap items-end justify-between gap-4 overflow-hidden p-5 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-landing-peach/25 dark:bg-transparent"
        />
        <div className="relative">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-nocta-ink"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Dashboard
          </Link>
          <h1 className="mt-3 font-sans text-3xl font-semibold tracking-[-0.03em] text-nocta-ink sm:text-4xl">
            Platform activity
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Commits landing in the Nocta repo — merges and pushes from the team.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="relative inline-flex h-10 cursor-pointer items-center rounded-xl border border-foreground/10 bg-nocta-paper px-5 text-sm font-semibold text-nocta-ink transition-colors hover:bg-muted/40 disabled:cursor-wait disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync"}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex h-8 items-end">
            <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Overview
            </h2>
          </div>
          <aside className="nocta-panel overflow-hidden lg:sticky lg:top-3">
            <MetricRow
              icon={<Flame className="h-4 w-4" aria-hidden />}
              iconClassName="bg-landing-peach/60 text-nocta-ink dark:bg-muted"
              label="Current streak"
              value={`${activityStats.currentStreak} days`}
            />
            <MetricRow
              icon={<Trophy className="h-4 w-4" aria-hidden />}
              iconClassName="bg-landing-mint/60 text-nocta-ink dark:bg-muted"
              label="Longest streak"
              value={`${activityStats.longestStreak} days`}
              bordered
            />
            <MetricRow
              icon={<GitCommit className="h-4 w-4" aria-hidden />}
              iconClassName="bg-nocta-glow/15 text-nocta-glow"
              label="Today"
              value={isLoading ? "—" : String(todayCommits)}
              hint={todayLabel}
              bordered
            />
          </aside>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex h-8 items-end justify-between gap-3">
            <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Feed
            </h2>
            <span className="text-sm tabular-nums text-muted-foreground">
              {isLoading ? "…" : `${totalCommits} total`}
            </span>
          </div>

          {isLoading ? (
            <div className="nocta-panel flex min-h-56 items-center justify-center px-4 py-12">
              <NoctaLoader size="sm" label="Loading activity…" />
            </div>
          ) : error ? (
            <div className="nocta-panel px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 cursor-pointer text-sm font-medium text-nocta-glow underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : commits.length === 0 ? (
            <p className="nocta-panel px-4 py-12 text-center text-sm text-muted-foreground">
              No platform activity yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {grouped.map((group) => (
                <section
                  key={group.date}
                  className="nocta-panel overflow-hidden"
                >
                  <header className="flex items-center justify-between gap-3 border-b border-foreground/10 px-4 py-3 sm:px-5">
                    <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                      {group.date === todayLabel ? "Today" : group.date}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {group.items.length}{" "}
                      {group.items.length === 1 ? "event" : "events"}
                    </p>
                  </header>
                  <ul className="flex flex-col gap-2 p-3 sm:p-4">
                    {group.items.map((commit) => (
                      <li key={commit.id}>
                        <CommitItem commit={commit} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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

function MetricRow({
  icon,
  iconClassName,
  label,
  value,
  hint,
  bordered,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  hint?: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-4",
        bordered && "border-t border-foreground/10",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tracking-tight text-nocta-ink tabular-nums">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
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
        "group flex items-start gap-3 rounded-xl border border-foreground/8 bg-muted/25 px-3.5 py-3 transition-colors duration-150",
        "hover:border-foreground/15 hover:bg-muted/45",
        isMerge &&
          "border-nocta-glow/20 bg-nocta-glow/5 hover:bg-nocta-glow/10",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          isMerge
            ? "bg-nocta-glow/15 text-nocta-glow"
            : "bg-background text-muted-foreground dark:bg-nocta-paper/10",
        )}
      >
        {isMerge ? (
          <GitMerge className="size-3.5" aria-hidden />
        ) : (
          <GitCommit className="size-3.5" aria-hidden />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate font-sans text-sm font-medium text-nocta-ink sm:text-[0.95rem]">
            {commit.message}
          </span>
          {isMerge ? (
            <span className="shrink-0 rounded-md bg-nocta-glow/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-nocta-glow uppercase">
              merge
            </span>
          ) : null}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <code className="rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[11px] tabular-nums dark:bg-background/40">
            {commit.sha}
          </code>
          <span>{commit.time}</span>
          {commit.repository ? (
            <span className="truncate text-muted-foreground/80">
              {commit.repository}
            </span>
          ) : null}
        </span>
      </span>

      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover:bg-background/60 group-hover:text-nocta-ink">
        <ArrowUpRight className="size-4" aria-hidden />
        <span className="sr-only">View on GitHub</span>
      </span>
    </a>
  );
}
