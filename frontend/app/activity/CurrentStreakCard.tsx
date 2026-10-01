import { ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";

import { activityStats } from "../data/activity";

export default function CurrentStreakCard() {
  return (
    <Link
      href="/activity"
      className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-left transition-colors hover:bg-muted"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border">
        <Flame className="h-3.5 w-3.5" />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">Current streak</span>

        <span className="text-sm font-medium">
          {activityStats.currentStreak} days
        </span>
      </div>

      <ArrowUpRight className="ml-0.5 h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  );
}
