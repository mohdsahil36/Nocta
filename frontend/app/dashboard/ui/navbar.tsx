"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Flame, LogOut, PanelLeft } from "lucide-react";

import { ChromeButton } from "@/components/ui/chrome-button";
import { activityStats } from "@/app/data/activity";
import {
  BEFORE_AUTH_PATH,
  logout,
} from "@/app/login/functions/auth";
import { dashboardContent } from "../content";
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
 * Floating glass navbar — greeting on scenery left; commits + logout right.
 * Theme lives in the sidebar. Scenery uses `dark:` so it follows themeBoot.
 */
export function DashboardNavbar({
  sidebarPinned,
  onOpenSidebar,
}: DashboardNavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

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
    <header className="nocta-navbar relative top-0 z-30 flex w-full flex-col gap-3 overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden rounded-[inherit]"
      >
        {/* Theme-matched scenery — night lake (dark) / sunlit hills (light) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nocta-navbar-scenery.jpg"
          alt=""
          className="absolute inset-0 hidden h-full w-full min-w-full object-cover object-[center_35%] opacity-85 brightness-[0.72] contrast-105 saturate-75 dark:block"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nocta-navbar-scenery-light.jpg"
          alt=""
          className="absolute inset-0 block h-full w-full min-w-full object-cover object-[center_40%] opacity-55 brightness-110 saturate-75 dark:hidden"
        />
        <div className="absolute inset-0 bg-linear-to-r from-nocta-canvas/40 via-nocta-canvas/10 to-transparent dark:from-black/35 dark:via-black/10 dark:to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-nocta-canvas/30 via-transparent to-transparent dark:from-card/25" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-b from-transparent to-nocta-canvas" />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3 sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
          {!sidebarPinned ? (
            <ChromeButton
              iconOnly
              className="mt-0.5 size-8 shrink-0 rounded-lg bg-background/70 backdrop-blur-sm sm:mt-0"
              aria-label={dashboardContent.actions.openSidebar}
              onClick={onOpenSidebar}
            >
              <PanelLeft className="size-4" />
            </ChromeButton>
          ) : null}
          <GreetingHeader />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <CommitsButton className="hidden rounded-lg bg-background/70 backdrop-blur-sm md:inline-flex" />

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
