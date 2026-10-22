"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity as ActivityIcon,
  CircleCheck,
  MoonStar,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";

import useAuthStore from "@/app/store/authStore";
import { listAllGoals } from "@/app/goals/functions/goals";
import { listPlanSteps } from "@/app/goals/functions/plan-steps";
import { fetchPlatformCommits } from "@/lib/activity-api";
import type { Commit } from "@/app/data/activity";
import { cn } from "cn";
import { dashboardContent } from "../content";
import {
  clearCheckInSession,
  isSameLocalDay,
  loadCheckInSession,
  type CheckInResult,
} from "../functions/check-in";
import { navbarGreeting } from "../functions/dashboard";
import {
  CheckInPanel,
  type CheckInSelection,
} from "./check-in-panel";

function formatHomeDate(d = new Date()) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Group commits by local date, last 7 days, oldest first. */
function sevenDayBars(commits: Commit[]): { day: string; count: number }[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const day = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);
    const count = commits.filter((c) => c.date === key).length;
    return { day, count };
  });
}

function displayScore(n: number) {
  return Math.round(n <= 1 ? n * 100 : n);
}

type Stat = { icon: typeof TrendingUp; value: string; label: string };

/** Dashboard home — Blueprint density, honest empty states. */
export function DashboardPanels() {
  const c = dashboardContent;
  const authReady = useAuthStore((s) => s.ready);
  const userId = useAuthStore((s) => s.userId);
  const profileName = useAuthStore((s) => s.name);
  const greeting = navbarGreeting(
    new Date().getHours(),
    authReady && userId ? profileName : c.greeting.fallbackName,
  );

  const [dateLabel] = useState(() => formatHomeDate());
  const [checkIn, setCheckIn] = useState<CheckInSelection>({
    minutes: 45,
    energy: "steady",
    revealed: false,
  });
  const [cachedResult, setCachedResult] = useState<CheckInResult | null>(null);
  const [liveResult, setLiveResult] = useState<CheckInResult | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  if (authReady && !sessionReady) {
    setSessionReady(true);
    if (userId) {
      const session = loadCheckInSession(userId);
      if (session && isSameLocalDay(session.savedAt)) {
        setCheckIn({ minutes: session.minutes, energy: session.energy, revealed: true });
        setCachedResult(session.result);
        setLiveResult(session.result);
      } else if (session) {
        clearCheckInSession(userId);
      }
    }
  }

  const { data: goals = [] } = useQuery({
    queryKey: ["goals", userId],
    enabled: authReady && Boolean(userId),
    queryFn: async () => listAllGoals(userId as string),
  });
  const activeGoalCount = goals.filter((g) => g.status === "active").length;

  const { data: activity } = useQuery({
    queryKey: ["activity", "platform-commits"],
    queryFn: fetchPlatformCommits,
    staleTime: 5 * 60 * 1000,
  });
  const currentStreak = activity?.stats.currentStreak ?? 0;
  const bars = sevenDayBars(activity?.commits ?? []);
  const maxBar = Math.max(1, ...bars.map((b) => b.count));
  const weekTotal = bars.reduce((s, b) => s + b.count, 0);

  const pickGoalId = liveResult?.pick.goalId;
  const { data: planSteps = [] } = useQuery({
    queryKey: ["plan-steps", pickGoalId],
    enabled: Boolean(pickGoalId),
    queryFn: () => listPlanSteps(pickGoalId as string),
  });

  const nextInQueue = liveResult?.ranked?.[1];

  const stats: Stat[] = [
    { icon: TrendingUp, value: currentStreak > 0 ? String(currentStreak) : "—", label: c.stats.momentum },
    { icon: Target, value: String(activeGoalCount), label: c.stats.goals },
    { icon: CircleCheck, value: "—", label: c.stats.nights },
    { icon: MoonStar, value: "—", label: c.stats.recovery },
  ];

  return (
    <section className="flex w-full flex-col gap-3">
      {/* Greeting hero */}
      <div className="nocta-panel px-6 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {dateLabel}
          </p>
          <div className="flex items-center gap-1">
            <Link
              href="/goals"
              className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-nocta-ink"
            >
              <Plus className="size-3.5 shrink-0" aria-hidden />
              {c.actions.addGoals}
            </Link>
            <Link
              href="/activity"
              className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-nocta-ink"
            >
              <ActivityIcon className="size-3.5 shrink-0" aria-hidden />
              {c.actions.browseActivity}
            </Link>
          </div>
        </div>

        <p className="mt-2 text-2xl font-semibold tracking-tight text-nocta-ink sm:text-3xl">
          {greeting}
        </p>
        {currentStreak > 0 && (
          <p className="mt-1 text-[13px] text-muted-foreground">
            {currentStreak}-day commit streak — keep it going.
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-4 sm:flex sm:flex-wrap sm:gap-x-10">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div>
                <p className="text-lg font-semibold leading-none tabular-nums text-nocta-ink">
                  {value}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-col: main left | auxiliary right */}
      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        {/* Left — focus hero + today */}
        <div className="flex flex-col gap-3">
          <CheckInPanel
            selection={checkIn}
            onSelectionChange={setCheckIn}
            cachedResult={cachedResult}
            onClearCache={() => { setCachedResult(null); setLiveResult(null); }}
            onResult={(r) => setLiveResult(r)}
            sessionReady={sessionReady}
          />

          {/* Today — always visible, 2-col at sm+ */}
          <div className="grid gap-3 sm:grid-cols-[3fr_2fr]">
            {/* Plan steps */}
            <div className="nocta-panel px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Tonight's steps
              </p>

              {liveResult?.pick ? (
                planSteps.length > 0 ? (
                  <ul className="mt-3 divide-y divide-border">
                    {planSteps.slice(0, 5).map((step, i) => (
                      <li key={step.id} className="flex items-start gap-2.5 py-2">
                        <span className="mt-0.5 w-4 shrink-0 text-[11px] font-medium tabular-nums text-primary">
                          {i + 1}
                        </span>
                        <span
                          className={cn(
                            "text-sm leading-snug",
                            step.status === "doing"
                              ? "font-medium text-nocta-ink"
                              : "text-nocta-ink/80",
                          )}
                        >
                          {step.title}
                        </span>
                      </li>
                    ))}
                    {planSteps.length > 5 && (
                      <li className="pt-2">
                        <Link
                          href="/goals"
                          className="text-[12px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          +{planSteps.length - 5} more steps →
                        </Link>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-nocta-ink/80">{liveResult.pick.nextAction}</p>
                )
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{c.today.plannerEmpty}</p>
              )}

              {liveResult?.pick && (
                <Link
                  href="/goals"
                  className="mt-4 flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                >
                  Open goal →
                </Link>
              )}
            </div>

            {/* Goal context */}
            <div className="nocta-panel px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Tonight's goal
              </p>

              {liveResult?.pick ? (
                <div className="mt-3">
                  <p className="text-sm font-semibold leading-snug text-nocta-ink">
                    {liveResult.pick.name}
                  </p>
                  <span className="mt-2 inline-flex items-center rounded-sm bg-primary/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary">
                    Score {displayScore(liveResult.pick.total)}
                  </span>
                  <div className="mt-4 border-t border-border pt-3">
                    <Link
                      href="/goals"
                      className="text-[12px] font-medium text-primary hover:underline"
                    >
                      View goal →
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm font-medium text-nocta-ink">{c.today.planEmptyTitle}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {c.today.planEmptyBody}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right — activity + queue */}
        <div className="flex flex-col gap-3">
          {/* This week */}
          <div className="nocta-panel px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              This week
            </p>
            <div className="mt-3 flex items-end gap-1" style={{ height: "48px" }}>
              {bars.map(({ day, count }) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full rounded-sm transition-all",
                      count > 0 ? "bg-primary/50" : "bg-muted",
                    )}
                    style={{ height: `${Math.max(4, Math.round((count / maxBar) * 36))}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              {weekTotal} commit{weekTotal !== 1 ? "s" : ""} this week
            </p>
            <Link
              href="/activity"
              className="mt-3 flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
            >
              See all activity →
            </Link>
          </div>

          {/* Next in queue */}
          <div className="nocta-panel px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Next in queue
            </p>
            {nextInQueue ? (
              <div className="mt-3">
                <p className="text-sm font-semibold leading-snug text-nocta-ink">
                  {nextInQueue.name}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                  {nextInQueue.nextAction}
                </p>
                <span className="mt-2 inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                  Score {displayScore(nextInQueue.total)}
                </span>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-muted-foreground">
                Check in to see your next goal.
              </p>
            )}
          </div>

          {/* KPI tiles */}
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="nocta-panel flex items-center gap-3 px-4 py-3"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-none tabular-nums text-nocta-ink">
                  {value}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
