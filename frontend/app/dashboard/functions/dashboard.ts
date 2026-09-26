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
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return dashboardContent.greeting.fallbackName;

  const meta = data.user.user_metadata as { name?: string } | undefined;
  const fromMeta = meta?.name?.trim();
  if (fromMeta) return fromMeta.split(" ")[0] ?? fromMeta;

  const email = data.user.email?.trim();
  if (email)
    return email.split("@")[0] ?? dashboardContent.greeting.fallbackName;

  return dashboardContent.greeting.fallbackName;
}
