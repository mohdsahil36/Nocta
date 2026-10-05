"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  LayoutDashboard,
  PanelLeftClose,
  Pin,
  Target,
  type LucideIcon,
} from "lucide-react";

import { cn } from "cn";
import { ChromeButton } from "@/components/ui/chrome-button";
import {
  AnimatedIcon,
  type IconMotionPreset,
} from "@/components/ui/animated-icon";
import { NoctaMark } from "@/components/ui/nocta-mark";
import { dashboardContent } from "../content";
import { getSessionProfile, type SessionProfile } from "../functions/dashboard";

const SIDEBAR_H = "h-svh";
const SIDEBAR_EXPANDED_W = "w-[15rem]";
const EXPANDED_W = "w-[15rem] translate-x-0";
const COLLAPSED_W =
  "max-md:w-[15rem] max-md:-translate-x-full md:w-14 md:translate-x-0";
const HOVER_LEAVE_MS = 280;

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  motion: IconMotionPreset;
};

const TOP_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: dashboardContent.nav.dashboard,
    icon: LayoutDashboard,
    motion: "nudge",
  },
];

const PLAN_NAV: NavItem[] = [
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

const WORKSPACE_NAV: NavItem[] = [
  {
    href: "/activity",
    label: dashboardContent.nav.activity,
    icon: Activity,
    motion: "wiggle",
  },
];

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
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
  collapsed: boolean;
}) {
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={item.label}
      onClick={onNavigate}
      className={cn(
        "nocta-nav-pill flex h-9 shrink-0 items-center gap-2.5 rounded-lg px-2.5 tracking-tight",
        collapsed && "mx-auto size-9 justify-center gap-0 rounded-md p-0",
      )}
      data-active={active ? "true" : undefined}
    >
      <span className="nocta-nav-icon flex size-5 shrink-0 items-center justify-center">
        <AnimatedIcon
          icon={Icon}
          active={active}
          preset={item.motion}
          tone="neutral"
          inheritColor
          className="size-4"
        />
      </span>
      {!collapsed ? (
        <span className="truncate text-[13px] leading-none font-medium tracking-tight">
          {item.label}
        </span>
      ) : (
        <span className="sr-only">{item.label}</span>
      )}
    </Link>
  );
}

function SectionLabel({
  children,
  hidden,
}: {
  children: string;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <p className="mt-4 mb-1.5 px-2.5 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

/**
 * Blueprint-style sidebar — brand row, section groups, flush rail.
 * Pin / hover peek behavior unchanged.
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
  const collapsed = !expanded;
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
          "fixed inset-0 z-40 bg-nocta-night/40 md:hidden",
          "transition-opacity duration-300 ease-out",
          pinned ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onPinClose}
      />

      <div
        className={cn(
          "hidden shrink-0 md:block",
          pinned ? SIDEBAR_EXPANDED_W : "w-14",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50",
          SIDEBAR_H,
          "overflow-hidden transition-[width,transform] duration-300 ease-out",
          expanded ? EXPANDED_W : COLLAPSED_W,
        )}
        onMouseEnter={startHover}
        onMouseLeave={endHover}
      >
        <aside
          className={cn("nocta-sidebar flex h-full w-full flex-col")}
          data-collapsed={collapsed ? "true" : undefined}
        >
          {/* Brand — icon only when collapsed */}
          <div
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 px-3",
              collapsed && "justify-center px-0",
            )}
          >
            <Link
              href="/dashboard"
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-nocta-ink"
              aria-label={dashboardContent.brand}
              onClick={closeIfMobile}
            >
              <NoctaMark className="size-4" />
            </Link>
            {!collapsed ? (
              <>
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-tight text-nocta-ink">
                  {dashboardContent.brand}
                </span>
                <ChromeButton
                  iconOnly
                  className="size-7 rounded-md"
                  aria-label={
                    pinned
                      ? dashboardContent.actions.closeSidebar
                      : dashboardContent.actions.pinSidebar
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pinned) onPinClose();
                    else onPinOpen();
                  }}
                >
                  <AnimatedIcon
                    icon={pinned ? PanelLeftClose : Pin}
                    className="size-3.5"
                    preset="nudge"
                    tone="neutral"
                  />
                </ChromeButton>
              </>
            ) : null}
          </div>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2 pb-2",
              collapsed && "items-center px-1",
            )}
          >
            <nav
              className={cn(
                "flex flex-col gap-0.5",
                collapsed && "w-full items-center",
              )}
              aria-label="Primary"
            >
              {TOP_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeIfMobile}
                  collapsed={collapsed}
                />
              ))}
            </nav>

            <SectionLabel hidden={collapsed}>
              {dashboardContent.sidebar.planLabel}
            </SectionLabel>
            <nav
              className={cn(
                "flex flex-col gap-0.5",
                collapsed && "w-full items-center",
              )}
              aria-label="Plan"
            >
              {PLAN_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeIfMobile}
                  collapsed={collapsed}
                />
              ))}
            </nav>

            <SectionLabel hidden={collapsed}>
              {dashboardContent.sidebar.workspaceLabel}
            </SectionLabel>
            <nav
              className={cn(
                "flex flex-col gap-0.5",
                collapsed && "w-full items-center",
              )}
              aria-label="Workspace"
            >
              {WORKSPACE_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeIfMobile}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </div>

          <footer
            className={cn(
              "mt-auto shrink-0 border-t border-border px-2 py-2",
              collapsed && "flex justify-center px-1",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
                collapsed && "justify-center px-0",
              )}
              title={profile.email ?? profile.name}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                {profile.initials}
              </span>
              {!collapsed ? (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] leading-tight font-medium text-nocta-ink">
                    {profile.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground">
                    {profile.email ?? dashboardContent.sidebar.profileLabel}
                  </span>
                </span>
              ) : null}
            </div>
          </footer>
        </aside>
      </div>
    </>
  );
}
