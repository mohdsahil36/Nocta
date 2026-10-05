export type Commit = {
  id: string;
  message: string;
  repository: string;
  sha: string;
  date: string;
  time: string;
  url: string;
  isMerge: boolean;
};

/** Placeholder until dashboard wires to API streak stats. */
export const activityStats = {
  currentStreak: 0,
  longestStreak: 0,
  // deferred to v2: leetcode / submission tracking
  todaySubmissions: 0,
};
