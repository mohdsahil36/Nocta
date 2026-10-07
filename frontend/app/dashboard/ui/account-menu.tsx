"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { DeskLoader } from "@/components/ui/desk-loader";
import { NoctaThemeToggler } from "@/components/ui/nocta-theme-toggler";
import { Separator } from "@/components/ui/separator";
import { BEFORE_AUTH_PATH, logout } from "@/app/login/functions/auth";
import { cn } from "cn";

import { dashboardContent } from "../content";
import { getSessionProfile, type SessionProfile } from "../functions/dashboard";

const easeOut = [0.22, 1, 0.36, 1] as const;

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
            "flex w-full items-center gap-2.5 rounded-sm outline-none",
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
                className="rounded-sm border border-border bg-card"
              >
                <motion.div
                  className="flex items-center justify-between gap-2 px-2.5 py-2"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.2, delay: 0.08, ease: easeOut }
                  }
                >
                  <span className="text-[12px] text-nocta-ink">
                    {dashboardContent.account.theme}
                  </span>
                  <NoctaThemeToggler
                    aria-label={dashboardContent.account.theme}
                    className={cn(
                      "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm",
                      "text-muted-foreground hover:bg-muted/60 hover:text-nocta-ink",
                      "transition-colors duration-150",
                      "[&_svg]:size-3.5",
                    )}
                  />
                </motion.div>

                <Separator />

                <motion.div
                  className="p-1"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.2, delay: 0.14, ease: easeOut }
                  }
                >
                  <button
                    type="button"
                    disabled={loggingOut}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-sm px-2 py-2",
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
