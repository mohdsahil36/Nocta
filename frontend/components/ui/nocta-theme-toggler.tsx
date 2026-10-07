"use client";

import { useLayoutEffect, useState } from "react";

import useThemeStore, { useIsDark } from "@/app/store/themeStore";
import {
  AnimatedThemeToggler,
  type TransitionVariant,
} from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

type NoctaThemeTogglerProps = {
  className?: string;
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
  "aria-label"?: string;
  title?: string;
};

/**
 * Magic UI view-transition theme toggle, wired to `themeStore`
 * (controlled — no next-themes / no Magic UI localStorage key).
 */
export function NoctaThemeToggler({
  className,
  duration,
  variant,
  fromCenter,
  "aria-label": ariaLabel = "Toggle theme",
  title,
}: NoctaThemeTogglerProps) {
  const isDark = useIsDark();
  const hydrated = useThemeStore((s) => s.hydrated);
  // themeBoot may already set `dark` on <html> before zustand rehydrates
  const [bootDark, setBootDark] = useState(false);
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBootDark(document.documentElement.classList.contains("dark"));
  }, []);
  const theme = (hydrated ? isDark : bootDark) ? "dark" : "light";

  return (
    <AnimatedThemeToggler
      theme={theme}
      duration={duration}
      variant={variant}
      fromCenter={fromCenter}
      onThemeChange={(next) => {
        // VT already toggled `dark` on <html>; sync preference only
        // (skip applyDomTheme so theme-transition doesn't fight VT).
        useThemeStore.setState({ preference: next });
        setBootDark(next === "dark");
      }}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={cn(className)}
    />
  );
}
