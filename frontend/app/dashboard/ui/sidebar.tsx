"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Moon,
  PanelLeftClose,
  Pin,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "cn";
import { ChromeButton } from "@/components/ui/chrome-button";
import { dashboardContent } from "../content";
import {
  getSessionProfile,
  type SessionProfile,
} from "../functions/dashboard";

/** Collapsed rail = icon column. Must stay in sync. */
const ICON_COL = "3.5rem";
const SIDEBAR_H = "h-[calc(100svh-1rem)]";
/** Full class strings — Tailwind won't emit `md:${var}` template classes. */
const EXPANDED_W = "w-[15.5rem] translate-x-0";
const COLLAPSED_W =
  "max-md:w-[15.5rem] max-md:-translate-x-[calc(100%+0.5rem)] md:w-14 md:translate-x-0";

/** Collapse only after the pointer has really left (avoids width-flap jitter). */
const HOVER_LEAVE_MS = 280;

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const PRIMARY_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: dashboardContent.nav.tonight,
    icon: Sparkles,
  },
  {
    href: "/dashboard#goals",
    label: dashboardContent.nav.goals,
    icon: Target,
  },
  {
    href: "/dashboard#reflect",
    label: dashboardContent.nav.reflect,
    icon: BookOpen,
  },
];

const PLATFORM_NAV: NavItem = {
  href: "/activity",
  label: dashboardContent.nav.activity,
  icon: Activity,
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
      className="nocta-nav-pill grid h-10 shrink-0 items-center rounded-md"
      style={{
        gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)`,
      }}
      data-active={active ? "true" : undefined}
    >
      <span className="nocta-nav-icon flex size-8 items-center justify-center justify-self-center rounded-md">
        <Icon className="size-3.5 shrink-0" aria-hidden />
      </span>
      <span className="flex items-center truncate pr-3 text-xs leading-none">
        {item.label}
      </span>
    </Link>
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
          pinned ? "w-62" : "w-14",
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
          className={cn(
            "nocta-sidebar grid w-62 py-3",
            SIDEBAR_H,
          )}
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
              <Link
                href="/dashboard"
                className="flex size-8 items-center justify-center rounded-sm bg-nocta-ink text-nocta-paper"
                aria-label={dashboardContent.brand}
                onClick={closeIfMobile}
              >
                <Moon className="size-3.5" aria-hidden />
              </Link>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-2 pr-3">
              <div className="min-w-0">
                <p className="text-[10px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  {dashboardContent.sidebar.eyebrow}
                </p>
                <p className="mt-1 truncate font-sans text-sm leading-none font-semibold tracking-[-0.02em] text-nocta-ink">
                  {dashboardContent.brand}
                </p>
              </div>

              {pinned ? (
                <ChromeButton
                  iconOnly
                  className="size-8 shrink-0 rounded-md"
                  aria-label={dashboardContent.actions.closeSidebar}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinClose();
                  }}
                >
                  <PanelLeftClose className="size-4" />
                </ChromeButton>
              ) : (
                <ChromeButton
                  iconOnly
                  className="size-8 shrink-0 rounded-md"
                  aria-label="Keep sidebar open"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinOpen();
                  }}
                >
                  <Pin className="size-3.5" />
                </ChromeButton>
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
          <div
            className={cn(
              "flex flex-col gap-2 border-t border-border/70 pt-3",
              expanded && "px-2",
            )}
          >
            <p
              className={cn(
                "px-1 text-[10px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase",
                !expanded && "pointer-events-none invisible h-0 overflow-hidden p-0",
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
              className="grid h-11 items-center rounded-md border border-border/80 px-0"
              style={{
                gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)`,
              }}
              title={profile.email ?? profile.name}
            >
              <span className="flex size-8 items-center justify-center justify-self-center rounded-sm bg-nocta-ink text-[10px] font-semibold tracking-wide text-nocta-paper">
                {profile.initials}
              </span>
              <span
                className={cn(
                  "min-w-0 pr-2",
                  !expanded && "pointer-events-none invisible",
                )}
              >
                <span className="block truncate text-xs leading-tight font-medium text-nocta-ink">
                  {profile.name}
                </span>
                <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground">
                  {profile.email ?? dashboardContent.sidebar.profileLabel}
                </span>
              </span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
