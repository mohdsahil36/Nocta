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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-3 py-5 sm:px-5 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-4xl italic tracking-[-0.03em] text-nocta-ink sm:text-5xl">
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
          className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-nocta-ink transition-colors hover:bg-muted/50 disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync"}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Left — label + summary (same label height as right for alignment) */}
        <div className="flex flex-col gap-3">
          <div className="flex h-8 items-end">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Overview
            </h2>
          </div>
          <aside className="overflow-hidden rounded-xl border border-border bg-card lg:sticky lg:top-3">
            <MetricRow
              icon={<Flame className="h-4 w-4" aria-hidden />}
              iconClassName="bg-muted text-nocta-ink"
              label="Current streak"
              value={`${activityStats.currentStreak} days`}
            />
            <MetricRow
              icon={<Trophy className="h-4 w-4" aria-hidden />}
              iconClassName="bg-muted text-nocta-ink"
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

        {/* Right — label + list */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex h-8 items-end justify-between gap-3">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Commits
            </h2>
            <span className="text-sm tabular-nums text-muted-foreground">
              {loading ? "…" : `${totalCommits} total`}
            </span>
          </div>

          {loading ? (
            <p className="rounded-xl border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
              Loading commits…
            </p>
          ) : error ? (
            <div className="rounded-xl border border-border bg-card px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => void loadCommits()}
                className="mt-3 text-sm font-medium text-nocta-ink underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : commits.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
              No commits yet.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
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
        bordered && "border-t border-border",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-nocta-ink">
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
        "flex gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/30 sm:gap-4 sm:px-5",
        isMerge && "bg-nocta-glow/5",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
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
            <span className="shrink-0 text-xs font-medium text-nocta-glow">
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
        className="inline-flex h-8 shrink-0 items-center gap-1 self-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-nocta-ink"
      >
        View
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </a>
    </article>
  );
}
