"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Moon,
  PanelLeftClose,
  Pin,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { cn } from "cn";
import { ChromeButton } from "@/components/ui/chrome-button";
import {
  AnimatedIcon,
  type IconMotionPreset,
} from "@/components/ui/animated-icon";
import { dashboardContent } from "../content";
import { getSessionProfile, type SessionProfile } from "../functions/dashboard";

/** Collapsed rail = icon column. Must stay in sync. */
const ICON_COL = "3.5rem";
const SIDEBAR_H = "h-[calc(100svh-1rem)]";
/**
 * Expanded width — full class strings so Tailwind emits them.
 * Rail, spacer, and aside must all use SIDEBAR_EXPANDED_W.
 */
const SIDEBAR_EXPANDED_W = "w-[13rem]";
const EXPANDED_W = "w-[13rem] translate-x-0";
const COLLAPSED_W =
  "max-md:w-[13rem] max-md:-translate-x-[calc(100%+0.5rem)] md:w-14 md:translate-x-0";

/** Collapse only after the pointer has really left (avoids width-flap jitter). */
const HOVER_LEAVE_MS = 280;

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  motion: IconMotionPreset;
};

const PRIMARY_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: dashboardContent.nav.tonight,
    icon: Sparkles,
    motion: "pulse",
  },
  {
    href: "/dashboard#goals",
    label: dashboardContent.nav.goals,
    icon: Target,
    motion: "tilt",
  },
  {
    href: "/dashboard#reflect",
    label: dashboardContent.nav.reflect,
    icon: BookOpen,
    motion: "rise",
  },
];

const PLATFORM_NAV: NavItem = {
  href: "/activity",
  label: dashboardContent.nav.activity,
  icon: Activity,
  motion: "wiggle",
};

type DashboardSidebarProps = {
  pinned: boolean;
  expanded: boolean;
  onPinClose: () => void;
  onPinOpen: () => void;
  onHoverExpandChange: (hovering: boolean) => void;
};

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href.startsWith("/dashboard#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={item.label}
      onClick={onNavigate}
      className="nocta-nav-pill grid h-10 shrink-0 items-center rounded-lg tracking-tight"
      style={{
        gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)`,
      }}
      data-active={active ? "true" : undefined}
    >
      <span className="nocta-nav-icon flex size-8 items-center justify-center justify-self-center rounded-md">
        <AnimatedIcon
          icon={Icon}
          active={active}
          preset={item.motion}
          tone="neutral"
          inheritColor
        />
      </span>
      <span className="flex items-center truncate pr-3 text-xs leading-none font-medium tracking-tight">
        {item.label}
      </span>
    </Link>
  );
}

function BrandMark({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Link
      href="/dashboard"
      className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
      aria-label={dashboardContent.brand}
      onClick={onNavigate}
    >
      <AnimatedIcon
        icon={Moon}
        className="size-3.5"
        preset="tilt"
        tone="neutral"
        inheritColor
      />
    </Link>
  );
}

/** Matches navbar icon chip — size-10 muted surface in light and dark. */
const SIDEBAR_ICON_CHIP =
  "size-10 shrink-0 rounded-lg border border-border/60 bg-muted/45 text-nocta-ink shadow-none hover:border-border hover:bg-muted/70 dark:border-border dark:bg-muted/50 dark:hover:bg-muted/70";

function SidebarChromeIcon({
  icon,
  preset,
  label,
  onClick,
}: {
  icon: LucideIcon;
  preset: IconMotionPreset;
  label: string;
  onClick: () => void;
}) {
  return (
    <ChromeButton
      iconOnly
      className={SIDEBAR_ICON_CHIP}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <AnimatedIcon
        icon={icon}
        className="size-3.5"
        preset={preset}
        tone="neutral"
      />
    </ChromeButton>
  );
}

/**
 * Fixed viewport sidebar. Hover peeks overlay content — spacer only follows
 * pin, so main content never shifts (that was the jitter).
 * Grid rows keep Platform + profile pinned to the bottom on every route.
 */
export function DashboardSidebar({
  pinned,
  expanded,
  onPinClose,
  onPinOpen,
  onHoverExpandChange,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const leaveTimerRef = useRef<number | null>(null);
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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (!pinned || !mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pinned]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current != null) {
        window.clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current != null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const startHover = () => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    clearLeaveTimer();
    onHoverExpandChange(true);
  };

  const endHover = () => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    clearLeaveTimer();
    leaveTimerRef.current = window.setTimeout(() => {
      leaveTimerRef.current = null;
      onHoverExpandChange(false);
    }, HOVER_LEAVE_MS);
  };

  const closeIfMobile = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      onPinClose();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar backdrop"
        tabIndex={pinned ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-nocta-night/50 backdrop-blur-sm md:hidden",
          "transition-opacity duration-300 ease-out",
          pinned ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onPinClose}
      />

      {/* Spacer follows pin only — hover peek overlays, does not shove page content */}
      <div
        className={cn(
          "hidden shrink-0 md:block",
          pinned ? SIDEBAR_EXPANDED_W : "w-14",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "fixed top-2 left-2 z-50",
          SIDEBAR_H,
          "overflow-hidden transition-[width,transform,box-shadow] duration-300 ease-out",
          expanded ? EXPANDED_W : COLLAPSED_W,
          !pinned && expanded && "shadow-md",
        )}
        onMouseEnter={startHover}
        onMouseLeave={endHover}
      >
        <aside
          className={cn("nocta-sidebar grid py-3", SIDEBAR_EXPANDED_W, SIDEBAR_H)}
          style={{
            gridTemplateRows: "auto auto auto minmax(0, 1fr) auto",
          }}
          data-collapsed={expanded ? undefined : "true"}
        >
          {/* Brand */}
          <div
            className="mb-4 grid items-center"
            style={{ gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)` }}
          >
            <div className="flex items-center justify-center">
              <BrandMark onNavigate={closeIfMobile} />
            </div>

            <div className="flex min-w-0 items-center justify-between gap-2 pr-3">
              <div className="min-w-0">
                <p className="text-[10px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  {dashboardContent.sidebar.eyebrow}
                </p>
                <p className="mt-1 truncate font-sans text-sm leading-none font-semibold tracking-tight text-nocta-ink">
                  {dashboardContent.brand}
                </p>
              </div>

              {pinned ? (
                <SidebarChromeIcon
                  icon={PanelLeftClose}
                  preset="nudge"
                  label={dashboardContent.actions.closeSidebar}
                  onClick={onPinClose}
                />
              ) : (
                <SidebarChromeIcon
                  icon={Pin}
                  preset="tilt"
                  label="Keep sidebar open"
                  onClick={onPinOpen}
                />
              )}
            </div>
          </div>

          {/* Rule */}
          <div
            className="mb-3 grid items-center"
            style={{ gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)` }}
            aria-hidden
          >
            <div className="flex justify-center">
              <div className="h-px w-6 bg-border/80" />
            </div>
            <div className="pr-3">
              <div className="h-px w-full bg-border/80" />
            </div>
          </div>

          {/* Nav label */}
          <p
            className="mb-2 truncate pr-3 text-[10px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase"
            style={{ paddingLeft: ICON_COL }}
          >
            {dashboardContent.sidebar.navLabel}
          </p>

          {/* Primary nav — only this row scrolls */}
          <nav
            className={cn(
              "flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain",
              expanded && "px-2",
            )}
            aria-label="Primary"
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={closeIfMobile}
              />
            ))}
          </nav>

          {/* Footer — always last grid row, never clipped by page length */}
          <footer
            className={cn(
              "flex flex-col gap-2 border-t border-border/50 pt-3",
              expanded && "px-2",
            )}
          >
            <p
              className={cn(
                "px-1 text-[10px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase",
                !expanded &&
                  "pointer-events-none invisible h-0 overflow-hidden p-0",
              )}
            >
              {dashboardContent.sidebar.workspaceLabel}
            </p>

            <NavLink
              item={PLATFORM_NAV}
              pathname={pathname}
              onNavigate={closeIfMobile}
            />

            <div
              className="grid h-11 items-center rounded-lg border border-border/50 bg-muted/35 px-0 transition-colors duration-150 hover:bg-muted/55 dark:border-border dark:bg-muted/40 dark:hover:bg-muted/60"
              style={{
                gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)`,
              }}
              title={profile.email ?? profile.name}
            >
              <span className="flex size-8 items-center justify-center justify-self-center rounded-md bg-primary text-[10px] font-semibold tracking-wide text-primary-foreground">
                {profile.initials}
              </span>
              <span
                className={cn(
                  "min-w-0 pr-2",
                  !expanded && "pointer-events-none invisible",
                )}
              >
                <span className="block truncate text-xs leading-tight font-medium tracking-tight text-nocta-ink">
                  {profile.name}
                </span>
                <span className="mt-0.5 block truncate text-[10px] leading-tight tracking-tight text-muted-foreground">
                  {profile.email ?? dashboardContent.sidebar.profileLabel}
                </span>
              </span>
            </div>
          </footer>
        </aside>
      </div>
    </>
  );
}
