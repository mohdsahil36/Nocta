"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

import { dashboardContent } from "@/app/dashboard/content";
import { supabase } from "@/lib/supabase";

/** Resolved profile fields mirrored from the Supabase session. */
export type AuthProfile = {
  userId: string | null;
  name: string;
  email: string | null;
  initials: string;
};

type AuthState = AuthProfile & {
  /** False until the first `onAuthStateChange` event (incl. INITIAL_SESSION). */
  ready: boolean;
  setFromUser: (user: User | null) => void;
};

const FALLBACK_NAME = dashboardContent.greeting.fallbackName;

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "N";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function firstNameFromMeta(
  meta: Record<string, unknown> | undefined,
): string | null {
  const name = meta?.name;
  if (typeof name !== "string" || !name.trim()) return null;
  return name.trim().split(/\s+/)[0] ?? null;
}

function profileFromUser(user: User | null): AuthProfile {
  if (!user) {
    return {
      userId: null,
      name: FALLBACK_NAME,
      email: null,
      initials: "N",
    };
  }

  const email = user.email?.trim() || null;
  const name =
    firstNameFromMeta(user.user_metadata as Record<string, unknown>) ||
    email?.split("@")[0] ||
    FALLBACK_NAME;

  return {
    userId: user.id,
    name,
    email,
    initials: initialsFromName(name),
  };
}

const useAuthStore = create<AuthState>()((set) => ({
  ready: false,
  userId: null,
  name: FALLBACK_NAME,
  email: null,
  initials: "N",

  setFromUser: (user) =>
    set({
      ...profileFromUser(user),
      ready: true,
    }),
}));

let started = false;

/** Start a single app-wide Supabase auth subscription (idempotent). */
export function ensureAuthListener() {
  if (started || typeof window === "undefined") return;
  started = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setFromUser(session?.user ?? null);
  });
}

/** Resolve once the first auth event has landed (or after timeout). */
export function waitForAuthReady(timeoutMs = 8000): Promise<AuthState> {
  ensureAuthListener();
  const current = useAuthStore.getState();
  if (current.ready) return Promise.resolve(current);

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      unsub();
      resolve(useAuthStore.getState());
    }, timeoutMs);

    const unsub = useAuthStore.subscribe((state) => {
      if (!state.ready) return;
      window.clearTimeout(timer);
      unsub();
      resolve(state);
    });
  });
}

export default useAuthStore;
