"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, PanelLeft, Search, Sun } from "lucide-react";

import { ChromeButton } from "@/components/ui/chrome-button";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { NoctaLoader } from "@/components/ui/nocta-loader";
import { BEFORE_AUTH_PATH, logout } from "@/app/login/functions/auth";
import useThemeStore, { useIsDark } from "@/app/store/themeStore";
import { dashboardContent } from "../content";
import { getSessionProfile, type SessionProfile } from "../functions/dashboard";
import { cn } from "cn";

type DashboardNavbarProps = {
  sidebarPinned: boolean;
  onOpenSidebar: () => void;
};

const ICON_BTN = "size-8 rounded-md";

/**
 * Blueprint-style top bar — search field + account tools.
 * Search is visual only until cmd-k ships (deferred to v2).
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
  const [profile, setProfile] = useState<SessionProfile>(() => ({
    name: dashboardContent.greeting.fallbackName,
    email: null,
    initials: "N",
  }));

  useEffect(() => {
    let cancelled = false;
    void getSessionProfile().then((next) => {
      if (!cancelled) setProfile(next);
    });
    return () => {
      cancelled = true;
    };
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
    <>
      <header className="nocta-navbar relative z-30 flex h-12 w-full shrink-0 items-center gap-3 px-3 tracking-tight sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!sidebarPinned ? (
            <ChromeButton
              iconOnly
              className={cn("shrink-0", ICON_BTN)}
              aria-label={dashboardContent.actions.openSidebar}
              onClick={onOpenSidebar}
            >
              <AnimatedIcon
                icon={PanelLeft}
                className="size-3.5"
                preset="nudge"
                tone="neutral"
              />
            </ChromeButton>
          ) : null}

          {/* deferred to v2: real cmd-k search — visual match only */}
          <div
            className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-muted-foreground sm:flex"
            title="Search coming soon"
          >
            <Search className="size-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-[13px]">
              {dashboardContent.navbar.searchPlaceholder}
            </span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] leading-none text-muted-foreground">
              {dashboardContent.navbar.searchHint}
            </kbd>
          </div>
        </div>

        <nav
          className="flex shrink-0 items-center gap-1"
          aria-label="Account"
        >
          <ChromeButton
            iconOnly
            className={ICON_BTN}
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
              <Sun className="size-3.5" aria-hidden />
            ) : (
              <Moon className="size-3.5" aria-hidden />
            )}
          </ChromeButton>

          <ChromeButton
            iconOnly
            className={ICON_BTN}
            aria-label={dashboardContent.actions.logout}
            disabled={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="size-3.5" aria-hidden />
          </ChromeButton>

          <span
            className="ml-0.5 flex size-8 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background"
            title={profile.email ?? profile.name}
          >
            {profile.initials}
          </span>
        </nav>
      </header>

      {logoutError ? (
        <p className="px-3 text-[11px] text-destructive" role="alert">
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
