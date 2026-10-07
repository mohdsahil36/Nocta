import { supabase } from "@/lib/supabase";
import { dashboardContent } from "../content";

/** Casual time-of-day line from the user's local hour. */
export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return dashboardContent.greeting.morning;
  if (hour >= 12 && hour < 17) return dashboardContent.greeting.afternoon;
  if (hour >= 17 && hour < 22) return dashboardContent.greeting.evening;
  return dashboardContent.greeting.night;
}

/** Single navbar line — e.g. "Good afternoon, Sahil" (Claude-style). */
export function navbarGreeting(hour: number, name: string): string {
  const greeting = greetingForHour(hour);
  const trimmed = name.trim();
  const isFallback =
    !trimmed || trimmed === dashboardContent.greeting.fallbackName;

  // Don't show ", there" while loading or if the session has no name yet.
  if (isFallback) return greeting;

  if (greeting === dashboardContent.greeting.night) {
    return `Still up, ${trimmed}?`;
  }
  return `${greeting}, ${trimmed}`;
}

/** Personal welcome line with the display name (toasts / legacy). */
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

function firstNameFromMeta(
  meta: Record<string, unknown> | undefined,
): string | null {
  if (!meta) return null;
  for (const key of ["name", "full_name", "display_name"] as const) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim().split(/\s+/)[0] ?? null;
    }
  }
  return null;
}

/** Name + email for the sidebar profile chip. */
export async function getSessionProfile(): Promise<SessionProfile> {
  const fallback = dashboardContent.greeting.fallbackName;

  // Local session first — faster and avoids a race right after login navigate.
  const { data: sessionData } = await supabase.auth.getSession();
  let user = sessionData.session?.user ?? null;

  if (!user) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return { name: fallback, email: null, initials: initialsFrom(fallback) };
    }
    user = data.user;
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta = firstNameFromMeta(meta);
  const email = user.email?.trim() ?? null;
  const fromEmail = email?.split("@")[0]?.trim() || null;
  const name = fromMeta || fromEmail || fallback;

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
