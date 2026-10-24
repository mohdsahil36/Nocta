"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity as ActivityIcon,
  BotMessageSquare,
  CircleCheck,
  FlaskConical,
  GitBranch,
  MoonStar,
  Plus,
  RefreshCcw,
  ScrollText,
  Sparkles,
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
import { CheckInPanel, type CheckInSelection } from "./check-in-panel";

function formatHomeDate(d = new Date()) {
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

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

function ComingSoonCard({
  icon: Icon,
  title,
  description,
  phase,
  className,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  phase: string;
  className?: string;
}) {
  return (
    <div className={cn("nocta-panel flex flex-col gap-2.5 px-5 py-4 opacity-55 select-none", className)}>
      <div className="flex items-center justify-between">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
          {phase}
        </span>
      </div>
      <p className="text-[13px] font-semibold text-nocta-ink leading-snug">{title}</p>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

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
  const [checkIn, setCheckIn] = useState<CheckInSelection>({ minutes: 45, energy: "steady", revealed: false });
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

  return (
    <section className="flex w-full flex-col gap-3">

      {/* ── Ticker ──────────────────────────────────────────────────────── */}
      <div className="nocta-panel flex items-stretch overflow-x-auto divide-x divide-border">
        <div className="flex min-w-0 flex-col justify-center px-5 py-3 shrink-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{dateLabel}</p>
          <p className="mt-0.5 text-[14px] font-semibold tracking-tight text-nocta-ink truncate max-w-[200px]">{greeting}</p>
        </div>

        {(
          [
            { icon: TrendingUp, value: currentStreak > 0 ? `${currentStreak}d` : "—", label: c.stats.momentum, positive: currentStreak > 0 },
            { icon: Target,     value: String(activeGoalCount),                        label: c.stats.goals },
            { icon: CircleCheck,value: "—",                                            label: c.stats.nights },
            { icon: MoonStar,   value: "—",                                            label: c.stats.recovery },
            { icon: GitBranch,  value: String(weekTotal),                              label: "This week" },
          ] as const
        ).map(({ icon: Icon, value, label, positive }: any) => (
          <div key={label} className="flex items-center gap-2 px-5 py-3 shrink-0">
            <Icon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className={cn("text-[13px] font-semibold tabular-nums", positive ? "text-primary" : "text-nocta-ink")}>{value}</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}

        <div className="ml-auto flex items-center gap-1 px-4 shrink-0">
          <Link href="/goals" className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-nocta-ink">
            <Plus className="size-3.5 shrink-0" />{c.actions.addGoals}
          </Link>
          <Link href="/activity" className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-nocta-ink">
            <ActivityIcon className="size-3.5 shrink-0" />{c.actions.browseActivity}
          </Link>
        </div>
      </div>

      {/* ── Bento grid ──────────────────────────────────────────────────── */}
      {/* Row 1: Check-in (2/3) | Tonight's goal + steps stacked (1/3)     */}
      {/* Row 2: Commit chart | AI Reasoning | Log Parser                   */}
      {/* Row 3: Plan Bootstrap | Eval Harness | Next Queue + Reflection    */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

        {/* ── Row 1, col 1–2: Check-in (wide) ── */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <CheckInPanel
            selection={checkIn}
            onSelectionChange={setCheckIn}
            cachedResult={cachedResult}
            onClearCache={() => { setCachedResult(null); setLiveResult(null); }}
            onResult={(r) => setLiveResult(r)}
            sessionReady={sessionReady}
          />
        </div>

        {/* ── Row 1, col 3: Tonight's goal + steps ── */}
        <div className="flex flex-col gap-3">
          {/* Tonight's goal */}
          <div className="nocta-panel px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2.5">Tonight's goal</p>
            {liveResult?.pick ? (
              <>
                <p className="text-[14px] font-semibold leading-snug text-nocta-ink">{liveResult.pick.name}</p>
                <span className="mt-2 inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary">
                  Score {displayScore(liveResult.pick.total)}
                </span>
                <div className="mt-4 border-t border-border pt-3">
                  <Link href="/goals" className="text-[11px] font-medium text-primary hover:underline">View goal →</Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-[13px] font-medium text-nocta-ink">{c.today.planEmptyTitle}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{c.today.planEmptyBody}</p>
              </>
            )}
          </div>

          {/* Tonight's steps */}
          <div className="nocta-panel px-5 py-4 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2.5">Tonight's steps</p>
            {liveResult?.pick ? (
              planSteps.length > 0 ? (
                <ul className="divide-y divide-border">
                  {planSteps.slice(0, 6).map((step, i) => (
                    <li key={step.id} className="flex items-start gap-2.5 py-2">
                      <span className="mt-0.5 w-4 shrink-0 text-[11px] font-medium tabular-nums text-primary">{i + 1}</span>
                      <span className={cn("text-[12px] leading-snug", step.status === "doing" ? "font-medium text-nocta-ink" : "text-nocta-ink/80")}>
                        {step.title}
                      </span>
                    </li>
                  ))}
                  {planSteps.length > 6 && (
                    <li className="pt-2">
                      <Link href="/goals" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
                        +{planSteps.length - 6} more →
                      </Link>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-[12px] text-nocta-ink/80">{liveResult.pick.nextAction}</p>
              )
            ) : (
              <p className="text-[12px] text-muted-foreground">{c.today.plannerEmpty}</p>
            )}
            {liveResult?.pick && (
              <Link href="/goals" className="mt-4 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">Open goal →</Link>
            )}
          </div>
        </div>

        {/* ── Row 2: Commit chart | AI Reasoning | Log Parser ── */}

        {/* Commit chart */}
        <div className="nocta-panel px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">This week</p>
            <span className="text-[11px] tabular-nums text-muted-foreground">{weekTotal} commits</span>
          </div>
          <div className="flex items-end gap-1.5" style={{ height: "60px" }}>
            {bars.map(({ day, count }) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn("w-full rounded-sm transition-all", count > 0 ? "bg-primary/60 hover:bg-primary/80" : "bg-muted")}
                  style={{ height: `${Math.max(3, Math.round((count / maxBar) * 48))}px` }}
                />
                <span className="text-[9px] text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
          <Link href="/activity" className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
            All activity →
          </Link>
        </div>

        <ComingSoonCard
          icon={BotMessageSquare}
          title="AI Reasoning"
          description="The scorer picks the goal — the LLM narrates why, streamed from nocta-ai. Never changes the pick."
          phase="Phase 1"
        />

        <ComingSoonCard
          icon={ScrollText}
          title="Quick Log Parser"
          description="Paste free text — AI parses into structured outcome fields (few-shot). Confirm before save."
          phase="Phase 1"
        />

        {/* ── Row 3: Plan Bootstrap | Eval Harness | Next Queue + Reflection ── */}

        <ComingSoonCard
          icon={Sparkles}
          title="Plan Bootstrap"
          description="Goal name + notes → LangChain drafts an ordered plan. You confirm before it saves."
          phase="Phase 1"
        />

        <ComingSoonCard
          icon={FlaskConical}
          title="Eval Harness"
          description="30–50 labeled cases for log parser and reasoning. Metrics run on every prompt change."
          phase="Phase 2"
        />

        {/* Next in queue + Recovery Gate stacked in the last cell */}
        <div className="flex flex-col gap-3">
          <div className="nocta-panel px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2.5">Next in queue</p>
            {nextInQueue ? (
              <>
                <p className="text-[13px] font-semibold leading-snug text-nocta-ink">{nextInQueue.name}</p>
                <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{nextInQueue.nextAction}</p>
                <span className="mt-2 inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  Score {displayScore(nextInQueue.total)}
                </span>
              </>
            ) : (
              <p className="text-[12px] text-muted-foreground">Check in to see what's next.</p>
            )}
          </div>

          <ComingSoonCard
            icon={RefreshCcw}
            title="Recovery Gate"
            description="Intelligent eligibility from capacity, recent outcomes, and neglect — not a weekly quota."
            phase="Phase 3"
          />
        </div>

      </div>
    </section>
  );
}
