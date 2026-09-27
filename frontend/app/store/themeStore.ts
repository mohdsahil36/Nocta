"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

export const THEME_KEY = "nocta-theme";

export type ThemePreference = "dark" | "light" | null;

type ThemeState = {
  /** Explicit override; `null` = evening-aware auto (5pm–7am dark). */
  preference: ThemePreference;
  /** False until client rehydrate — keeps SSR and first client paint aligned. */
  hydrated: boolean;
  setDark: (next: boolean) => void;
  toggle: () => void;
};

/** Dark mode between 5pm and 7am when no explicit preference is stored. */
export function isLocalEvening(date = new Date()) {
  const h = date.getHours();
  return h >= 17 || h < 7;
}

export function resolveIsDark(preference: ThemePreference) {
  if (preference === "dark") return true;
  if (preference === "light") return false;
  return isLocalEvening();
}

/** Toggle the `dark` class on <html>, with a short color transition. */
export function applyDomTheme(isDark: boolean, { transition = true } = {}) {
  const root = document.documentElement;
  if (transition) root.classList.add("theme-transition");
  root.classList.toggle("dark", isDark);
  const color = isDark ? "#0a0a0a" : "#f4f5f8";
  root.style.backgroundColor = color;
  if (document.body) document.body.style.backgroundColor = color;
  if (transition) {
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 320);
  }
}

/** Persist as plain `"dark"` / `"light"` (matches layout themeBoot). */
const themePersistStorage: PersistStorage<Pick<ThemeState, "preference">> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (raw === "dark") return { state: { preference: "dark" }, version: 0 };
    if (raw === "light") return { state: { preference: "light" }, version: 0 };
    return { state: { preference: null }, version: 0 };
  },
  setItem: (name, value) => {
    const pref = value.state.preference;
    if (pref === "dark" || pref === "light") {
      window.localStorage.setItem(name, pref);
      return;
    }
    window.localStorage.removeItem(name);
  },
  removeItem: (name) => {
    window.localStorage.removeItem(name);
  },
};

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Always null on create so SSR and first client render match.
      preference: null,
      hydrated: false,
      setDark: (next) => {
        set({ preference: next ? "dark" : "light" });
        applyDomTheme(next);
      },
      toggle: () => {
        get().setDark(!resolveIsDark(get().preference));
      },
    }),
    {
      name: THEME_KEY,
      storage: themePersistStorage,
      partialize: (s) => ({ preference: s.preference }),
      skipHydration: true,
    },
  ),
);

/** Mount once in the root layout — rehydrates persist + cross-tab sync. */
export function ThemeSync() {
  useLayoutEffect(() => {
    void Promise.resolve(useThemeStore.persist.rehydrate()).then(() => {
      useThemeStore.setState({ hydrated: true });
      applyDomTheme(resolveIsDark(useThemeStore.getState().preference), {
        transition: false,
      });
    });
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      void Promise.resolve(useThemeStore.persist.rehydrate()).then(() => {
        applyDomTheme(resolveIsDark(useThemeStore.getState().preference), {
          transition: false,
        });
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}

/**
 * Resolved dark mode after client hydrate.
 * Returns `false` until rehydrate so SSR HTML matches the first client paint.
 * Prefer `dark:` CSS for paint-critical chrome (follows themeBoot on `<html>`).
 */
export function useIsDark() {
  const preference = useThemeStore((s) => s.preference);
  const hydrated = useThemeStore((s) => s.hydrated);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hydrated || preference !== null) return;
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [hydrated, preference]);

  if (!hydrated) return false;

  const isDark =
    preference === "dark"
      ? true
      : preference === "light"
        ? false
        : isLocalEvening(new Date(now));

  return isDark;
}

export default useThemeStore;
