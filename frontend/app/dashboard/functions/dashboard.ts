import useAuthStore, {
  ensureAuthListener,
  waitForAuthReady,
} from "@/app/store/authStore";
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

export type SessionProfile = {
  name: string;
  email: string | null;
  initials: string;
};

/** Resolve a short display name — waits for auth hydration. */
export async function getDisplayName(): Promise<string> {
  const profile = await getSessionProfile();
  return profile.name;
}

/** Name + email for the sidebar profile chip — waits for auth hydration. */
export async function getSessionProfile(): Promise<SessionProfile> {
  ensureAuthListener();
  const state = await waitForAuthReady();
  return {
    name: state.name,
    email: state.email,
    initials: state.initials,
  };
}

/** Live profile from the auth store (call after ensureAuthListener). */
export function readSessionProfile(): SessionProfile {
  const { name, email, initials } = useAuthStore.getState();
  return { name, email, initials };
}
