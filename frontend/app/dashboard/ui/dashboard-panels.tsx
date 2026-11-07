"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity as ActivityIcon,
  BotMessageSquare,
  ChevronLeft,
  ChevronRight,
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
import { Button } from "@/components/ui/button";
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
    <div className={cn("nocta-panel flex flex-col gap-2.5 px-5 py-4 opacity-80 select-none", className)}>
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
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [checkIn, setCheckIn] = useState<CheckInSelection>({ minutes: 45, energy: "steady", revealed: false });
  const [cachedResult, setCachedResult] = useState<CheckInResult | null>(null);
  const [liveResult, setLiveResult] = useState<CheckInResult | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [narration, setNarration] = useState<string | null>(null);

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
            { value: currentStreak > 0 ? `${currentStreak}d` : "—", label: c.stats.momentum, positive: currentStreak > 0 },
            { value: String(activeGoalCount),                        label: c.stats.goals },
            { value: "—",                                            label: c.stats.nights },
            { value: "—",                                            label: c.stats.recovery },
          ] as const
        ).map(({ value, label, positive }: any) => (
          <div key={label} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 min-w-0">
            <span className={cn("text-[13px] font-semibold tabular-nums", positive ? "text-primary" : "text-nocta-ink")}>{value}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
          </div>
        ))}

      </div>

      <div className="flex justify-end">
        <Link href="/goals">
          <Button size="sm" className="h-8 gap-1.5 text-[12px] px-4">
            <Plus className="size-3.5 shrink-0" />{c.actions.addGoals}
          </Button>
        </Link>
      </div>

      {/* ── Bento grid ──────────────────────────────────────────────────── */}
      {/* Row 1: Check-in (2/3) | Tonight's goal + steps stacked (1/3)     */}
      {/* Row 2: Commit chart | AI Reasoning | Log Parser                   */}
      {/* Row 3: Plan Bootstrap | Eval Harness | Next Queue + Reflection    */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

        {/* ── Row 1, col 1–2: Check-in (wide) ── */}
        <div className="md:col-span-2 flex flex-col gap-3 h-full">
          <CheckInPanel
            selection={checkIn}
            onSelectionChange={setCheckIn}
            cachedResult={cachedResult}
            onClearCache={() => { setCachedResult(null); setLiveResult(null); }}
            onResult={(r) => setLiveResult(r)}
            onNarration={(n) => setNarration(n)}
            sessionReady={sessionReady}
          />
        </div>

        {/* ── Row 1, col 3: Streak calendar ── */}
        <div className="flex flex-col gap-3 h-full">
          {narration && (
            <div className="nocta-panel px-5 py-4 flex gap-2.5 items-start">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              <p className="text-sm leading-snug text-nocta-ink">{narration}</p>
            </div>
          )}
          <div className="nocta-panel px-5 py-4 flex-1 flex flex-col">
          <style>{`
            @keyframes organicFlame {
              0%,100% { transform: scale(1,1); }
              20%     { transform: scale(0.96,1.04) translateY(-0.5px) skewX(1deg); }
              40%     { transform: scale(1.02,0.95) translateX(0.5px); }
              60%     { transform: scale(0.95,1.05) translateY(-1px) skewX(-1deg); }
              80%     { transform: scale(1.04,0.97) translateX(-0.5px); }
            }
            @keyframes emberRise {
              0%   { transform: translateY(0) scale(1); opacity: 1; }
              50%  { transform: translateY(-4px) translateX(2px) scale(0.8); opacity: 0.9; }
              100% { transform: translateY(-10px) translateX(-1px) scale(0); opacity: 0; }
            }
            .flame-container { animation: organicFlame 1.4s ease-in-out infinite; transform-origin: bottom center; }
            .ember-left      { animation: emberRise 1.8s ease-out infinite; transform-origin: center; }
            .ember-right     { animation: emberRise 2.2s ease-out infinite 0.5s; transform-origin: center; }
          `}</style>
          {(() => {
            const todayRaw = new Date();
            const viewDate = new Date(todayRaw.getFullYear(), todayRaw.getMonth() + calMonthOffset, 1);
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
            const DAY_HEADERS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
            type Cell = { day: number; thisMonth: boolean; date: Date };
            const cells: Cell[] = [];
            const prevDays = new Date(year, month, 0).getDate();
            for (let i = firstDow - 1; i >= 0; i--)
              cells.push({ day: prevDays - i, thisMonth: false, date: new Date(year, month - 1, prevDays - i) });
            for (let d = 1; d <= daysInMonth; d++)
              cells.push({ day: d, thisMonth: true, date: new Date(year, month, d) });
            let next = 1;
            while (cells.length % 7 !== 0)
              cells.push({ day: next++, thisMonth: false, date: new Date(year, month + 1, next - 1) });
            const weeks: Cell[][] = [];
            for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
            const todayMs = new Date(todayRaw.getFullYear(), todayRaw.getMonth(), todayRaw.getDate()).getTime();
            const PixelFlame = ({ delay }: { delay: number }) => (
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 mx-auto"
                style={{ imageRendering: "pixelated", overflow: "visible" }}>
                <g transform="translate(4, 2)">
                  <g className="flame-container" style={{ animationDelay: `${delay}s` }}>
                    <path d="M11 25h4v1h-4zm-3-1h10v1H8zm-2-3h14v3H6zm-1-4h16v4H5zm-1-4h18v4H4zm1-3h16v3H5zm2-3h12v3H7zm3-4h6v4h-6zm2-2h2v2h-2z" fill="#901A00" />
                    <path d="M11 24h4v1h-4zm-2-1h8v1H9zm-2-3h12v3H7zm-1-4h14v4H6zm0-4h14v4H6zm1-3h12v3H7zm2-3h8v3H9zm2-3h4v3h-4z" fill="#D22800" />
                    <path d="M11 23h4v1h-4zm-1-2h6v1h-6zm-2-2h10v2H8zm-1-4h12v4H7zm0-3h12v3H7zm1-3h10v3H8zm2-3h6v3h-6zm2-1h2v1h-2z" fill="#FF7800" />
                    <path d="M11 21h4v1h-4zm-1-2h6v1h-6zm-1-3h8v3H10zm0-3h8v3H10zm1-3h6v3h-6zm1-2h4v2h-4z" fill="#FFD200" />
                    <path d="M12 18h2v2h-2zm-1-3h4v3h-4zm0-2h4v2h-4zm1-2h2v2h-2z" fill="#FFFFFF" />
                  </g>
                  <rect className="ember-left"  x="9"  y="4" width="2" height="2" fill="#FF7800" style={{ animationDelay: `${delay + 0.1}s` }} />
                  <rect className="ember-right" x="15" y="6" width="2" height="2" fill="#FFD200" style={{ animationDelay: `${delay + 0.25}s` }} />
                </g>
              </svg>
            );
            return (
              <div>
                <div className="mb-1">
                  <p className="text-[10px] text-muted-foreground/50 font-medium tabular-nums">{year}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[20px] font-semibold leading-tight text-nocta-ink">
                      {viewDate.toLocaleDateString("en", { month: "long" })}
                    </p>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setCalMonthOffset(o => o - 1)}
                        className="flex size-6 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <button onClick={() => setCalMonthOffset(o => o + 1)}
                        className="flex size-6 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-1">
                  {DAY_HEADERS.map(h => (
                    <div key={h} className="text-center text-[9px] font-semibold text-muted-foreground/40 py-1">{h}</div>
                  ))}
                </div>
                <div className="space-y-0.5">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7">
                      {week.map((cell, di) => {
                        const daysAgo = Math.round((todayMs - cell.date.getTime()) / 86400000);
                        const isToday = daysAgo === 0;
                        const isActive = cell.thisMonth && daysAgo >= 0 && daysAgo < currentStreak;
                        return (
                          <div key={di} className="flex flex-col items-center py-0.5">
                            {isActive ? <PixelFlame delay={(wi * 7 + di) % 5 * 0.09} /> : <div className="h-5" />}
                            <div className={cn(
                              "flex size-5 items-center justify-center rounded-full text-[10px] tabular-nums font-medium mt-0.5",
                              isToday ? "bg-primary text-primary-foreground font-bold" : "",
                              !isToday && cell.thisMonth ? "text-nocta-ink/80" : "text-muted-foreground/25",
                            )}>
                              {cell.day}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 text-[11px] text-muted-foreground text-center">
                  {currentStreak > 0
                    ? <span>On a <span className="font-semibold text-primary">{currentStreak}-night</span> streak.</span>
                    : <span>Check in tonight to start your streak.</span>}
                </div>
              </div>
            );
          })()}
          </div>
        </div>

        {/* ── Row 2: Tonight's steps (col 1) | AI Reasoning (col 2) | Commit chart (col 3, under streak) ── */}

        {/* Tonight's steps */}
        <div className="nocta-panel px-5 py-4">
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

        <ComingSoonCard
          icon={BotMessageSquare}
          title="AI Reasoning"
          description="The scorer picks the goal — the LLM narrates why, streamed from nocta-ai. Never changes the pick."
          phase="Phase 1"
        />

        {/* Commit chart — col 3, aligned under streak calendar */}
        <div className="nocta-panel px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">This week</p>
            <span className="text-[11px] tabular-nums text-muted-foreground">{weekTotal} commits</span>
          </div>
          <div className="flex items-end gap-1.5" style={{ height: "60px" }}>
            {bars.map(({ day, count }) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn("w-full rounded-sm transition-all", count > 0 ? "bg-primary/60 hover:bg-primary/80 cursor-pointer" : "bg-muted")}
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
          icon={ScrollText}
          title="Quick Log Parser"
          description="Paste free text — AI parses into structured outcome fields (few-shot). Confirm before save."
          phase="Phase 1"
        />

        {/* ── Row 3: Log Parser | Plan Bootstrap | Eval Harness ── */}

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
