"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CircleCheck,
  MoonStar,
  Target,
  TrendingUp,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import useAuthStore from "@/app/store/authStore";
import { cn } from "cn";
import { dashboardContent } from "../content";
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

type Stat = {
  icon: typeof TrendingUp;
  value: string;
  label: string;
};

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
  const [todayOpen, setTodayOpen] = useState(true);
  const [dateLabel] = useState(() => formatHomeDate());
  const [checkIn, setCheckIn] = useState<CheckInSelection>({
    minutes: 45,
    energy: "steady",
    revealed: false,
  });

  const timeLabel =
    c.checkIn.minutes.find((m) => m.id === checkIn.minutes)?.label ??
    `${checkIn.minutes} min`;
  const energyLabel =
    c.checkIn.energy.find((e) => e.id === checkIn.energy)?.label ??
    checkIn.energy;
  const checkInSummary = checkIn.revealed
    ? c.checkIn.todaySummary(timeLabel, energyLabel)
    : c.today.plannerEmpty;

  const stats: Stat[] = [
    { icon: TrendingUp, value: "—", label: c.stats.momentum },
    { icon: Target, value: "0", label: c.stats.goals },
    { icon: CircleCheck, value: "0", label: c.stats.nights },
    { icon: MoonStar, value: "0", label: c.stats.recovery },
  ];

  return (
    <section className="flex w-full flex-col gap-3">
      {/* Greeting + headline numbers */}
      <div className="nocta-panel overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{dateLabel}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-nocta-ink sm:text-3xl">
              {greeting}
            </p>
            <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
              {c.greeting.emptySupport}
            </p>
          </div>
          <Link
            href="/activity"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 shrink-0 rounded-sm border-border/80 text-xs shadow-none",
            )}
          >
            {c.actions.browseActivity}
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-card px-4 py-4 sm:px-5"
            >
              <Icon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-lg font-semibold tabular-nums tracking-tight text-nocta-ink">
                  {value}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Check-in → pick (presentation shell) */}
      <CheckInPanel selection={checkIn} onSelectionChange={setCheckIn} />

      {/* Today */}
      <div className="nocta-panel overflow-hidden">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-5 py-3.5 text-left sm:px-6"
          aria-expanded={todayOpen}
          onClick={() => setTodayOpen((o) => !o)}
        >
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-150",
              !todayOpen && "-rotate-90",
            )}
            aria-hidden
          />
          <span className="text-sm font-semibold tracking-tight text-nocta-ink">
            {c.today.title}
          </span>
        </button>

        {todayOpen ? (
          <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
            <div className="bg-card px-5 py-5 sm:px-6">
              <p className="text-[11px] font-medium text-muted-foreground">
                {c.today.plannerLabel}
              </p>
              <p
                className={cn(
                  "mt-2 text-sm",
                  checkIn.revealed
                    ? "font-medium text-nocta-ink"
                    : "text-muted-foreground",
                )}
              >
                {checkInSummary}
              </p>
            </div>
            <div className="bg-card px-5 py-5 sm:px-6">
              <p className="text-[11px] font-medium text-muted-foreground">
                {c.today.planLabel}
              </p>
              <p className="mt-2 text-sm font-medium text-nocta-ink">
                {c.today.planEmptyTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.today.planEmptyBody}
              </p>
              <p className="mt-4 text-[11px] text-muted-foreground">
                {c.today.tip}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
