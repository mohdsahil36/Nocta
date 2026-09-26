import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  GitCommit,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { activityStats, commits } from "../data/activity";

export default function ActivityPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <div className="mt-4">
          <h1 className="text-lg font-semibold tracking-tight">Activity</h1>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Coding activity and streak
          </p>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Flame className="h-3.5 w-3.5" />}
          label="Current streak"
          value={`${activityStats.currentStreak} days`}
        />

        <StatCard
          icon={<Trophy className="h-3.5 w-3.5" />}
          label="Longest streak"
          value={`${activityStats.longestStreak} days`}
        />

        <StatCard
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          label="Today's submissions"
          value={activityStats.todaySubmissions.toString()}
        />

        <StatCard
          icon={<GitCommit className="h-3.5 w-3.5" />}
          label="Today's commits"
          value={activityStats.todayCommits.toString()}
        />
      </section>

      <section className="mt-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Today&apos;s activity</h2>

          <p className="text-[11px] text-muted-foreground">
            September 14, 2026
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border">
                <Flame className="h-3.5 w-3.5" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  {activityStats.todayCommits} commits
                </p>

                <p className="text-[11px] text-muted-foreground">
                  {activityStats.todaySubmissions} submissions
                </p>
              </div>
            </div>

            <span className="text-[11px] text-muted-foreground">
              3 / 4 daily goal
            </span>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[75%] rounded-full bg-foreground" />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Recent commits</h2>

            <p className="text-[11px] text-muted-foreground">
              Latest GitHub activity
            </p>
          </div>

          <span className="text-[11px] text-muted-foreground">
            {activityStats.totalCommits} total
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {commits.map((commit, index) => (
            <CommitItem
              key={commit.id}
              commit={commit}
              isLast={index === commits.length - 1}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-border">
          {icon}
        </div>

        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>

      <p className="mt-1.5 text-base font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function CommitItem({
  commit,
  isLast,
}: {
  commit: (typeof commits)[number];
  isLast: boolean;
}) {
  return (
    <div
      className={`px-4 py-3 transition-colors hover:bg-muted/40 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border">
          <GitCommit className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="truncate text-xs font-medium">{commit.message}</h3>

            <span className="shrink-0 text-[10px] text-muted-foreground">
              {commit.date} · {commit.time}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <span>{commit.repository}</span>
            <span>•</span>
            <span className="font-mono">{commit.sha}</span>
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>+{commit.additions}</span>
            <span>-{commit.deletions}</span>

            <a
              href={commit.url}
              className="ml-auto underline-offset-4 hover:text-foreground hover:underline"
            >
              View commit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
