"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, PanelLeft, Sun } from "lucide-react";

import { ChromeButton } from "@/components/ui/chrome-button";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { NoctaLoader } from "@/components/ui/nocta-loader";
import { BEFORE_AUTH_PATH, logout } from "@/app/login/functions/auth";
import useThemeStore, { useIsDark } from "@/app/store/themeStore";
import { dashboardContent } from "../content";
import { GreetingHeader } from "./greeting-header";
import { cn } from "cn";

type DashboardNavbarProps = {
  sidebarPinned: boolean;
  onOpenSidebar: () => void;
};

/** Locked: theme chip + logout share h-10. */
const CONTROL_H = "h-10";
/** Locked icon chip — muted surface in both themes (theme / open sidebar). */
const ICON_CHIP =
  "size-10 rounded-lg border border-border/60 bg-muted/45 text-nocta-ink shadow-none hover:border-border hover:bg-muted/70 dark:border-border dark:bg-muted/50 dark:hover:bg-muted/70";

/**
 * Minimal navbar — frosted bar over the shell grid. No sky ornaments.
 * Theme chip + labeled logout (medium blue + white) match in light and dark.
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
      <header className="nocta-navbar relative top-0 z-30 flex w-full items-center justify-between gap-3 px-3 py-3 tracking-tight sm:px-4 sm:py-3.5">
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
          {!sidebarPinned ? (
            <ChromeButton
              iconOnly
              className={cn("shrink-0", ICON_CHIP)}
              aria-label={dashboardContent.actions.openSidebar}
              onClick={onOpenSidebar}
            >
              <AnimatedIcon
                icon={PanelLeft}
                className="size-4"
                preset="nudge"
                tone="neutral"
              />
            </ChromeButton>
          ) : null}
          <GreetingHeader />
        </div>

        <nav
          className="relative z-10 flex shrink-0 items-center gap-2"
          aria-label="Account"
        >
          <ChromeButton
            iconOnly
            className={ICON_CHIP}
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
              <Sun className="size-4 text-nocta-ink" aria-hidden />
            ) : (
              <Moon className="size-4 text-nocta-ink" aria-hidden />
            )}
          </ChromeButton>

          <ChromeButton
            iconOnly
            className={cn(ICON_CHIP, "sm:hidden")}
            aria-label={dashboardContent.actions.logout}
            disabled={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="size-4 text-nocta-ink" aria-hidden />
          </ChromeButton>

          <ChromeButton
            className={cn(
              "hidden tracking-tight sm:inline-flex",
              CONTROL_H,
              "gap-1.5 rounded-lg px-3.5 text-xs",
            )}
            disabled={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="size-3.5" aria-hidden />
            {dashboardContent.actions.logout}
          </ChromeButton>
        </nav>
      </header>

      {logoutError ? (
        <p className="px-1 text-[11px] text-destructive" role="alert">
          {logoutError}
        </p>
      ) : null}

      <NoctaLoader
        variant="overlay"
        open={loggingOut}
        title={dashboardContent.brand}
        label="Signing out…"
      />
    </>
  );
}
