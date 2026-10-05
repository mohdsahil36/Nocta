"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { LogOut, Monitor, Sun, type LucideIcon } from "lucide-react";

import { NoctaLoader } from "@/components/ui/nocta-loader";
import { NoctaMark } from "@/components/ui/nocta-mark";
import { Separator } from "@/components/ui/separator";
import { BEFORE_AUTH_PATH, logout } from "@/app/login/functions/auth";
import useThemeStore, {
  type ThemePreference,
} from "@/app/store/themeStore";
import { cn } from "cn";

import { dashboardContent } from "../content";
import {
  getSessionProfile,
  type SessionProfile,
} from "../functions/dashboard";

type ThemeMode = "light" | "dark" | "system";

type ThemeIcon = LucideIcon | typeof NoctaMark;

function preferenceToMode(preference: ThemePreference): ThemeMode {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return "system";
}

function modeToPreference(mode: ThemeMode): ThemePreference {
  if (mode === "system") return null;
  return mode;
}

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  hint: string;
  icon: ThemeIcon;
}[] = [
  {
    mode: "light",
    label: dashboardContent.account.themeLight,
    hint: dashboardContent.account.themeLightHint,
    icon: Sun,
  },
  {
    mode: "dark",
    label: dashboardContent.account.themeDark,
    hint: dashboardContent.account.themeDarkHint,
    icon: NoctaMark,
  },
  {
    mode: "system",
    label: dashboardContent.account.themeSystem,
    hint: dashboardContent.account.themeSystemHint,
    icon: Monitor,
  },
];

/**
 * Navbar account menu — profile, theme (light/dark/system), log out.
 * Replaces the old standalone theme + logout icon buttons.
 */
export function AccountMenu() {
  const router = useRouter();
  const preference = useThemeStore((s) => s.preference);
  const hydrated = useThemeStore((s) => s.hydrated);
  const setPreference = useThemeStore((s) => s.setPreference);
  const [open, setOpen] = useState(false);
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

  const activeMode = hydrated ? preferenceToMode(preference) : "system";

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    setOpen(false);
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
      <Menu.Root open={open} onOpenChange={setOpen}>
        <Menu.Trigger
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            "bg-foreground text-[11px] font-semibold text-background",
            "outline-none transition-shadow duration-150",
            "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
            "data-popup-open:ring-2 data-popup-open:ring-ring",
          )}
          aria-label={dashboardContent.account.menuLabel}
        >
          {profile.initials}
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner
            side="bottom"
            align="end"
            sideOffset={6}
            alignOffset={0}
            collisionPadding={12}
            collisionAvoidance={{ side: "flip", align: "none" }}
            className="z-50 outline-none"
          >
            <Menu.Popup
              className={cn(
                "w-[min(calc(100vw-1.5rem),16.5rem)] overflow-hidden rounded-xl",
                "border border-border bg-card text-card-foreground shadow-none",
                "origin-(--transform-origin) outline-none",
                "data-starting-style:scale-95 data-starting-style:opacity-0",
                "data-ending-style:scale-95 data-ending-style:opacity-0",
                "transition-[transform,opacity] duration-150 ease-out",
              )}
            >
              <div className="flex items-center gap-3 px-3.5 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[12px] font-semibold text-background">
                  {profile.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold leading-tight text-nocta-ink">
                    {profile.name}
                  </span>
                  {profile.email ? (
                    <span className="mt-0.5 block truncate text-[11px] leading-tight text-muted-foreground">
                      {profile.email}
                    </span>
                  ) : null}
                </span>
              </div>

              <Separator />

              <div className="px-2 py-2">
                <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                  <span className="min-w-0 flex-1 text-[13px] text-nocta-ink">
                    {dashboardContent.account.theme}
                  </span>
                  <div
                    role="group"
                    aria-label={dashboardContent.account.theme}
                    className="flex shrink-0 items-center rounded-lg border border-border bg-muted/40 p-0.5"
                  >
                    {THEME_OPTIONS.map(({ mode, label, hint, icon: Icon }) => {
                      const selected = activeMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          aria-label={hint}
                          aria-pressed={selected}
                          title={hint}
                          className={cn(
                            "flex size-7 items-center justify-center rounded-md",
                            "text-muted-foreground transition-[background-color,color] duration-150",
                            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected
                              ? "bg-card text-nocta-ink shadow-none"
                              : "hover:text-nocta-ink",
                          )}
                          onClick={() => {
                            setPreference(modeToPreference(mode));
                          }}
                        >
                          <Icon className="size-3.5" aria-hidden />
                          <span className="sr-only">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="p-1.5">
                <Menu.Item
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2",
                    "text-[13px] text-nocta-ink outline-none select-none",
                    "transition-[background-color,box-shadow] duration-150",
                    "hover:bg-muted/60 focus:bg-muted/60",
                    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                    "data-highlighted:bg-muted/60 data-highlighted:ring-2 data-highlighted:ring-primary data-highlighted:ring-inset",
                    "disabled:pointer-events-none disabled:opacity-50",
                  )}
                  disabled={loggingOut}
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  <LogOut className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  {dashboardContent.actions.logout}
                </Menu.Item>
              </div>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {logoutError ? (
        <p className="absolute right-3 top-full mt-1 text-[11px] text-destructive" role="alert">
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
