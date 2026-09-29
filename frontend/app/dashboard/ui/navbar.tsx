"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, PanelLeft, Sun } from "lucide-react";

import { ChromeButton } from "@/components/ui/chrome-button";
import { NoctaLoader } from "@/components/ui/nocta-loader";
import { BEFORE_AUTH_PATH, logout } from "@/app/login/functions/auth";
import useThemeStore, { useIsDark } from "@/app/store/themeStore";
import { dashboardContent } from "../content";
import { GreetingHeader } from "./greeting-header";

type DashboardNavbarProps = {
  sidebarPinned: boolean;
  onOpenSidebar: () => void;
};

const CONTROL =
  "rounded-md border-foreground/12 bg-nocta-paper text-nocta-ink shadow-sm dark:border-border dark:bg-card dark:text-nocta-ink";

/**
 * Frosted navbar — readable paper bar, soft day/night sky behind a veil.
 */
export function DashboardNavbar({
  sidebarPinned,
  onOpenSidebar,
}: DashboardNavbarProps) {
  const router = useRouter();
  const isDark = useIsDark();
  const toggleTheme = useThemeStore((s) => s.toggle);
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
    <>
      <header className="nocta-navbar relative top-0 z-30 flex w-full items-center justify-between gap-3 overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
        {/* Day + night layers crossfade via .dark — no React phase swap (avoids jitter) */}
        <div
          aria-hidden
          className="nocta-navbar-sky pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        >
          <div className="nocta-navbar-sky-day">
            <span className="nocta-navbar-orb nocta-navbar-orb-primary" />
            <span className="nocta-navbar-orb nocta-navbar-orb-secondary" />
          </div>
          <div className="nocta-navbar-sky-night">
            <span className="nocta-navbar-orb nocta-navbar-orb-primary" />
            <span className="nocta-navbar-orb nocta-navbar-orb-secondary" />
            <span className="nocta-navbar-stars" />
          </div>
          <div className="nocta-navbar-veil" />
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5">
          {!sidebarPinned ? (
            <ChromeButton
              iconOnly
              className={["size-8 shrink-0", CONTROL].join(" ")}
              aria-label={dashboardContent.actions.openSidebar}
              onClick={onOpenSidebar}
            >
              <PanelLeft className="size-4" />
            </ChromeButton>
          ) : null}
          <GreetingHeader />
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ChromeButton
            iconOnly
            className={["size-8", CONTROL].join(" ")}
            aria-label={
              isDark
                ? dashboardContent.actions.themeLight
                : dashboardContent.actions.themeDark
            }
            title={
              isDark
                ? dashboardContent.actions.themeLight
                : dashboardContent.actions.themeDark
            }
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="size-4" aria-hidden />
            ) : (
              <Moon className="size-4" aria-hidden />
            )}
          </ChromeButton>

          <ChromeButton
            iconOnly
            className={["size-8 sm:hidden", CONTROL].join(" ")}
            aria-label={dashboardContent.actions.logout}
            disabled={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="size-4" />
          </ChromeButton>

          <ChromeButton
            className={["hidden sm:inline-flex", CONTROL].join(" ")}
            disabled={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="size-3.5" aria-hidden />
            {dashboardContent.actions.logout}
          </ChromeButton>
        </div>
      </header>

      {logoutError ? (
        <p className="px-1 text-xs text-destructive" role="alert">
          {logoutError}
        </p>
      ) : null}

      <NoctaLoader
        variant="overlay"
        open={loggingOut}
        title={dashboardContent.brand}
        label="Closing tonight…"
      />
    </>
  );
}
