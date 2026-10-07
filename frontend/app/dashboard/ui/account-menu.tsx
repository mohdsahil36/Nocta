"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  LogOut,
  Monitor,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { DeskLoader } from "@/components/ui/desk-loader";
import { NoctaMark } from "@/components/ui/nocta-mark";
import { Separator } from "@/components/ui/separator";
import { BEFORE_AUTH_PATH, logout } from "@/app/login/functions/auth";
import useThemeStore, { type ThemePreference } from "@/app/store/themeStore";
import { cn } from "cn";

import { dashboardContent } from "../content";
import { getSessionProfile, type SessionProfile } from "../functions/dashboard";

const easeOut = [0.22, 1, 0.36, 1] as const;

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

type AccountMenuProps = {
  /** Icon-only trigger when the sidebar rail is collapsed. */
  collapsed?: boolean;
  /** Notify parent when the panel is open (hover-peek lock, etc.). */
  onMenuOpenChange?: (open: boolean) => void;
  /** Expand / pin the rail when opening from the collapsed icon. */
  onExpandSidebar?: () => void;
};

/**
 * Sidebar account — inline expand in the footer (no dialog / popover).
 */
export function AccountMenu({
  collapsed = false,
  onMenuOpenChange,
  onExpandSidebar,
}: AccountMenuProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
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

  // panel needs the expanded rail — close if the rail collapses
  useEffect(() => {
    if (collapsed && open) {
      setOpen(false);
      onMenuOpenChange?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when rail collapses
  }, [collapsed]);

  const activeMode = hydrated ? preferenceToMode(preference) : "system";

  function setPanelOpen(next: boolean) {
    setOpen(next);
    onMenuOpenChange?.(next);
  }

  function handleTriggerClick() {
    if (collapsed) {
      onExpandSidebar?.();
      setPanelOpen(true);
      return;
    }
    setPanelOpen(!open);
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    setPanelOpen(false);
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
      <div className={cn("flex w-full flex-col", collapsed && "items-center")}>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg outline-none",
            "transition-[background-color,box-shadow] duration-150",
            "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
            open && "bg-muted/50",
            collapsed ? "size-9 justify-center gap-0 p-0" : "px-2 py-1.5",
          )}
          aria-label={dashboardContent.account.menuLabel}
          aria-expanded={open}
          aria-controls="nocta-account-panel"
          onClick={handleTriggerClick}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
            {profile.initials}
          </span>
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[13px] leading-tight font-medium text-nocta-ink">
                  {profile.name}
                </span>
                <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground">
                  {profile.email ?? dashboardContent.sidebar.profileLabel}
                </span>
              </span>
              <motion.span
                className="inline-flex size-3.5 shrink-0 text-muted-foreground"
                animate={{ rotate: open ? 180 : 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.24, ease: easeOut }
                }
                aria-hidden
              >
                <ChevronDown className="size-3.5" />
              </motion.span>
            </>
          ) : (
            <span className="sr-only">{profile.name}</span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {!collapsed && open ? (
            <motion.div
              key="account-panel"
              id="nocta-account-panel"
              initial={
                reduceMotion ? false : { height: 0, opacity: 0, marginTop: 0 }
              }
              animate={{ height: "auto", opacity: 1, marginTop: 4 }}
              exit={
                reduceMotion
                  ? undefined
                  : { height: 0, opacity: 0, marginTop: 0 }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: easeOut }
              }
              className="w-full overflow-hidden"
            >
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.22, delay: 0.04, ease: easeOut }
                }
                className="rounded-lg border border-border bg-card"
              >
                <p className="px-2.5 pt-2 pb-1 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  {dashboardContent.account.theme}
                </p>
                <div
                  className="flex flex-col gap-0.5 px-1 pb-1"
                  role="listbox"
                  aria-label={dashboardContent.account.theme}
                >
                  {THEME_OPTIONS.map(
                    ({ mode, label, hint, icon: Icon }, index) => {
                      const selected = activeMode === mode;
                      return (
                        <motion.button
                          key={mode}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          title={hint}
                          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : {
                                  duration: 0.2,
                                  delay: 0.08 + index * 0.04,
                                  ease: easeOut,
                                }
                          }
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left",
                            "text-[12px] text-nocta-ink outline-none transition-colors",
                            "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
                            selected && "bg-muted/50",
                          )}
                          onClick={() => {
                            setPreference(modeToPreference(mode));
                          }}
                        >
                          <Icon
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">{label}</span>
                          {selected ? (
                            <Check
                              className="size-3 shrink-0 text-primary"
                              aria-hidden
                            />
                          ) : null}
                        </motion.button>
                      );
                    },
                  )}
                </div>

                <Separator />

                <motion.div
                  className="p-1"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.2, delay: 0.22, ease: easeOut }
                  }
                >
                  <button
                    type="button"
                    disabled={loggingOut}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-2",
                      "text-[12px] text-nocta-ink outline-none transition-colors",
                      "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
                      "disabled:pointer-events-none disabled:opacity-50",
                    )}
                    onClick={() => {
                      void handleLogout();
                    }}
                  >
                    <LogOut
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    {dashboardContent.actions.logout}
                  </button>
                </motion.div>

                {logoutError ? (
                  <p
                    className="px-2.5 pb-2 text-[11px] text-destructive"
                    role="alert"
                  >
                    {logoutError}
                  </p>
                ) : null}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <DeskLoader variant="overlay" open={loggingOut} label="Signing out…" />
    </>
  );
}
