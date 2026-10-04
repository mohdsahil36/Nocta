type CommitDay = {
  date: string;
};

export type ActivityStats = {
  currentStreak: number;
  longestStreak: number;
  todayCount: number;
};

/** Same string shape as commit.date in activity.service */
export function formatActivityDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Move a date label forward (+) or backward (−) by N calendar days */
function shiftDay(label: string, delta: number): string {
  const d = new Date(label);
  d.setDate(d.getDate() + delta);
  return formatActivityDate(d);
}

export function computeActivityStats(
  commits: CommitDay[],
  todayLabel: string,
): ActivityStats {
  if (commits.length === 0 || !todayLabel) {
    return { currentStreak: 0, longestStreak: 0, todayCount: 0 };
  }

  const todayCount = commits.filter((c) => c.date === todayLabel).length;
  const days = new Set(commits.map((c) => c.date));

  // Current streak: start today, or yesterday if today is empty
  let currentStreak = 0;
  let cursor: string | null = null;

  if (days.has(todayLabel)) {
    cursor = todayLabel;
  } else if (days.has(shiftDay(todayLabel, -1))) {
    cursor = shiftDay(todayLabel, -1);
  }

  while (cursor && days.has(cursor)) {
    currentStreak += 1;
    cursor = shiftDay(cursor, -1);
  }

  // Longest streak: walk unique days oldest → newest
  const sorted = Array.from(days).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  let longestStreak = 0;
  let run = 0;

  for (let i = 0; i < sorted.length; i++) {
    const day = sorted[i]!;
    const prev = sorted[i - 1];

    if (i === 0 || day === shiftDay(prev!, 1)) {
      run += 1;
    } else {
      run = 1;
    }

    if (run > longestStreak) {
      longestStreak = run;
    }
  }

  return { currentStreak, longestStreak, todayCount };
}
