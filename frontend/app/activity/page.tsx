"use client";

import {
  ArrowUpRight,
  Flame,
  GitCommit,
  GitMerge,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Commit } from "../data/activity";
import { activityStats } from "../data/activity";
import {
  fetchPlatformCommits,
  formatActivityDate,
} from "@/lib/activity-api";
import { NoctaLoader } from "@/components/ui/nocta-loader";
import { cn } from "cn";

export default function ActivityPage() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCommits(options?: { sync?: boolean }) {
    const isSync = options?.sync === true;
    if (isSync) setSyncing(true);
    setError(null);

    try {
      const data = await fetchPlatformCommits();
      setCommits(data.commits);
      setTotalCommits(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load commits");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const data = await fetchPlatformCommits();
        if (cancelled) return;
        setCommits(data.commits);
        setTotalCommits(data.count);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load commits");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  const todayLabel = formatActivityDate();
  const todayCommits = commits.filter((c) => c.date === todayLabel).length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-1 py-2 sm:gap-8 sm:px-2 sm:py-4">
      <header className="nocta-panel relative flex flex-wrap items-end justify-between gap-4 overflow-hidden p-5 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-landing-peach/30 dark:bg-transparent"
        />
        <div className="relative">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <span className="mr-2 text-nocta-glow tabular-nums">11</span>
            Platform
          </p>
          <h1 className="mt-3 font-sans text-3xl font-semibold tracking-[-0.03em] text-nocta-ink sm:text-4xl">
            Activity
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Platform commits from the Nocta repo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadCommits({ sync: true })}
          disabled={syncing || loading}
          className="relative inline-flex h-10 cursor-pointer items-center rounded-full border border-foreground/10 bg-nocta-paper px-5 text-sm font-semibold text-nocta-ink transition-colors hover:bg-muted/40 disabled:cursor-wait disabled:opacity-50"
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
              value={loading ? "—" : String(todayCommits)}
              hint={todayLabel}
              bordered
            />
          </aside>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex h-8 items-end justify-between gap-3">
            <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Commits
            </h2>
            <span className="text-sm tabular-nums text-muted-foreground">
              {loading ? "…" : `${totalCommits} total`}
            </span>
          </div>

          {loading ? (
            <div className="nocta-panel flex min-h-56 items-center justify-center px-4 py-12">
              <NoctaLoader size="sm" label="Loading commits…" />
            </div>
          ) : error ? (
            <div className="nocta-panel px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => void loadCommits()}
                className="mt-3 cursor-pointer text-sm font-medium text-nocta-glow underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : commits.length === 0 ? (
            <p className="nocta-panel px-4 py-12 text-center text-sm text-muted-foreground">
              No commits yet.
            </p>
          ) : (
            <ul className="nocta-panel divide-y divide-foreground/10 overflow-hidden">
              {commits.map((commit) => (
                <li key={commit.id}>
                  <CommitItem commit={commit} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
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
    <article
      className={cn(
        "flex gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-foreground/3 sm:gap-4 sm:px-5",
        isMerge && "bg-nocta-glow/5",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          isMerge
            ? "bg-nocta-glow/15 text-nocta-glow"
            : "bg-muted text-muted-foreground",
        )}
      >
        {isMerge ? (
          <GitMerge className="h-4 w-4" aria-hidden />
        ) : (
          <GitCommit className="h-4 w-4" aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-medium text-nocta-ink sm:text-base">
            {commit.message}
          </h3>
          {isMerge ? (
            <span className="shrink-0 rounded-full bg-nocta-glow/10 px-2 py-0.5 text-[11px] font-medium text-nocta-glow">
              merge
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-mono text-xs">{commit.sha}</span>
          <span className="mx-1.5 text-border" aria-hidden>
            ·
          </span>
          {commit.date} · {commit.time}
        </p>
      </div>

      <a
        href={commit.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 shrink-0 items-center gap-1 self-center rounded-full px-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-nocta-ink"
      >
        View
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </a>
    </article>
  );
}
