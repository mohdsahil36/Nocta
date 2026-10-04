"use client";

import { ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";

import { AnimatedIcon, ICON_TONE_BG } from "@/components/ui/animated-icon";
import { activityStats } from "../data/activity";
import { cn } from "cn";

export default function CurrentStreakCard() {
  return (
    <Link
      href="/activity"
      className="flex items-center gap-2.5 rounded-md border border-border bg-background px-3 py-2 text-left transition-colors hover:bg-muted"
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          ICON_TONE_BG.warm,
        )}
      >
        <AnimatedIcon
          icon={Flame}
          className="size-3.5"
          preset="pulse"
          tone="warm"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">Current streak</span>

        <span className="text-sm font-medium">
          {activityStats.currentStreak} days
        </span>
      </div>

      <AnimatedIcon
        icon={ArrowUpRight}
        className="ml-0.5 size-3.5"
        preset="nudge"
        tone="glow"
      />
    </Link>
  );
}
