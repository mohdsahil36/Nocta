"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Flame,
  LogOut,
  Moon,
  PanelLeft,
  Sun,
} from "lucide-react";

import { ChromeButton } from "@/components/ui/chrome-button";
import { activityStats } from "@/app/data/activity";
import {
  BEFORE_AUTH_PATH,
  logout,
} from "@/app/login/functions/auth";
import { useIsDark, writeTheme } from "@/lib/theme";
import { cn } from "cn";
import { dashboardContent } from "../content";
import {
  getDisplayName,
  greetingForHour,
  welcomeMessage,
} from "../functions/dashboard";
import { GreetingHeader } from "./greeting-header";

type DashboardNavbarProps = {
  sidebarPinned: boolean;
  onOpenSidebar: () => void;
};

function CommitsButton({ className }: { className?: string }) {
  return (
    <ChromeButton href="/activity" className={className}>
      <Flame className="size-3.5 shrink-0 text-nocta-glow" aria-hidden />
      <span className="text-muted-foreground">
        <span className="md:hidden">Commits</span>
        <span className="hidden md:inline">
          {dashboardContent.actions.platformCommits}
        </span>
      </span>
      <span className="font-medium">{activityStats.currentStreak} days</span>
      <ArrowUpRight
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </ChromeButton>
  );
}

/**
 * Floating glass navbar — greeting left; commits + theme + logout right on md+.
 * Theme-matched scenery across the navbar: night lake (dark) / sunlit hills (light).
 */
export function DashboardNavbar({
  sidebarPinned,
  onOpenSidebar,
}: DashboardNavbarProps) {
  const router = useRouter();
  const dark = useIsDark();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [timeGreeting] = useState(() => greetingForHour(new Date().getHours()));
  const [welcome, setWelcome] = useState(
    welcomeMessage(dashboardContent.greeting.fallbackName),
  );

  useEffect(() => {
    void getDisplayName().then((name) => {
      setWelcome(welcomeMessage(name));
    });
  }, []);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      router.push(BEFORE_AUTH_PATH);
    } catch (err) {
      setLogoutError(
        err instanceof Error ? err.message : "Could not log out. Try again.",
      );
      setLoggingOut(false);
    }
  }

  return (
    <header className="nocta-navbar relative top-0 z-30 flex w-full flex-col gap-3 overflow-hidden px-4 py-3 sm:px-5 sm:py-3.5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden rounded-[inherit]"
      >
        {/* Theme-matched scenery — night lake (dark) / sunlit hills (light) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={dark ? "night" : "day"}
          src={
            dark
              ? "/nocta-navbar-scenery.jpg"
              : "/nocta-navbar-scenery-light.jpg"
          }
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full min-w-full object-cover",
            dark
              ? "object-[center_35%] opacity-85 brightness-[0.72] contrast-105 saturate-75"
              : "object-[center_40%] opacity-55 brightness-110 saturate-75",
          )}
        />
        <div
          className={cn(
            "absolute inset-0",
            dark
              ? "bg-linear-to-r from-black/20 via-transparent to-black/15"
              : "bg-linear-to-r from-nocta-canvas/25 via-transparent to-nocta-canvas/20",
          )}
        />
        <div
          className={cn(
            "absolute inset-0",
            dark
              ? "bg-linear-to-b from-card/35 via-card/15 to-transparent"
              : "bg-linear-to-b from-nocta-canvas/55 via-nocta-canvas/25 to-transparent",
          )}
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-b from-transparent to-nocta-canvas" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {!sidebarPinned ? (
            <ChromeButton
              iconOnly
              className="size-8 shrink-0 rounded-lg bg-background/70 backdrop-blur-sm"
              aria-label={dashboardContent.actions.openSidebar}
              onClick={onOpenSidebar}
            >
              <PanelLeft className="size-4" />
            </ChromeButton>
          ) : null}
          <GreetingHeader timeGreeting={timeGreeting} welcome={welcome} />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <CommitsButton className="hidden rounded-lg bg-background/70 backdrop-blur-sm md:inline-flex" />

          <ChromeButton
            iconOnly
            className="size-8 shrink-0 rounded-lg bg-background/80 backdrop-blur-sm"
            aria-label={
              dark
                ? dashboardContent.actions.themeLight
                : dashboardContent.actions.themeDark
            }
            onClick={() => writeTheme(!dark)}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </ChromeButton>

          <ChromeButton
            iconOnly
            className="size-8 rounded-lg bg-background/70 backdrop-blur-sm sm:hidden"
            aria-label={dashboardContent.actions.logout}
            disabled={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="size-4" />
          </ChromeButton>

          <ChromeButton
            className="hidden rounded-lg bg-background/70 backdrop-blur-sm sm:inline-flex"
            disabled={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="size-3.5" aria-hidden />
            {dashboardContent.actions.logout}
          </ChromeButton>
        </div>
      </div>

      {logoutError ? (
        <p className="relative z-10 text-xs text-destructive" role="alert">
          {logoutError}
        </p>
      ) : null}

      <div className="relative z-10 md:hidden">
        <CommitsButton className="w-full justify-between rounded-lg bg-background/70 backdrop-blur-sm" />
      </div>
    </header>
  );
}
