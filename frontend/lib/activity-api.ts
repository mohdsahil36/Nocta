import type { Commit } from "@/app/data/activity";

export type ActivityStatsResponse = {
  currentStreak: number;
  longestStreak: number;
  todayCount: number;
};

export type ActivityCommitsResponse = {
  message: string;
  data: {
    count: number;
    commits: Commit[];
    stats: ActivityStatsResponse;
  };
};

export async function fetchPlatformCommits(): Promise<
  ActivityCommitsResponse["data"]
> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${baseUrl}/api/activity/commits`);
  if (!response.ok) {
    throw new Error("Failed to load platform commits");
  }

  const json = (await response.json()) as ActivityCommitsResponse;
  return json.data;
}

/** Matches backend `toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })`. */
export function formatActivityDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
