"use client";

import { useEffect, useSyncExternalStore } from "react";

const THEME_KEY = "nocta-theme";
const themeListeners = new Set<() => void>();

/** Dark mode between 5pm and 7am when no explicit preference is stored. */
export function isLocalEvening(date = new Date()) {
  const h = date.getHours();
  return h >= 17 || h < 7;
}

/** Read stored theme, else evening-aware default. */
export function readDarkPreference(): boolean {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return isLocalEvening();
}

export function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  const tick = window.setInterval(onStoreChange, 60_000);
  return () => {
    themeListeners.delete(onStoreChange);
    mq.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.clearInterval(tick);
  };
}

/** Persist preference and toggle the `dark` class on <html>, with a short color transition. */
export function writeTheme(next: boolean) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  root.classList.toggle("dark", next);
  themeListeners.forEach((listener) => listener());
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 320);
}

/** Subscribe to app theme (not next-themes / Shadcn ThemeProvider). */
export function useIsDark() {
  const dark = useSyncExternalStore(
    subscribeTheme,
    readDarkPreference,
    () => false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    const color = dark ? "#0a0a0a" : "#f4f5f8";
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
    return () => {
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, [dark]);

  return dark;
}
