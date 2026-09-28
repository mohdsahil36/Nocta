import { supabase } from "@/lib/supabase";
import { dashboardContent } from "../content";

/** Casual time-of-day line from the user's local hour. */
export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return dashboardContent.greeting.morning;
  if (hour >= 12 && hour < 17) return dashboardContent.greeting.afternoon;
  if (hour >= 17 && hour < 22) return dashboardContent.greeting.evening;
  return dashboardContent.greeting.night;
}

/** Personal welcome line with the display name. */
export function welcomeMessage(name: string): string {
  return dashboardContent.greeting.welcome(name);
}

/** Resolve a short display name from the current Supabase session. */
export async function getDisplayName(): Promise<string> {
  const profile = await getSessionProfile();
  return profile.name;
}

export type SessionProfile = {
  name: string;
  email: string | null;
  initials: string;
};

/** Name + email for the sidebar profile chip. */
export async function getSessionProfile(): Promise<SessionProfile> {
  const fallback = dashboardContent.greeting.fallbackName;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { name: fallback, email: null, initials: initialsFrom(fallback) };
  }

  const meta = data.user.user_metadata as { name?: string } | undefined;
  const fromMeta = meta?.name?.trim();
  const email = data.user.email?.trim() ?? null;
  const name =
    fromMeta?.split(" ")[0] ??
    email?.split("@")[0] ??
    fallback;

  return {
    name,
    email,
    initials: initialsFrom(fromMeta || name),
  };
}

function initialsFrom(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return (parts[0] ?? "N").slice(0, 2).toUpperCase();
}
